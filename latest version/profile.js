// Tab geçişleri
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif tab'ı kaldır
            document.querySelector('.tab-btn.active').classList.remove('active');
            document.querySelector('.tab-content.active').classList.remove('active');

            // Yeni tab'ı aktif yap
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Profil fotoğrafı değiştirme
    const changePhotoBtn = document.querySelector('.change-photo-btn');
    const profileImage = document.querySelector('.profile-image');

    changePhotoBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    });

    // Ders filtreleme işlevselliği
    const subjectButtons = document.querySelectorAll('.subject-btn');
    const progressItems = document.querySelectorAll('.progress-item');

    // Derslere göre aktivite verileri
    const subjectActivities = {
        'all': [45, 60, 30, 75, 90, 120, 60],
        'math': [60, 45, 75, 90, 60, 45, 30],
        'physics': [30, 45, 60, 30, 45, 60, 30],
        'chemistry': [45, 30, 45, 60, 30, 45, 60],
        'biology': [60, 75, 60, 45, 60, 75, 60],
        'turkish': [90, 60, 45, 60, 90, 60, 45],
        'history': [45, 60, 75, 45, 60, 75, 45],
        'geography': [60, 45, 60, 75, 45, 60, 75],
        'philosophy': [30, 45, 30, 45, 30, 45, 30]
    };

    // Haftalık aktivite grafiği
    const ctx = document.getElementById('weeklyActivity').getContext('2d');
    const weeklyActivityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
            datasets: [{
                label: 'Aktivite Süresi (dk)',
                data: subjectActivities['all'],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    subjectButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Aktif buton stilini güncelle
            subjectButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedSubject = this.dataset.subject;

            // İlerleme öğelerini filtrele
            progressItems.forEach(item => {
                if (selectedSubject === 'all' || item.dataset.subject === selectedSubject) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            // Grafik verilerini güncelle
            weeklyActivityChart.data.datasets[0].data = subjectActivities[selectedSubject];
            weeklyActivityChart.update();
        });
    });

    // Ayarlar sekmesi için fonksiyonlar
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const theme = this.querySelector('.theme-preview').classList.contains('light') ? 'light' : 'dark';
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        });
    });

    // Toggle switch'ler için fonksiyon
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(switch_ => {
        switch_.addEventListener('change', function() {
            const setting = this.closest('.toggle-item').querySelector('span').textContent;
            localStorage.setItem(setting, this.checked);
        });
    });

    // Profil bilgilerini güncelleme
    const profileForm = document.querySelector('.settings-card-body');
    const inputs = profileForm.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            const field = this.id;
            const value = this.value;
            localStorage.setItem(field, value);
            
            // Profil bilgilerini güncelle
            updateProfileInfo();
        });
    });

    // Profil bilgilerini güncelleme fonksiyonu
    function updateProfileInfo() {
        const username = localStorage.getItem('username') || 'Ahmet Yılmaz';
        const school = localStorage.getItem('school') || 'İstanbul Lisesi';
        
        // Profil başlığındaki bilgileri güncelle
        document.querySelector('.profile-header h2').textContent = username;
        document.querySelector('.user-school').textContent = school;
    }

    // Ayarları kaydetme butonu
    const saveSettingsBtn = document.querySelector('.save-settings-btn');
    saveSettingsBtn.addEventListener('click', function() {
        // Tüm ayarları bir objede topla
        const settings = {
            theme: localStorage.getItem('theme') || 'light',
            emailNotifications: localStorage.getItem('E-posta Bildirimleri') === 'true',
            achievementNotifications: localStorage.getItem('Başarı Bildirimleri') === 'true',
            weeklyReport: localStorage.getItem('Haftalık Rapor') === 'true',
            username: localStorage.getItem('username') || '',
            email: localStorage.getItem('email') || '',
            school: localStorage.getItem('school') || ''
        };

        // Profil bilgilerini güncelle
        updateProfileInfo();

        // Ayarları kaydet ve kullanıcıya bildir
        console.log('Ayarlar kaydedildi:', settings);
        alert('Ayarlarınız başarıyla kaydedildi!');
    });

    // Şifre değiştirme butonu
    const changePasswordBtn = document.querySelector('.change-password');
    changePasswordBtn.addEventListener('click', function() {
        const newPassword = prompt('Yeni şifrenizi girin:');
        if (newPassword) {
            const confirmPassword = prompt('Yeni şifrenizi tekrar girin:');
            if (newPassword === confirmPassword) {
                alert('Şifreniz başarıyla değiştirildi!');
            } else {
                alert('Şifreler eşleşmiyor!');
            }
        }
    });

    // Hesap silme butonu
    const deleteAccountBtn = document.querySelector('.delete-account');
    deleteAccountBtn.addEventListener('click', function() {
        if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            alert('Hesabınız silindi!');
            // Burada hesap silme işlemi yapılacak
        }
    });

    // Hesaptan çıkış butonu
    const logoutBtn = document.querySelector('.logout-btn') || document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Hesabınızdan çıkış yapmak istediğinizden emin misiniz?')) {
                // Local storage'ı temizle
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isLoggedIn');
                // Giriş sayfasına yönlendir
                window.location.href = 'giris.html';
            }
        });
    }

    // Sayfa yüklendiğinde kaydedilmiş ayarları yükle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        themeOptions.forEach(option => {
            if (option.querySelector('.theme-preview').classList.contains(savedTheme)) {
                option.classList.add('active');
            }
        });
    }

    // Kaydedilmiş toggle durumlarını yükle
    toggleSwitches.forEach(switch_ => {
        const setting = switch_.closest('.toggle-item').querySelector('span').textContent;
        const savedState = localStorage.getItem(setting);
        if (savedState !== null) {
            switch_.checked = savedState === 'true';
        }
    });

    // Kaydedilmiş profil bilgilerini yükle
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue) {
            input.value = savedValue;
        }
    });

    // Sayfa yüklendiğinde profil bilgilerini güncelle
    updateProfileInfo();

    // Başarımlar kategorisi filtreleme
    const categoryButtons = document.querySelectorAll('.category-btn');
    const achievementCards = document.querySelectorAll('.achievement-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif buton stilini güncelle
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedCategory = button.dataset.category;

            // Başarı kartlarını filtrele
            achievementCards.forEach(card => {
                if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}); 