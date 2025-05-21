// Tarih işlemleri için yardımcı fonksiyonlar
const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        week.push(day);
    }
    return week;
};

const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Zaman dilimleri
const timeSlots = [
    "08:00-08:50", "09:00-09:50", "10:00-10:50", "11:00-11:50",
    "14:00-14:50", "15:00-15:50", "16:00-16:50"
];

// Global değişkenler
let currentWeekStart = new Date();
let homeworkData = JSON.parse(localStorage.getItem('homeworkData')) || {};

// DOM elementleri
const scheduleBody = document.getElementById('scheduleBody');
const currentWeekSpan = document.getElementById('currentWeek');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const homeworkForm = document.getElementById('addHomeworkForm');

// Takvimi oluştur
const createSchedule = () => {
    scheduleBody.innerHTML = '';
    const weekDates = getWeekDates(currentWeekStart);
    
    timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        
        // Saat hücresi
        const timeCell = document.createElement('td');
        timeCell.textContent = timeSlot;
        row.appendChild(timeCell);
        
        // Her gün için hücre oluştur
        weekDates.forEach(date => {
            const cell = document.createElement('td');
            const dateStr = formatDate(date);
            const timeStr = timeSlot.split('-')[0];
            const key = `${dateStr}-${timeStr}`;
            
            if (homeworkData[key]) {
                cell.innerHTML = `
                    <div class="homework-item">
                        <strong>${homeworkData[key].subject}</strong>
                        <p>${homeworkData[key].description}</p>
                        <button onclick="deleteHomework('${key}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }
            
            cell.addEventListener('click', () => {
                if (!homeworkData[key]) {
                    document.getElementById('homeworkDate').value = date.toISOString().split('T')[0];
                    document.getElementById('homeworkTime').value = timeStr;
                }
            });
            
            row.appendChild(cell);
        });
        
        scheduleBody.appendChild(row);
    });
    
    // Hafta göstergesini güncelle
    const firstDay = weekDates[0];
    const lastDay = weekDates[6];
    currentWeekSpan.textContent = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
};

// Ödev ekle
homeworkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('homeworkDate').value;
    const time = document.getElementById('homeworkTime').value;
    const subject = document.getElementById('homeworkSubject').value;
    const description = document.getElementById('homeworkDescription').value;
    
    const formattedDate = new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const key = `${formattedDate}-${time}`;
    
    homeworkData[key] = {
        subject,
        description,
        date: formattedDate,
        time
    };
    
    localStorage.setItem('homeworkData', JSON.stringify(homeworkData));
    createSchedule();
    homeworkForm.reset();
});

// Ödev sil
window.deleteHomework = (key) => {
    if (confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
        delete homeworkData[key];
        localStorage.setItem('homeworkData', JSON.stringify(homeworkData));
        createSchedule();
    }
};

// Hafta navigasyonu
prevWeekBtn.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    createSchedule();
});

nextWeekBtn.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    createSchedule();
});

// Sayfa yüklendiğinde takvimi oluştur
createSchedule(); 