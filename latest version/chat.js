console.log('Script başlatılıyor...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM yüklendi, başlatılıyor...');
    
    try {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Giriş durumu:', isLoggedIn);
        
        if (!isLoggedIn || !currentUser) {
            console.log('Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor...');
            window.location.href = 'giris.html';
            return;
        }

        const chatMessages = document.querySelector('.chat-messages');
        const chatInput = document.querySelector('.chat-input textarea');
        const sendButton = document.querySelector('.chat-input button');

        if (!chatMessages || !chatInput || !sendButton) {
            console.error('Gerekli DOM elementleri bulunamadı:', {
                chatMessages: !!chatMessages,
                chatInput: !!chatInput,
                sendButton: !!sendButton
            });
            return;
        }

        console.log('DOM elementleri başarıyla bulundu');

        const API_KEY = 'your-key';
        const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
        let retryCount = 0;
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 2000; // 2 seconds
        const TIMEOUT_DURATION = 60000; // 60 seconds

        // Sohbet geçmişini saklamak için dizi
        let chatHistory = [];

        // API anahtarını doğrula
        async function validateApiKey() {
            console.log('API anahtarı doğrulanıyor...');
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
                console.log('API yanıt durumu:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Anahtarı Doğrulama Hatası:', errorData);
                    addMessage('API anahtarı doğrulanamadı. Lütfen Google Cloud Console\'da API\'nin etkin olduğundan ve faturalandırma hesabının bağlı olduğundan emin olun.', 'ai');
                    return false;
                }
                console.log('API anahtarı doğrulandı');
                return true;
            } catch (error) {
                console.error('API Anahtarı Doğrulama Hatası:', error);
                addMessage('API anahtarı doğrulanamadı. Lütfen internet bağlantınızı kontrol edin.', 'ai');
                return false;
            }
        }

        // Sayfa yüklendiğinde API anahtarını doğrula
        validateApiKey();

        async function sendMessage() {
            console.log('Mesaj gönderme işlemi başlatılıyor...');
            const message = chatInput.value.trim();
            if (!message) {
                console.log('Boş mesaj, işlem iptal edildi');
                return;
            }

            // API anahtarını her mesaj gönderiminde doğrula
            const isValid = await validateApiKey();
            if (!isValid) {
                console.log('API anahtarı geçersiz, işlem iptal edildi');
                return;
            }

            console.log('Gönderilen mesaj:', message);
            addMessage(message, 'user');
            chatInput.value = '';

            // Kullanıcı mesajını geçmişe ekle
            chatHistory.push({
                role: 'user',
                content: message
            });

            const loadingMessage = addLoadingMessage();

            try {
                console.log('API isteği gönderiliyor...');
                const requestBody = {
                    contents: chatHistory.map(msg => ({
                        role: msg.role,
                        parts: [{
                            text: msg.content
                        }]
                    })),
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                };

                console.log('İstek gövdesi:', JSON.stringify(requestBody, null, 2));
                console.log('API URL:', API_URL);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log('API yanıt durumu:', response.status);
                console.log('API yanıt başlıkları:', Object.fromEntries(response.headers.entries()));
                
                const responseText = await response.text();
                console.log('API yanıt metni:', responseText);
                
                if (!response.ok) {
                    console.error('API hatası:', responseText);
                    
                    // 503 hatası için yeniden deneme
                    if (response.status === 503 && retryCount < MAX_RETRIES) {
                        retryCount++;
                        console.log(`Yeniden deneme ${retryCount}/${MAX_RETRIES}...`);
                        loadingMessage.querySelector('.message-content').textContent = `Yeniden deneniyor (${retryCount}/${MAX_RETRIES})...`;
                        
                        // Belirli bir süre bekle ve tekrar dene
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                        return sendMessage();
                    }
                    
                    throw new Error(`API error: ${response.status} - ${responseText}`);
                }

                // Başarılı yanıt alındığında retry sayacını sıfırla
                retryCount = 0;

                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('API yanıtı (JSON):', data);
                } catch (e) {
                    console.error('JSON ayrıştırma hatası:', e);
                    throw new Error('Invalid JSON response');
                }

                loadingMessage.remove();

                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const aiResponse = data.candidates[0].content.parts[0].text;
                    console.log('AI yanıtı:', aiResponse);
                    addMessage(aiResponse, 'ai');
                    
                    // AI yanıtını geçmişe ekle
                    chatHistory.push({
                        role: 'model',
                        content: aiResponse
                    });

                    // Geçmişi 10 mesajla sınırla
                    if (chatHistory.length > 10) {
                        chatHistory = chatHistory.slice(-10);
                    }
                } else {
                    console.error('Geçersiz API yanıt formatı:', data);
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.error('Hata detayı:', error);
                loadingMessage.remove();
                
                let errorMessage = 'Üzgünüm, bir hata oluştu. ';
                if (error.name === 'AbortError') {
                    errorMessage += 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
                } else if (error.message.includes('503')) {
                    errorMessage += 'Model şu anda yoğun. Lütfen biraz sonra tekrar deneyin.';
                } else if (error.message.includes('403')) {
                    errorMessage += 'API erişim izni reddedildi. Lütfen API anahtarınızı ve izinlerinizi kontrol edin.';
                } else if (error.message.includes('401')) {
                    errorMessage += 'Geçersiz API anahtarı. Lütfen API anahtarınızı kontrol edin.';
                } else {
                    errorMessage += 'Lütfen tekrar deneyin. Hata: ' + error.message;
                }
                
                addMessage(errorMessage, 'ai');
            }
        }

        function addMessage(text, type) {
            console.log(`${type} mesajı ekleniyor:`, text);
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            // Markdown formatını destekle
            if (type === 'ai') {
                contentDiv.innerHTML = formatMarkdown(text);
            } else {
                contentDiv.textContent = text;
            }
            
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            return messageDiv;
        }

        function addLoadingMessage() {
            console.log('Yükleniyor mesajı ekleniyor...');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai loading';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = 'Düşünüyorum...';
            
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            return messageDiv;
        }

        // Markdown formatını HTML'e çevir
        function formatMarkdown(text) {
            // Başlıklar
            text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
            text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
            text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
            
            // Kalın ve italik
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Listeler
            text = text.replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
            
            // Kod blokları
            text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Paragraflar
            text = text.replace(/\n\n/g, '</p><p>');
            text = '<p>' + text + '</p>';
            
            return text;
        }

        console.log('Event listener\'lar ekleniyor...');
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        console.log('Hoş geldin mesajı ekleniyor...');
        addMessage('Merhaba! Size nasıl yardımcı olabilirim?', 'ai');
        console.log('Başlatma tamamlandı');
    } catch (error) {
        console.error('Başlatma sırasında hata oluştu:', error);
    }
}); 