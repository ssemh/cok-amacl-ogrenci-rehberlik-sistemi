document.addEventListener('DOMContentLoaded', () => {
    // Analiz türü seçimi
    const analysisTypeBtns = document.querySelectorAll('.analysis-type-btn');
    const analysisForms = document.querySelectorAll('.analysis-form');

    analysisTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Aktif butonu güncelle
            analysisTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // İlgili formu göster
            const type = btn.dataset.type;
            analysisForms.forEach(form => {
                form.classList.remove('active');
                if (form.classList.contains(`${type}-analiz`)) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Konu analizi için ders seçimi
    const dersSelect = document.getElementById('ders');
    const konuSelect = document.getElementById('konu');

    dersSelect.addEventListener('change', () => {
        const ders = dersSelect.value;
        konuSelect.innerHTML = '<option value="">Konu Seçiniz</option>';

        if (ders) {
            // Derslere göre konuları yükle
            const konular = getKonularByDers(ders);
            konular.forEach(konu => {
            const option = document.createElement('option');
                option.value = konu;
            option.textContent = konu;
            konuSelect.appendChild(option);
            });
        }
    });

    // Deneme analizi için tarih kontrolü
    const denemeTarihi = document.getElementById('denemeTarihi');
    denemeTarihi.value = new Date().toISOString().split('T')[0];

    // Analiz butonları
    const analyzeBtns = document.querySelectorAll('.analyze-btn');
    analyzeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeForm = document.querySelector('.analysis-form.active');
            if (activeForm.classList.contains('konu-analiz')) {
                konuAnaliziYap();
            } else {
                denemeAnaliziYap();
            }
        });
    });

    // Konu analizi fonksiyonu
    function konuAnaliziYap() {
        const total = parseInt(document.getElementById('total').value);
        const correct = parseInt(document.getElementById('correct').value);
        const incorrect = parseInt(document.getElementById('incorrect').value);
        const empty = parseInt(document.getElementById('empty').value);

        if (total !== correct + incorrect + empty) {
            alert('Toplam soru sayısı, doğru, yanlış ve boş sayılarının toplamına eşit olmalıdır!');
            return;
        }

        const basariOrani = (correct / total) * 100;
        const net = correct - (incorrect / 4);
        const yanlisEtkisi = (incorrect / total) * 100;

        sonuclariGoster({
            basariOrani,
            net,
            yanlisEtkisi,
            tahminiPuan: net * 2.5 // Örnek hesaplama
        });
    }

    // Deneme analizi fonksiyonu
    function denemeAnaliziYap() {
        const total = parseInt(document.getElementById('denemeTotal').value);
        const correct = parseInt(document.getElementById('denemeCorrect').value);
        const incorrect = parseInt(document.getElementById('denemeIncorrect').value);
        const empty = parseInt(document.getElementById('denemeEmpty').value);

        if (total !== correct + incorrect + empty) {
            alert('Toplam soru sayısı, doğru, yanlış ve boş sayılarının toplamına eşit olmalıdır!');
            return;
        }

        const basariOrani = (correct / total) * 100;
        const net = correct - (incorrect / 4);
        const yanlisEtkisi = (incorrect / total) * 100;

        sonuclariGoster({
            basariOrani,
            net,
            yanlisEtkisi,
            tahminiPuan: net * 2.5 // Örnek hesaplama
        });
    }

    // Sonuçları gösterme fonksiyonu
    function sonuclariGoster(sonuclar) {
        document.getElementById('successRate').textContent = `${sonuclar.basariOrani.toFixed(2)}%`;
        document.getElementById('netCount').textContent = sonuclar.net.toFixed(2);
        document.getElementById('wrongEffect').textContent = `${sonuclar.yanlisEtkisi.toFixed(2)}%`;
        document.getElementById('estimatedScore').textContent = sonuclar.tahminiPuan.toFixed(2);

        // Sonuçları kaydetme butonunu aktif et
        document.getElementById('saveResult').disabled = false;
    }

    // Sonuçları kaydetme
    document.getElementById('saveResult').addEventListener('click', () => {
        const activeForm = document.querySelector('.analysis-form.active');
        const isKonuAnalizi = activeForm.classList.contains('konu-analiz');

        const sonuc = {
            tarih: new Date().toISOString(),
            tur: isKonuAnalizi ? 'konu' : 'deneme',
            ders: isKonuAnalizi ? dersSelect.value : document.getElementById('denemeTuru').value,
            konu: isKonuAnalizi ? konuSelect.value : document.getElementById('denemeAdi').value,
            toplam: parseInt(isKonuAnalizi ? document.getElementById('total').value : document.getElementById('denemeTotal').value),
            dogru: parseInt(isKonuAnalizi ? document.getElementById('correct').value : document.getElementById('denemeCorrect').value),
            yanlis: parseInt(isKonuAnalizi ? document.getElementById('incorrect').value : document.getElementById('denemeIncorrect').value),
            bos: parseInt(isKonuAnalizi ? document.getElementById('empty').value : document.getElementById('denemeEmpty').value),
            net: parseFloat(document.getElementById('netCount').textContent),
            basari: parseFloat(document.getElementById('successRate').textContent)
        };

        // Sonuçları localStorage'a kaydet
        let sonuclar = JSON.parse(localStorage.getItem('analizSonuclari')) || [];
        sonuclar.push(sonuc);
        localStorage.setItem('analizSonuclari', JSON.stringify(sonuclar));

        // Geçmiş sonuçları güncelle
        gecmisSonuclariGoster();
    });

    // Geçmiş sonuçları gösterme
    function gecmisSonuclariGoster() {
        const tbody = document.getElementById('resultsTableBody');
        tbody.innerHTML = '';

        const sonuclar = JSON.parse(localStorage.getItem('analizSonuclari')) || [];
        const filterDers = document.getElementById('filterDers').value;

        const filtrelenmisSonuclar = sonuclar.filter(sonuc => {
            if (!filterDers) return true;
            return sonuc.ders === filterDers;
        });

        filtrelenmisSonuclar.forEach(sonuc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(sonuc.tarih).toLocaleDateString('tr-TR')}</td>
                <td>${sonuc.ders}</td>
                <td>${sonuc.konu}</td>
                <td>${sonuc.toplam}</td>
                <td>${sonuc.dogru}</td>
                <td>${sonuc.yanlis}</td>
                <td>${sonuc.bos}</td>
                <td>${sonuc.net.toFixed(2)}</td>
                <td>${sonuc.basari.toFixed(2)}%</td>
                <td>
                    <button class="btn btn-danger" onclick="sonucSil('${sonuc.tarih}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
    });

        // Grafik oluştur
        grafikOlustur(filtrelenmisSonuclar);
    }

    // Grafik oluşturma
    function grafikOlustur(sonuclar) {
        const ctx = document.getElementById('resultChart').getContext('2d');
        const chartContainer = document.getElementById('chartContainer');
        
        if (sonuclar.length === 0) {
            chartContainer.style.display = 'none';
            return;
        }

        chartContainer.style.display = 'block';

        const labels = sonuclar.map(sonuc => new Date(sonuc.tarih).toLocaleDateString('tr-TR'));
        const netler = sonuclar.map(sonuc => sonuc.net);

        // Mevcut grafiği temizle
        if (window.myChart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net',
                        data: netler,
                        borderColor: '#4a6bff',
                        backgroundColor: 'rgba(74, 107, 255, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#4a6bff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Net Grafiği',
                        font: {
                            size: 18,
                            family: "'Poppins', sans-serif",
                            weight: 'bold'
                        },
                        padding: {
                            top: 20,
                            bottom: 20
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        },
                        bodyFont: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Net: ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            },
                            padding: 10
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            },
                            padding: 10
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            }
        });
    }

    // Sonuç silme fonksiyonu
    window.sonucSil = function(tarih) {
        if (confirm('Bu sonucu silmek istediğinizden emin misiniz?')) {
            let sonuclar = JSON.parse(localStorage.getItem('analizSonuclari')) || [];
            sonuclar = sonuclar.filter(sonuc => sonuc.tarih !== tarih);
            localStorage.setItem('analizSonuclari', JSON.stringify(sonuclar));
            gecmisSonuclariGoster();
        }
    };

    // Filtre değişikliğini dinle
    document.getElementById('filterDers').addEventListener('change', gecmisSonuclariGoster);

    // Sayfa yüklendiğinde geçmiş sonuçları göster
    gecmisSonuclariGoster();
});

// Derslere göre konuları döndüren fonksiyon
function getKonularByDers(ders) {
    const konular = {
        matematik: [
            'Temel Kavramlar',
            'Sayılar',
            'Rasyonel Sayılar',
            'Eşitsizlikler',
            'Mutlak Değer',
            'Üslü Sayılar',
            'Köklü Sayılar',
            'Çarpanlara Ayırma',
            'Oran-Orantı',
            'Denklemler',
            'Problemler'
        ],
        fizik: [
            'Fizik Bilimine Giriş',
            'Madde ve Özellikleri',
            'Hareket ve Kuvvet',
            'Enerji',
            'Isı ve Sıcaklık',
            'Elektrostatik',
            'Elektrik Akımı',
            'Manyetizma',
            'Dalgalar',
            'Optik'
        ],
        kimya: [
            'Kimya Bilimi',
            'Atom ve Yapısı',
            'Periyodik Sistem',
            'Kimyasal Bağlar',
            'Kimyasal Tepkimeler',
            'Kimyasal Hesaplamalar',
            'Gazlar',
            'Çözeltiler',
            'Kimyasal Tepkimelerde Enerji',
            'Kimyasal Tepkimelerde Hız'
        ],
        biyoloji: [
            'Canlıların Yapısı',
            'Hücre',
            'Canlıların Sınıflandırılması',
            'Ekoloji',
            'Kalıtım',
            'Ekosistem',
            'Bitki Biyolojisi',
            'İnsan Fizyolojisi',
            'Davranış',
            'Popülasyon Genetiği'
        ],
        turkce: [
            'Sözcükte Anlam',
            'Cümlede Anlam',
            'Paragrafta Anlam',
            'Sözcük Türleri',
            'Fiiller',
            'Cümlenin Öğeleri',
            'Cümle Türleri',
            'Anlatım Bozuklukları',
            'Yazım Kuralları',
            'Noktalama İşaretleri'
        ],
        tarih: [
            'Tarih Bilimi',
            'İlk Uygarlıklar',
            'İlk Türk Devletleri',
            'İslam Tarihi ve Uygarlığı',
            'Türk-İslam Devletleri',
            'Osmanlı Devleti Kuruluş Dönemi',
            'Osmanlı Devleti Yükselme Dönemi',
            'Osmanlı Devleti Duraklama ve Gerileme Dönemi',
            'Osmanlı Devleti Dağılma Dönemi',
            'Kurtuluş Savaşı',
            'Atatürk Dönemi',
            'Çağdaş Türk ve Dünya Tarihi'
        ],
        cografya: [
            'Doğal Sistemler',
            'Beşeri Sistemler',
            'Mekansal Sentez',
            'Küresel Ortam',
            'Çevre ve Toplum',
            'Türkiye\'nin Coğrafi Konumu',
            'Türkiye\'nin Yer Şekilleri',
            'Türkiye\'nin İklimi',
            'Türkiye\'nin Nüfusu',
            'Türkiye\'nin Ekonomik Coğrafyası',
            'Türkiye\'nin Bölgeleri'
        ],
        felsefe: [
            'Felsefeye Giriş',
            'Bilgi Felsefesi',
            'Varlık Felsefesi',
            'Ahlak Felsefesi',
            'Sanat Felsefesi',
            'Din Felsefesi',
            'Siyaset Felsefesi',
            'Bilim Felsefesi',
            'Mantık',
            'Psikoloji',
            'Sosyoloji'
        ],
        edebiyat: [
            'Edebiyat Bilimi',
            'Şiir Bilgisi',
            'Nesir Bilgisi',
            'Türk Edebiyatı Tarihi',
            'Divan Edebiyatı',
            'Halk Edebiyatı',
            'Tanzimat Edebiyatı',
            'Servet-i Fünun Edebiyatı',
            'Milli Edebiyat',
            'Cumhuriyet Dönemi Edebiyatı',
            'Dünya Edebiyatı'
        ],
        sosyoloji: [
            'Sosyolojiye Giriş',
            'Sosyolojinin Alanı',
            'Sosyolojik Araştırma Yöntemleri',
            'Toplumsal Yapı',
            'Toplumsal İlişkiler',
            'Toplumsal Değişme',
            'Kültür',
            'Toplumsal Kurumlar',
            'Toplumsal Tabakalaşma',
            'Toplumsal Hareketler',
            'Kentleşme ve Göç',
            'Toplumsal Sorunlar'
        ],
        psikoloji: [
            'Psikolojiye Giriş',
            'Psikolojinin Alanları',
            'Psikolojide Araştırma Yöntemleri',
            'Öğrenme Psikolojisi',
            'Gelişim Psikolojisi',
            'Sosyal Psikoloji',
            'Kişilik Psikolojisi',
            'Duyum ve Algı',
            'Bellek ve Düşünme',
            'Motivasyon ve Heyecan',
            'Normal Dışı Davranışlar',
            'Psikolojik Danışma ve Rehberlik'
        ],
        ingilizce: [
            'Temel Dil Bilgisi',
            'Zamanlar (Tenses)',
            'Edatlar (Prepositions)',
            'Bağlaçlar (Conjunctions)',
            'Sıfatlar ve Zarflar (Adjectives & Adverbs)',
            'İsimler ve Zamirler (Nouns & Pronouns)',
            'Fiiller ve Fiilimsiler (Verbs & Verbals)',
            'Cümle Yapıları (Sentence Structures)',
            'Koşul Cümleleri (Conditionals)',
            'Edilgen Yapı (Passive Voice)',
            'Dolaylı Anlatım (Reported Speech)',
            'Kelime Bilgisi (Vocabulary)',
            'Okuma Anlama (Reading Comprehension)',
            'Yazma Becerileri (Writing Skills)',
            'Dinleme Becerileri (Listening Skills)',
            'Konuşma Becerileri (Speaking Skills)'
        ]
    };

    return konular[ders] || [];
}