/* ==========================================================================
   BACKEND CMS CONTROLLER - ASSOCIAZIONE ORIZZONTI VERDI
   Features: Password Verification, Dual Color Sync, Modals, Local Save & JSON Export
   ========================================================================== */

let cmsState = null;
let hasUnsavedChanges = false;
let isRunningOnServer = false;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkServerConnection();
  loadCMSData();

  // Configura la visualizzazione della password
  const togglePwBtn = document.getElementById('toggle-pw-visibility');
  const pwInput = document.getElementById('login-password');
  if (togglePwBtn && pwInput) {
    togglePwBtn.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      togglePwBtn.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  }

  // Intercetta il login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Controllo sessione esistente
  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    showDashboard();
  }
});

/* ==========================================================================
   AUTENTICAZIONE & CARICAMENTO DATI
   ========================================================================== */

function loadCMSData() {
  // Carica i dati con priorità: LocalStorage Draft -> Server data.json -> Default Backup
  const localDraft = localStorage.getItem('assoc_cms_data');
  if (localDraft) {
    try {
      cmsState = JSON.parse(localDraft);
      console.log('CMS caricato con successo con bozza da LocalStorage.');
      setupCMSInterface();
      return;
    } catch (e) {
      console.error('Bozza in LocalStorage non valida:', e);
    }
  }

  fetch('/data.json')
    .then(response => {
      if (!response.ok) throw new Error('File data.json non raggiungibile.');
      return response.json();
    })
    .then(data => {
      cmsState = data;
      console.log('CMS caricato con successo da data.json del server.');
      setupCMSInterface();
    })
    .catch(error => {
      console.warn('Avviso: data.json sul server non disponibile. Utilizzo dei dati di fallback.', error);
      // Dati di fallback
      cmsState = {
        "association": {
          "name": "Associazione Orizzonti Verdi",
          "slogan": "Insieme per un futuro sostenibile e solidale",
          "description": "Siamo una neonata associazione di promozione sociale (APS) dedicata a valorizzare il nostro territorio, promuovere la sostenibilità ambientale e sostenere le persone in difficoltà attraverso iniziative culturali e di mutuo soccorso.",
          "aboutUs": "Fondata nel 2026, l'Associazione Orizzonti Verdi nasce dall'unione di cittadini desiderosi di fare la differenza nella propria comunità. Ci occupiamo di rigenerazione urbana, laboratori educativi per bambini, mercatini del riuso, piantumazione di alberi e incontri culturali volti a riscoprire le tradizioni locali in chiave ecologica. Crediamo nella partecipazione attiva e trasparente di ognuno.",
          "logoUrl": "",
          "primaryColor": "#0d9488",
          "secondaryColor": "#f59e0b"
        },
        "contacts": {
          "email": "info@orizzontiverdi.it",
          "phone": "+39 012 3456789",
          "address": "Via della Solidarietà, 12 - 40100 Bologna (BO)",
          "taxCode": "91234567890",
          "facebook": "https://facebook.com/orizzontiverdi",
          "instagram": "https://instagram.com/orizzontiverdi",
          "linkedin": "https://linkedin.com/company/orizzontiverdi"
        },
        "initiatives": [
          {
            "id": "init-1",
            "title": "Rigenerazione del Parco Comunale",
            "date": "2026-06-15",
            "description": "Una giornata dedicata alla pulizia, sistemazione delle panchine e piantumazione di nuovi arbusti fioriti per api nel nostro parco di quartiere. Porta guanti e sorrisi, al pranzo al sacco ci pensiamo noi!",
            "category": "Ambiente",
            "imageUrl": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
            "status": "In Programma"
          }
        ],
        "transparency": [
          {
            "id": "trans-1",
            "title": "Atto Costitutivo e Statuto dell'Associazione",
            "year": "2026",
            "category": "Statuto e Atto Costitutivo",
            "url": "#"
          }
        ],
        "adminSettings": {
          "password": "admin"
        }
      };
      setupCMSInterface();
    });
}

function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById('login-password').value;
  const errorMsg = document.getElementById('login-error-msg');
  const loginCard = document.getElementById('login-card');

  if (!cmsState) return;

  const validPassword = (cmsState.adminSettings && cmsState.adminSettings.password) || 'admin';

  if (password === validPassword) {
    sessionStorage.setItem('admin_logged_in', 'true');
    errorMsg.style.display = 'none';
    showDashboard();
    showToast('Pannello sbloccato con successo!', 'success');
  } else {
    // Errore: animazione scuotimento
    errorMsg.textContent = 'Password inserita non corretta!';
    errorMsg.style.display = 'block';
    
    loginCard.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      loginCard.style.animation = '';
    }, 400);
  }
}

// Aggiungi stile dinamico di animazione per l'errore di login
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
`;
document.head.appendChild(styleSheet);

function showDashboard() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('cms-interface').style.display = 'block';
}

function setupCMSInterface() {
  if (!cmsState) return;

  // Applica nome dell'associazione all'intestazione
  const headerName = document.getElementById('header-assoc-name');
  if (headerName) headerName.textContent = `CMS | ${(cmsState.association && cmsState.association.name) || 'Associazione'}`;

  // Configura pulsanti di navigazione sidebar
  initTabs();

  // Carica i dati nei form e nelle liste
  fillProfileFields();
  renderAdminInitiatives();
  renderAdminDocs();

  // Rileva e attiva il pulsante di salvataggio diretto se il server è disponibile
  updatePublishingSection();

  // Collega i gestori di eventi per il salvataggio dei form del profilo
  setupProfileChangeListeners();

  // Collega le azioni di modifica (Iniziative e Documenti)
  setupActionListeners();

  // Configura l'integrazione di pubblicazione automatica online con GitHub / Netlify
  setupGitHubIntegration();
}

function checkServerConnection() {
  // Se la pagina è aperta con il protocollo http o https (e non file://) testiamo la connessione
  if (window.location.protocol.startsWith('http')) {
    isRunningOnServer = true;
  } else {
    isRunningOnServer = false;
  }
}

function setUnsavedChanges(unsaved) {
  hasUnsavedChanges = unsaved;
  const dot = document.getElementById('save-status-dot');
  const text = document.getElementById('save-status-text');

  if (!dot || !text) return;

  if (unsaved) {
    dot.className = 'save-status-dot unsaved';
    text.textContent = 'Modifiche non salvate (Bozza attiva)';
    
    // Salva automaticamente la bozza nel LocalStorage locale per l'Anteprima Live
    localStorage.setItem('assoc_cms_data', JSON.stringify(cmsState));
  } else {
    dot.className = 'save-status-dot';
    text.textContent = 'Tutte le modifiche salvate su file';
  }
}

/* ==========================================================================
   GESTIONE TABS (NAVIGAZIONE INTERNA)
   ========================================================================== */

function initTabs() {
  const buttons = document.querySelectorAll('.admin-sidebar-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      // Gestisci bottoni attivi
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Gestisci tab attive
      document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === tabId) {
          tab.classList.add('active');
        }
      });
    });
  });
}

/* ==========================================================================
   TAB 1: PROFILO ASSOCIAZIONE & COLORI BRAND
   ========================================================================== */

function fillProfileFields() {
  const assoc = cmsState.association || {};
  const contacts = cmsState.contacts || {};

  // Testi
  document.getElementById('prof-name').value = assoc.name || '';
  document.getElementById('prof-slogan').value = assoc.slogan || '';
  document.getElementById('prof-description').value = assoc.description || '';
  document.getElementById('prof-aboutUs').value = assoc.aboutUs || '';

  // Contatti e Dati Legali
  document.getElementById('prof-email').value = contacts.email || '';
  document.getElementById('prof-phone').value = contacts.phone || '';
  document.getElementById('prof-address').value = contacts.address || '';
  document.getElementById('prof-taxCode').value = contacts.taxCode || '';

  // Social
  document.getElementById('prof-facebook').value = contacts.facebook || '';
  document.getElementById('prof-instagram').value = contacts.instagram || '';
  document.getElementById('prof-linkedin').value = contacts.linkedin || '';

  // Colori Brand (Hex e Color Pickers)
  const primColorHex = assoc.primaryColor || '#0d9488';
  const secColorHex = assoc.secondaryColor || '#f59e0b';

  document.getElementById('prof-primaryColor').value = primColorHex;
  document.getElementById('prof-primaryColor-hex').value = primColorHex;
  document.getElementById('prof-secondaryColor').value = secColorHex;
  document.getElementById('prof-secondaryColor-hex').value = secColorHex;

  // Applica i colori scelti localmente per rendere il CMS reattivo all'identità visiva scelta
  applyDynamicColors(primColorHex, secColorHex);
}

function setupProfileChangeListeners() {
  const textFields = [
    'prof-name', 'prof-slogan', 'prof-description', 'prof-aboutUs',
    'prof-email', 'prof-phone', 'prof-address', 'prof-taxCode',
    'prof-facebook', 'prof-instagram', 'prof-linkedin'
  ];

  // Gestione modifiche testi del profilo
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input', () => {
      const val = el.value.trim();
      
      if (id.startsWith('prof-facebook') || id.startsWith('prof-instagram') || id.startsWith('prof-linkedin') || id.startsWith('prof-email') || id.startsWith('prof-phone') || id.startsWith('prof-address') || id.startsWith('prof-taxCode')) {
        const fieldName = id.replace('prof-', '');
        cmsState.contacts[fieldName] = val;
      } else {
        const fieldName = id.replace('prof-', '');
        cmsState.association[fieldName] = val;
        
        // Aggiorna l'intestazione CMS al volo se cambia il nome
        if (fieldName === 'name') {
          document.getElementById('header-assoc-name').textContent = `CMS | ${val}`;
        }
      }
      setUnsavedChanges(true);
    });
  });

  // Gestione Colore Primario (Dual Sync)
  const primPicker = document.getElementById('prof-primaryColor');
  const primHex = document.getElementById('prof-primaryColor-hex');
  if (primPicker && primHex) {
    primPicker.addEventListener('input', () => {
      primHex.value = primPicker.value;
      cmsState.association.primaryColor = primPicker.value;
      applyDynamicColors(primPicker.value, null);
      setUnsavedChanges(true);
    });
    primHex.addEventListener('input', () => {
      if (/^#[0-9A-F]{6}$/i.test(primHex.value)) {
        primPicker.value = primHex.value;
        cmsState.association.primaryColor = primHex.value;
        applyDynamicColors(primHex.value, null);
        setUnsavedChanges(true);
      }
    });
  }

  // Gestione Colore Secondario (Dual Sync)
  const secPicker = document.getElementById('prof-secondaryColor');
  const secHex = document.getElementById('prof-secondaryColor-hex');
  if (secPicker && secHex) {
    secPicker.addEventListener('input', () => {
      secHex.value = secPicker.value;
      cmsState.association.secondaryColor = secPicker.value;
      applyDynamicColors(null, secPicker.value);
      setUnsavedChanges(true);
    });
    secHex.addEventListener('input', () => {
      if (/^#[0-9A-F]{6}$/i.test(secHex.value)) {
        secPicker.value = secHex.value;
        cmsState.association.secondaryColor = secHex.value;
        applyDynamicColors(null, secHex.value);
        setUnsavedChanges(true);
      }
    });
  }
}

// Applica a runtime i colori brand sul pannello CMS stesso
function applyDynamicColors(prim, sec) {
  if (prim) {
    const hsl = hexToHsl(prim);
    if (hsl) {
      document.documentElement.style.setProperty('--primary-hue', hsl.h);
      document.documentElement.style.setProperty('--primary-sat', `${hsl.s}%`);
      document.documentElement.style.setProperty('--primary-light', `${hsl.l}%`);
    }
  }
  if (sec) {
    const hsl = hexToHsl(sec);
    if (hsl) {
      document.documentElement.style.setProperty('--secondary-hue', hsl.h);
      document.documentElement.style.setProperty('--secondary-sat', `${hsl.s}%`);
      document.documentElement.style.setProperty('--secondary-light', `${hsl.l}%`);
    }
  }
}

/* ==========================================================================
   TAB 2: GESTIONE INIZIATIVE ED EVENTI (LISTE & MODALI)
   ========================================================================== */

function renderAdminInitiatives() {
  const list = document.getElementById('admin-initiatives-list');
  const countBadge = document.getElementById('admin-init-count');
  if (!list) return;

  list.innerHTML = '';
  const initiatives = cmsState.initiatives || [];

  if (countBadge) countBadge.textContent = `${initiatives.length} Iniziative`;

  if (initiatives.length === 0) {
    list.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-light);">Nessuna iniziativa registrata. Clicca su "Nuova Iniziativa" in alto per iniziare!</p>`;
    return;
  }

  initiatives.forEach(init => {
    const row = document.createElement('div');
    row.className = 'glass admin-item-row';

    const fallbackImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800';

    row.innerHTML = `
      <div class="admin-item-info">
        <div class="admin-item-thumbnail">
          <img src="${init.imageUrl || fallbackImg}" alt="${init.title}" onerror="this.src='${fallbackImg}'">
        </div>
        <div class="admin-item-text">
          <div class="admin-item-title">${init.title}</div>
          <div class="admin-item-meta">
            <span><i class="fa-regular fa-calendar" style="color:var(--primary);"></i> ${init.date || 'Senza Data'}</span> &nbsp;|&nbsp;
            <span>Categoria: <strong>${init.category || 'Nessuna'}</strong></span> &nbsp;|&nbsp;
            <span>Stato: <strong style="color:var(--primary);">${init.status || 'Pianificato'}</strong></span>
          </div>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-icon btn-edit-init" data-id="${init.id}" title="Modifica"><i class="fa-solid fa-pencil"></i></button>
        <button class="btn btn-icon btn-danger btn-delete-init" data-id="${init.id}" title="Elimina"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    list.appendChild(row);
  });

  // Collega i click dei bottoni appena renderizzati
  list.querySelectorAll('.btn-edit-init').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openInitiativeModal(id);
    });
  });

  list.querySelectorAll('.btn-delete-init').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteInitiative(id);
    });
  });
}

function openInitiativeModal(id = null) {
  const modal = document.getElementById('modal-init-overlay');
  const title = document.getElementById('modal-init-title');
  const form = document.getElementById('form-initiative');
  
  if (!modal || !form) return;

  form.reset();

  if (id) {
    // Modifica
    title.textContent = 'Modifica Iniziativa';
    const init = cmsState.initiatives.find(item => item.id === id);
    if (init) {
      document.getElementById('init-form-id').value = init.id;
      document.getElementById('init-form-title').value = init.title || '';
      document.getElementById('init-form-date').value = init.date || '';
      document.getElementById('init-form-category').value = init.category || '';
      document.getElementById('init-form-status').value = init.status || 'In Programma';
      document.getElementById('init-form-imageUrl').value = init.imageUrl || '';
      document.getElementById('init-form-desc').value = init.description || '';
    }
  } else {
    // Creazione
    title.textContent = 'Nuova Iniziativa';
    document.getElementById('init-form-id').value = '';
    // Imposta come data predefinita la data odierna
    document.getElementById('init-form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('init-form-imageUrl').value = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800';
  }

  modal.classList.add('active');
}

function closeInitiativeModal() {
  const modal = document.getElementById('modal-init-overlay');
  if (modal) modal.classList.remove('active');
}

function deleteInitiative(id) {
  const init = cmsState.initiatives.find(item => item.id === id);
  if (!init) return;

  if (confirm(`Sei sicuro di voler eliminare l'iniziativa "${init.title}"? questa azione non è reversibile.`)) {
    cmsState.initiatives = cmsState.initiatives.filter(item => item.id !== id);
    renderAdminInitiatives();
    setUnsavedChanges(true);
    showToast('Iniziativa rimossa con successo.', 'success');
  }
}

/* ==========================================================================
   TAB 3: GESTIONE TRASPARENZA E LEGGE (LISTE & MODALI)
   ========================================================================== */

function renderAdminDocs() {
  const list = document.getElementById('admin-docs-list');
  const countBadge = document.getElementById('admin-doc-count');
  if (!list) return;

  list.innerHTML = '';
  const docs = cmsState.transparency || [];

  if (countBadge) countBadge.textContent = `${docs.length} Documenti`;

  if (docs.length === 0) {
    list.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-light);">Nessun documento pubblicato. Clicca su "Nuovo Documento" in alto per caricarne uno!</p>`;
    return;
  }

  docs.forEach(doc => {
    const row = document.createElement('div');
    row.className = 'glass admin-item-row';

    row.innerHTML = `
      <div class="admin-item-info">
        <div class="contact-icon" style="border-radius:var(--radius-sm); font-size:1.25rem;"><i class="fa-solid fa-file-pdf"></i></div>
        <div class="admin-item-text">
          <div class="admin-item-title">${doc.title}</div>
          <div class="admin-item-meta">
            <span>Anno: <strong>${doc.year || '2026'}</strong></span> &nbsp;|&nbsp;
            <span>Categoria: <strong>${doc.category || 'Nessuna'}</strong></span> &nbsp;|&nbsp;
            <span>URL: <a href="${doc.url || '#'}" target="_blank" style="color:var(--primary); font-size:0.75rem;">${doc.url || '#'}</a></span>
          </div>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn-icon btn-edit-doc" data-id="${doc.id}" title="Modifica"><i class="fa-solid fa-pencil"></i></button>
        <button class="btn btn-icon btn-danger btn-delete-doc" data-id="${doc.id}" title="Elimina"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    list.appendChild(row);
  });

  // Collega bottoni
  list.querySelectorAll('.btn-edit-doc').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openDocModal(id);
    });
  });

  list.querySelectorAll('.btn-delete-doc').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteDoc(id);
    });
  });
}

function openDocModal(id = null) {
  const modal = document.getElementById('modal-doc-overlay');
  const title = document.getElementById('modal-doc-title');
  const form = document.getElementById('form-document');
  
  if (!modal || !form) return;

  form.reset();

  if (id) {
    title.textContent = 'Modifica Documento';
    const doc = cmsState.transparency.find(item => item.id === id);
    if (doc) {
      document.getElementById('doc-form-id').value = doc.id;
      document.getElementById('doc-form-title').value = doc.title || '';
      document.getElementById('doc-form-year').value = doc.year || '2026';
      document.getElementById('doc-form-category').value = doc.category || '';
      document.getElementById('doc-form-url').value = doc.url || '#';
    }
  } else {
    title.textContent = 'Nuovo Documento';
    document.getElementById('doc-form-id').value = '';
    document.getElementById('doc-form-year').value = new Date().getFullYear();
    document.getElementById('doc-form-url').value = '#';
  }

  modal.classList.add('active');
}

function closeDocModal() {
  const modal = document.getElementById('modal-doc-overlay');
  if (modal) modal.classList.remove('active');
}

function deleteDoc(id) {
  const doc = cmsState.transparency.find(item => item.id === id);
  if (!doc) return;

  if (confirm(`Sei sicuro di voler eliminare il documento "${doc.title}"?`)) {
    cmsState.transparency = cmsState.transparency.filter(item => item.id !== id);
    renderAdminDocs();
    setUnsavedChanges(true);
    showToast('Documento eliminato con successo.', 'success');
  }
}

/* ==========================================================================
   CONFIGURAZIONE EVENT LISTENERS PER ELEMENTI INTERATTIVI
   ========================================================================== */

function setupActionListeners() {
  // Modal Iniziative
  const btnAddInit = document.getElementById('btn-add-initiative');
  if (btnAddInit) btnAddInit.addEventListener('click', () => openInitiativeModal(null));
  
  const btnCloseInit = document.getElementById('btn-close-init-modal');
  if (btnCloseInit) btnCloseInit.addEventListener('click', closeInitiativeModal);
  
  const btnCancelInit = document.getElementById('btn-cancel-init');
  if (btnCancelInit) btnCancelInit.addEventListener('click', closeInitiativeModal);

  const formInit = document.getElementById('form-initiative');
  if (formInit) {
    formInit.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = document.getElementById('init-form-id').value;
      const title = document.getElementById('init-form-title').value.trim();
      const date = document.getElementById('init-form-date').value;
      const category = document.getElementById('init-form-category').value.trim();
      const status = document.getElementById('init-form-status').value;
      const imageUrl = document.getElementById('init-form-imageUrl').value.trim();
      const description = document.getElementById('init-form-desc').value.trim();

      if (id) {
        // Modifica esistente
        const index = cmsState.initiatives.findIndex(item => item.id === id);
        if (index !== -1) {
          cmsState.initiatives[index] = { id, title, date, category, status, imageUrl, description };
        }
      } else {
        // Genera nuova
        const newId = `init-${Date.now()}`;
        cmsState.initiatives.push({ id: newId, title, date, category, status, imageUrl, description });
      }

      closeInitiativeModal();
      renderAdminInitiatives();
      setUnsavedChanges(true);
      showToast('Salvataggio iniziativa completato!', 'success');
    });
  }

  // Modal Documenti Legali
  const btnAddDoc = document.getElementById('btn-add-doc');
  if (btnAddDoc) btnAddDoc.addEventListener('click', () => openDocModal(null));
  
  const btnCloseDoc = document.getElementById('btn-close-doc-modal');
  if (btnCloseDoc) btnCloseDoc.addEventListener('click', closeDocModal);
  
  const btnCancelDoc = document.getElementById('btn-cancel-doc');
  if (btnCancelDoc) btnCancelDoc.addEventListener('click', closeDocModal);

  const formDoc = document.getElementById('form-document');
  if (formDoc) {
    formDoc.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('doc-form-id').value;
      const title = document.getElementById('doc-form-title').value.trim();
      const year = document.getElementById('doc-form-year').value.trim();
      const category = document.getElementById('doc-form-category').value.trim();
      const url = document.getElementById('doc-form-url').value.trim();

      if (id) {
        // Aggiorna
        const index = cmsState.transparency.findIndex(item => item.id === id);
        if (index !== -1) {
          cmsState.transparency[index] = { id, title, year, category, url };
        }
      } else {
        // Crea nuovo
        const newId = `trans-${Date.now()}`;
        cmsState.transparency.push({ id: newId, title, year, category, url });
      }

      closeDocModal();
      renderAdminDocs();
      setUnsavedChanges(true);
      showToast('Documento salvato con successo!', 'success');
    });
  }

  // Bottone Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Sei sicuro di voler uscire dal gestionale?')) {
        sessionStorage.removeItem('admin_logged_in');
        window.location.reload();
      }
    });
  }
}

/* ==========================================================================
   TAB 4: BACKEND SALVATAGGIO API, ESPORTAZIONE JSON E SICUREZZA
   ========================================================================== */

function updatePublishingSection() {
  const serverDot = document.getElementById('server-status-dot');
  const serverText = document.getElementById('server-status-text');
  const serverDesc = document.getElementById('server-status-desc');
  const saveApiBtn = document.getElementById('btn-save-api');
  const downloadJsonBtn = document.getElementById('btn-download-json');
  const updatePwBtn = document.getElementById('btn-update-password');

  if (!serverDot || !serverText || !serverDesc || !saveApiBtn) return;

  if (isRunningOnServer) {
    // Configura UI per Server Attivo (Salvataggio diretto sul file system)
    serverDot.className = 'save-status-dot';
    serverText.innerHTML = 'Server Locale Connesso! <span style="color:var(--success);">[Attivo]</span>';
    serverDesc.textContent = 'Il CMS è in esecuzione tramite il server locale Node.js. Puoi salvare e pubblicare tutte le modifiche direttamente sul file system premendo il pulsante "Pubblica Modifiche sul Server" in basso.';
    saveApiBtn.removeAttribute('disabled');
    
    saveApiBtn.addEventListener('click', () => {
      saveApiBtn.disabled = true;
      const originalText = saveApiBtn.innerHTML;
      saveApiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connessione e scrittura...';

      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsState)
      })
      .then(response => {
        if (!response.ok) throw new Error('Risposta HTTP non corretta dal server.');
        return response.json();
      })
      .then(result => {
        if (result.success) {
          setUnsavedChanges(false);
          // Rimuove la bozza da LocalStorage poiché ora è consolidata su file
          localStorage.removeItem('assoc_cms_data');
          showToast('Modifiche salvate con successo sul computer dell\'associazione!', 'success');
        } else {
          throw new Error(result.error || 'Errore sconosciuto sul server.');
        }
      })
      .catch(err => {
        console.error('Errore nel salvataggio via API:', err);
        showToast(`Impossibile salvare via server locale: ${err.message}. Prova con lo scaricamento manuale.`, 'error');
      })
      .finally(() => {
        saveApiBtn.disabled = false;
        saveApiBtn.innerHTML = originalText;
      });
    });

  } else {
    // Configura UI per Modalità Statica Offline (Esportazione/Download JSON)
    serverDot.className = 'save-status-dot unsaved';
    serverText.innerHTML = 'Modalità Statica Offline / Senza Server';
    serverDesc.innerHTML = 'Stai navigando la pagina offline o senza un server locale Node attivo. Per rendere le modifiche effettive sul sito vetrina:<br>1. Clicca su <strong>"Scarica data.json Aggiornato"</strong>.<br>2. Sostituisci il file scaricato nella cartella del progetto.<br>3. Carica il nuovo file sul tuo hosting gratuito (es. Netlify).';
    saveApiBtn.setAttribute('disabled', 'true');
    saveApiBtn.style.opacity = '0.5';
  }

  // Gestione Scaricamento file data.json
  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener('click', () => {
      try {
        const payload = JSON.stringify(cmsState, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setUnsavedChanges(false);
        localStorage.removeItem('assoc_cms_data');
        showToast('File "data.json" generato e scaricato correttamente!', 'success');
      } catch (err) {
        showToast(`Errore nello scaricamento: ${err.message}`, 'error');
      }
    });
  }

  // Cambio Password
  if (updatePwBtn) {
    updatePwBtn.addEventListener('click', () => {
      const pwInput = document.getElementById('sett-password');
      const pwConfirmInput = document.getElementById('sett-password-confirm');
      const errorMsg = document.getElementById('sett-password-error');

      if (!pwInput || !pwConfirmInput || !errorMsg) return;

      const newPw = pwInput.value;
      const confirmPw = pwConfirmInput.value;

      errorMsg.style.display = 'none';

      if (!newPw) {
        errorMsg.textContent = 'La password non può essere vuota!';
        errorMsg.style.display = 'block';
        return;
      }

      if (newPw !== confirmPw) {
        errorMsg.textContent = 'Le password inserite non corrispondono!';
        errorMsg.style.display = 'block';
        return;
      }

      // Imposta password dello stato
      if (!cmsState.adminSettings) cmsState.adminSettings = {};
      cmsState.adminSettings.password = newPw;

      pwInput.value = '';
      pwConfirmInput.value = '';
      setUnsavedChanges(true);
      showToast('Password aggiornata con successo! Non dimenticare di salvare o pubblicare.', 'success');
    });
  }
}

/* ==========================================================================
   INTERAZIONI UI GENERICA & UTILITY
   ========================================================================== */

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.className = `toast show toast-${type}`;

  const icon = toast.querySelector('i');
  if (icon) {
    icon.className = type === 'success' 
      ? 'fa-solid fa-circle-check' 
      : 'fa-solid fa-triangle-exclamation';
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Convertitore HEX in HSL
function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  if (hex.length !== 6) return null;

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/* ==========================================================================
   INTEGRAZIONE PUBBLICAZIONE AUTOMATICA CLOUD (GITHUB API)
   ========================================================================== */

function setupGitHubIntegration() {
  const ghUsernameInput = document.getElementById('gh-username');
  const ghRepoInput = document.getElementById('gh-repo');
  const ghTokenInput = document.getElementById('gh-token');
  const toggleTokenBtn = document.getElementById('toggle-gh-token-visibility');
  const publishBtn = document.getElementById('btn-publish-github');

  if (!ghUsernameInput || !ghRepoInput || !ghTokenInput || !publishBtn) return;

  // 1. Carica i dati salvati precedentemente in locale nel browser
  ghUsernameInput.value = localStorage.getItem('assoc_gh_username') || '';
  ghRepoInput.value = localStorage.getItem('assoc_gh_repo') || '';
  ghTokenInput.value = localStorage.getItem('assoc_gh_token') || '';

  // 2. Salva istantaneamente in locale all'inserimento
  ghUsernameInput.addEventListener('input', () => {
    localStorage.setItem('assoc_gh_username', ghUsernameInput.value.trim());
  });
  ghRepoInput.addEventListener('input', () => {
    localStorage.setItem('assoc_gh_repo', ghRepoInput.value.trim());
  });
  ghTokenInput.addEventListener('input', () => {
    localStorage.setItem('assoc_gh_token', ghTokenInput.value.trim());
  });

  // 3. Gestore della visibilità del Token
  if (toggleTokenBtn) {
    toggleTokenBtn.addEventListener('click', () => {
      const isPassword = ghTokenInput.type === 'password';
      ghTokenInput.type = isPassword ? 'text' : 'password';
      toggleTokenBtn.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  }

  // 4. Bottone di pubblicazione automatica su GitHub Pages / Netlify
  publishBtn.addEventListener('click', () => {
    const owner = ghUsernameInput.value.trim();
    const repo = ghRepoInput.value.trim();
    const token = ghTokenInput.value.trim();
    
    const statusBox = document.getElementById('gh-publish-status-box');
    const statusTitle = document.getElementById('gh-status-title');
    const statusLog = document.getElementById('gh-status-log');
    const spinner = document.getElementById('gh-status-spinner');

    if (!owner || !repo || !token) {
      showToast('Compila tutti i campi GitHub (Utente, Repo e Token)!', 'error');
      return;
    }

    // Mostra box di log
    if (statusBox) {
      statusBox.style.display = 'flex';
      statusBox.style.borderColor = 'var(--border)';
    }
    publishBtn.disabled = true;
    spinner.className = 'fa-solid fa-spinner fa-spin';
    statusTitle.textContent = 'Inizializzazione caricamento...';
    statusLog.textContent = '> Avvio pubblicazione automatica cloud\n';
    statusLog.textContent += `> Verifica repository GitHub: https://github.com/${owner}/${repo}\n`;
    
    // Step 1: Ottieni lo SHA corrente di data.json dal repository per l'aggiornamento
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;
    const getUrl = `${url}?t=${Date.now()}`;
    
    statusTitle.textContent = 'Connessione a GitHub in corso...';
    statusLog.textContent += '> Richiesta SHA del file corrente su GitHub...\n';

    fetch(getUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(res => {
      if (res.status === 404) {
        statusLog.textContent += '> File data.json non trovato nel repository. Verrà creato un nuovo file.\n';
        return { sha: null }; // Nessun SHA necessario per la prima creazione
      }
      if (!res.ok) {
        throw new Error(`Connessione fallita. Codice errore HTTP: ${res.status}`);
      }
      return res.json();
    })
    .then(fileInfo => {
      const sha = fileInfo.sha;
      if (sha) {
        statusLog.textContent += `> File trovato. SHA corrente: ${sha}\n`;
      }
      
      statusTitle.textContent = 'Scrittura nuovi contenuti su GitHub...';
      statusLog.textContent += '> Codifica del database JSON in Base64 (UTF-8)...\n';
      
      // Codifica sicura dei caratteri speciali e accentati in Base64
      const jsonString = JSON.stringify(cmsState, null, 2);
      const utf8Bytes = new TextEncoder().encode(jsonString);
      let binary = '';
      const len = utf8Bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binary);

      statusLog.textContent += '> Invio commit di aggiornamento a GitHub...\n';

      const commitBody = {
        message: 'Aggiornamento contenuti tramite CMS visuale Associazione',
        content: base64Content
      };
      if (sha) {
        commitBody.sha = sha;
      }

      return fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitBody)
      });
    })
    .then(putRes => {
      if (!putRes.ok) {
        return putRes.json().then(errData => {
          throw new Error(errData.message || `Errore nella scrittura file. HTTP: ${putRes.status}`);
        });
      }
      return putRes.json();
    })
    .then(commitInfo => {
      statusTitle.textContent = 'Pubblicazione completata con successo!';
      spinner.className = 'fa-solid fa-circle-check';
      spinner.style.color = 'var(--success)';
      statusLog.textContent += `> Commit completato: ${commitInfo.commit.sha.substring(0, 7)} - ${commitInfo.commit.message}\n`;
      statusLog.textContent += '> SUCCESS: I dati del sito sono online su GitHub!\n';
      statusLog.textContent += '> Il server di Hosting (Netlify/Vercel) si sta aggiornando in automatico.';
      
      setUnsavedChanges(false);
      localStorage.removeItem('assoc_cms_data'); // Pulisce la bozza locale consolidata
      showToast('Sito Web aggiornato e pubblicato online in automatico!', 'success');
    })
    .catch(err => {
      console.error('Errore nel deploy automatico GitHub:', err);
      statusTitle.textContent = 'Errore nella pubblicazione cloud!';
      spinner.className = 'fa-solid fa-triangle-exclamation';
      spinner.style.color = 'var(--danger)';
      statusLog.textContent += `\n> ERRORE: ${err.message}\n`;
      statusLog.textContent += '> Verifica le credenziali, la connessione e i permessi del tuo Token.';
      
      showToast(`Errore di pubblicazione automatica: ${err.message}`, 'error');
    })
    .finally(() => {
      publishBtn.disabled = false;
    });
  });
}
