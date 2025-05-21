// Form işlemleri için event listener'lar
document.addEventListener('DOMContentLoaded', function() {
    // Varsayılan kullanıcıyı oluştur ve kaydet
    const defaultUser = {
        fullname: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        password: "2121",
        school: "İstanbul Lisesi",
        grade: "12",
        createdAt: new Date().toISOString()
    };

    // Mevcut kullanıcıları al
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Eğer bu e-posta ile kayıtlı kullanıcı yoksa ekle
    if (!users.some(user => user.email === defaultUser.email)) {
        users.push(defaultUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Varsayılan kullanıcı oluşturuldu:', defaultUser);
    }

    // Giriş formu
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Basit doğrulama
            if (!email || !password) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            // Kullanıcı bilgilerini localStorage'dan al
            const users = JSON.parse(localStorage.getItem('users')) || [];
            console.log('Kayıtlı kullanıcılar:', users); // Debug için eklendi
            
            const user = users.find(u => {
                console.log('Kontrol edilen kullanıcı:', u); // Debug için eklendi
                console.log('Girilen email:', email); // Debug için eklendi
                console.log('Girilen şifre:', password); // Debug için eklendi
                return u.email === email && u.password === password;
            });

            if (user) {
                // Giriş başarılı
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'profil.html';
            } else {
                console.log('Giriş başarısız - Kullanıcı bulunamadı'); // Debug için eklendi
                alert('E-posta veya şifre hatalı! Lütfen bilgilerinizi kontrol edin.');
            }
        });
    }

    // Kayıt formu
    const registerForm = document.querySelector('.login-form');
    if (registerForm && window.location.pathname.includes('kaydol.html')) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;
            const school = document.getElementById('school').value;
            const grade = document.getElementById('grade').value;

            // Basit doğrulama
            if (!fullname || !email || !password || !passwordConfirm || !school || !grade) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            if (password !== passwordConfirm) {
                alert('Şifreler eşleşmiyor!');
                return;
            }

            // Kullanıcı bilgilerini localStorage'dan al
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // E-posta kontrolü
            if (users.some(user => user.email === email)) {
                alert('Bu e-posta adresi zaten kayıtlı!');
                return;
            }

            // Yeni kullanıcı oluştur
            const newUser = {
                fullname,
                email,
                password,
                school,
                grade,
                createdAt: new Date().toISOString()
            };

            // Kullanıcıyı kaydet
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Otomatik giriş yap
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'profil.html';
        });
    }

    // Şifre görünürlüğü kontrolü
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.innerHTML = '👁️';
        toggleButton.style.position = 'absolute';
        toggleButton.style.right = '10px';
        toggleButton.style.top = '50%';
        toggleButton.style.transform = 'translateY(-50%)';
        toggleButton.style.background = 'none';
        toggleButton.style.border = 'none';
        toggleButton.style.cursor = 'pointer';
        
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(toggleButton);

        toggleButton.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            toggleButton.innerHTML = input.type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });

    // Sayfa yüklendiğinde auth kontrolü yap
    checkAuth();

    // Giriş kontrolü fonksiyonu
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Eğer giriş yapılmamışsa ve profil, sayaçlar veya chat sayfalarındaysak
        if (!isLoggedIn && !currentUser && (
            window.location.pathname.includes('profil.html') ||
            window.location.pathname.includes('sayaclar.html') ||
            window.location.pathname.includes('chat.html')
        )) {
            window.location.href = 'giris.html';
            return;
        }
    }

    // Sayfa yüklendiğinde giriş kontrolü yap
    checkLoginStatus();
});

// Menü butonu için event listener
const menuButton = document.querySelector('.menu-button');
if (menuButton) {
    menuButton.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Kullanıcı durumunu kontrol et
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navLinks = document.querySelector('.nav-links');
    
    if (currentUser) {
        // Kullanıcı giriş yapmış
        const menuItems = `
            <a href="analiz.html"><i class="fas fa-chart-line"></i> Analiz</a>
            <a href="pano.html"><i class="fas fa-thumbtack"></i> Mantar Pano</a>
            <a href="oyunlar.html"><i class="fas fa-gamepad"></i> Oyunlar</a>
            <a href="sayaclar.html"><i class="fas fa-stopwatch"></i> Sayaçlar</a>
            <a href="homework.html"><i class="fas fa-tasks"></i> Ödev ve Hedefler</a>
            <a href="profil.html"><i class="fas fa-user"></i> Profilim</a>
            <a href="chat.html"><i class="fas fa-robot"></i> Yapay Zeka</a>
        `;
        navLinks.innerHTML = menuItems;
    }
}