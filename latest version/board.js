document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seç
    const board = document.getElementById('board');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const boardSettings = document.getElementById('boardSettings');
    const closeSettingsBtn = document.querySelector('.close-settings');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const colorOptions = document.querySelectorAll('.color-option');
    const shapeOptions = document.querySelectorAll('.shape-option');
    const sizeOptions = document.querySelectorAll('.size-option');
    const shadowOptions = document.querySelectorAll('.shadow-option');
    const hoverAnimationToggle = document.getElementById('hoverAnimation');
    const dragAnimationToggle = document.getElementById('dragAnimation');
    const autoSaveToggle = document.getElementById('autoSave');

    // Ayarlar için değişkenler
    let settings = {
        boardColor: '#dab88b',
        noteColor: '#fff9c4',
        noteShape: 'square',
        noteSize: 'medium',
        noteFont: 'Arial',
        noteShadow: 'medium',
        hoverAnimation: true,
        dragAnimation: true,
        autoSave: true
    };

    // Ayarları localStorage'dan yükle
    function loadSettings() {
        const savedSettings = localStorage.getItem('boardSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            applySettings();
            updateActiveOptions();
        }
    }

    // Ayarları kaydet
    function saveSettings() {
        if (settings.autoSave) {
            localStorage.setItem('boardSettings', JSON.stringify(settings));
        }
    }

    // Ayarları uygula
    function applySettings() {
        // Pano rengini uygula
        board.style.backgroundColor = settings.boardColor;
        document.getElementById('boardColor').value = settings.boardColor;

        // Not ayarlarını uygula
        document.getElementById('noteFont').value = settings.noteFont;
        hoverAnimationToggle.checked = settings.hoverAnimation;
        dragAnimationToggle.checked = settings.dragAnimation;
        autoSaveToggle.checked = settings.autoSave;

        // Mevcut notları güncelle
        updateAllNotes();
    }

    // Aktif seçenekleri güncelle
    function updateActiveOptions() {
        colorOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.color === settings.noteColor);
        });
        shapeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.shape === settings.noteShape);
        });
        sizeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.size === settings.noteSize);
        });
        shadowOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.shadow === settings.noteShadow);
        });
    }

    // Tüm notları güncelle
    function updateAllNotes() {
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            updateNoteStyle(note);
        });
    }

    // Not stilini güncelle
    function updateNoteStyle(note) {
        note.style.backgroundColor = settings.noteColor;
        note.style.fontFamily = settings.noteFont;
        
        // Şekil sınıflarını güncelle
        note.className = 'note';
        note.classList.add(settings.noteShape);
        note.classList.add(settings.noteSize);
        note.classList.add(`shadow-${settings.noteShadow}`);

        // Animasyon sınıflarını güncelle
        if (settings.hoverAnimation) {
            note.classList.add('hover-animation');
        } else {
            note.classList.remove('hover-animation');
        }
    }

    // Yeni not oluştur
    function createNote() {
        const note = document.createElement('div');
        note.className = 'note';
        updateNoteStyle(note);

        // Rastgele rotasyon
        const rotation = Math.floor(Math.random() * 11) - 5;
        note.style.transform = `rotate(${rotation}deg)`;

        // Not içeriği
        const content = document.createElement('div');
        content.className = 'note-content';
        content.contentEditable = true;
        content.placeholder = 'Notunuzu buraya yazın...';

        // Not başlığı
        const header = document.createElement('div');
        header.className = 'note-header';
        
        // Not tarihi
        const date = document.createElement('span');
        date.className = 'note-date';
        date.textContent = new Date().toLocaleDateString('tr-TR');

        // Silme butonu
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-note';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.addEventListener('click', () => {
            note.classList.add('fade-out');
            setTimeout(() => note.remove(), 300);
        });

        header.appendChild(date);
        header.appendChild(deleteBtn);
        note.appendChild(header);
        note.appendChild(content);
        board.appendChild(note);

        // Notu sürüklenebilir yap
        if (settings.dragAnimation) {
            makeDraggable(note);
        }

        // İçerik değişikliğini izle
        content.addEventListener('input', () => {
            if (settings.autoSave) {
                saveNoteContent(note);
            }
        });
    }

    // Not içeriğini kaydet
    function saveNoteContent(note) {
        const content = note.querySelector('.note-content').innerHTML;
        const noteId = note.id || Date.now().toString();
        note.id = noteId;
        localStorage.setItem(`note_${noteId}`, content);
    }

    // Notu sürüklenebilir yap
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            element.style.zIndex = 1000;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            element.style.zIndex = 1;
            if (settings.autoSave) {
                saveNotePosition(element);
            }
        }
    }

    // Not pozisyonunu kaydet
    function saveNotePosition(note) {
        const position = {
            top: note.style.top,
            left: note.style.left,
            transform: note.style.transform
        };
        localStorage.setItem(`note_position_${note.id}`, JSON.stringify(position));
    }

    // Event listeners
    addNoteBtn.addEventListener('click', createNote);
    
    settingsBtn.addEventListener('click', () => {
        boardSettings.style.display = boardSettings.style.display === 'none' ? 'block' : 'none';
    });

    closeSettingsBtn.addEventListener('click', () => {
        boardSettings.style.display = 'none';
    });

    // Tab değiştirme
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Renk seçenekleri
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteColor = option.dataset.color;
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });

    // Şekil seçenekleri
    shapeOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteShape = option.dataset.shape;
            shapeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });

    // Boyut seçenekleri
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteSize = option.dataset.size;
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });

    // Gölge seçenekleri
    shadowOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.noteShadow = option.dataset.shadow;
            shadowOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateAllNotes();
            saveSettings();
        });
    });

    // Toggle ayarları
    hoverAnimationToggle.addEventListener('change', () => {
        settings.hoverAnimation = hoverAnimationToggle.checked;
        updateAllNotes();
        saveSettings();
    });

    dragAnimationToggle.addEventListener('change', () => {
        settings.dragAnimation = dragAnimationToggle.checked;
        const notes = document.querySelectorAll('.note');
        notes.forEach(note => {
            if (settings.dragAnimation) {
                makeDraggable(note);
            } else {
                note.onmousedown = null;
            }
        });
        saveSettings();
    });

    autoSaveToggle.addEventListener('change', () => {
        settings.autoSave = autoSaveToggle.checked;
        saveSettings();
    });

    saveSettingsBtn.addEventListener('click', () => {
        settings.boardColor = document.getElementById('boardColor').value;
        settings.noteFont = document.getElementById('noteFont').value;
        saveSettings();
        applySettings();
        boardSettings.style.display = 'none';
    });

    resetSettingsBtn.addEventListener('click', () => {
        settings = {
            boardColor: '#dab88b',
            noteColor: '#fff9c4',
            noteShape: 'square',
            noteSize: 'medium',
            noteFont: 'Arial',
            noteShadow: 'medium',
            hoverAnimation: true,
            dragAnimation: true,
            autoSave: true
        };
        saveSettings();
        applySettings();
        updateActiveOptions();
    });

    // Sayfa yüklendiğinde ayarları ve notları yükle
    loadSettings();
    loadSavedNotes();
}); 