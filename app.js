/* ==========================================================================
   FRONTEND APPLICATION ENGINE - ASSOCIAZIONE ORIZZONTI VERDI
   Features: Dynamic Loading, CSS Color Sync, Theme Toggle, Visual CMS Sync
   ========================================================================== */

// Backup predefinito nel caso in cui data.json non sia raggiungibile (es. CORS in apertura diretta di file)
const DEFAULT_DATA_BACKUP = {
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
    },
    {
      "id": "init-2",
      "title": "Laboratorio di Riciclo Creativo per Bambini",
      "date": "2026-06-28",
      "description": "Insegniamo ai più piccoli il valore degli oggetti di scarto! Attraverso giochi e attività creative trasformeremo plastica, cartone e tappi in fantastici giocattoli e decorazioni.",
      "category": "Sociale",
      "imageUrl": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
      "status": "In Programma"
    },
    {
      "id": "init-3",
      "title": "Incontro Culturale: Storia della nostra Terra",
      "date": "2026-05-10",
      "description": "Conferenza e tavola rotonda con storici locali per ripercorrere le origini contadine del nostro territorio e l'evoluzione ecologica del paesaggio agrario negli ultimi cent'anni.",
      "category": "Cultura",
      "imageUrl": "https://images.unsplash.com/photo-1505664194779-8bebcb95c553?auto=format&fit=crop&q=80&w=800",
      "status": "Completato"
    }
  ],
  "transparency": [
    {
      "id": "trans-1",
      "title": "Atto Costitutivo e Statuto dell'Associazione",
      "year": "2026",
      "category": "Statuto e Atto Costitutivo",
      "url": "#"
    },
    {
      "id": "trans-2",
      "title": "Bilancio Preventivo dell'Esercizio Finanziario",
      "year": "2026",
      "category": "Bilanci",
      "url": "#"
    },
    {
      "id": "trans-3",
      "title": "Rendiconto delle Sovvenzioni e Contributi Pubblici Ricevuti",
      "year": "2026",
      "category": "Adempimenti Legge 124/2017",
      "url": "#"
    }
  ]
};

// Stato globale dell'applicazione
let appData = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initContactForm();
  loadData();
  
  // Rileva eventuali salvataggi in LocalStorage per anteprime in tempo reale (CMS Sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'assoc_cms_data') {
      console.log('Rilevato aggiornamento CMS in tempo reale in LocalStorage!');
      loadData();
    }
  });
});

/* ==========================================================================
   CARICAMENTO E GESTIONE DATI
   ========================================================================== */

function loadData() {
  // 1. Controlla prima se ci sono bozze salvate in LocalStorage (Anteprima CMS)
  const localDraft = localStorage.getItem('assoc_cms_data');
  if (localDraft) {
    try {
      appData = JSON.parse(localDraft);
      console.log('Caricamento dati completato: Utilizzata bozza da LocalStorage.');
      applyDataToDOM(appData);
      showSyncIndicator(true);
      return;
    } catch (e) {
      console.error('Errore nel parsing della bozza LocalStorage:', e);
    }
  }

  // 2. Fetch da data.json sul server
  fetch('/data.json')
    .then(response => {
      if (!response.ok) throw new Error('File data.json non configurato o non raggiungibile.');
      return response.json();
    })
    .then(data => {
      appData = data;
      console.log('Caricamento dati completato: Caricato con successo data.json dal server.');
      applyDataToDOM(appData);
      showSyncIndicator(false);
    })
    .catch(error => {
      console.warn('Avviso: Impossibile scaricare data.json dal server.', error);
      console.log('Utilizzo del backup locale incorporato come fallback resiliente.');
      appData = DEFAULT_DATA_BACKUP;
      applyDataToDOM(appData);
      showSyncIndicator(false);
    });
}

function applyDataToDOM(data) {
  if (!data) return;

  const assoc = data.association || {};
  const contacts = data.contacts || {};
  const initiatives = data.initiatives || [];
  const docs = data.transparency || [];

  // Applica Palette Colori Dinamica basata sui dati salvati
  applyDynamicColors(assoc.primaryColor, assoc.secondaryColor);

  // Logo e Nome Associazione
  document.querySelectorAll('#nav-assoc-name, #footer-assoc-name, #footer-assoc-copyright').forEach(el => {
    if (el) el.textContent = assoc.name || 'Associazione';
  });
  
  const logoText = assoc.name ? assoc.name.charAt(0).toUpperCase() : 'O';
  document.querySelectorAll('.logo-icon').forEach(el => {
    if (el) el.textContent = logoText;
  });

  // Hero Section
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle && assoc.name) {
    // Formatta il titolo con l'ultimo termine evidenziato
    const words = assoc.name.split(' ');
    if (words.length > 1) {
      const lastWord = words.pop();
      heroTitle.innerHTML = `${words.join(' ')} <span>${lastWord}</span>`;
    } else {
      heroTitle.innerHTML = `<span>${assoc.name}</span>`;
    }
  }
  const heroDesc = document.getElementById('hero-desc');
  if (heroDesc) heroDesc.textContent = assoc.slogan || '';

  // Chi Siamo Section
  const aboutCardDesc = document.getElementById('about-card-desc');
  if (aboutCardDesc) aboutCardDesc.textContent = assoc.description || '';
  const aboutLongDesc = document.getElementById('about-long-desc');
  if (aboutLongDesc) aboutLongDesc.textContent = assoc.aboutUs || '';

  // Contatti - Campi Generici
  const emailEl = document.getElementById('contact-email');
  if (emailEl) {
    emailEl.textContent = contacts.email || '';
    emailEl.href = `mailto:${contacts.email}`;
  }
  const phoneEl = document.getElementById('contact-phone');
  if (phoneEl) phoneEl.textContent = contacts.phone || '';
  const addressEl = document.getElementById('contact-address');
  if (addressEl) addressEl.textContent = contacts.address || '';

  const sedeEls = document.querySelectorAll('#legal-sede, #footer-sede');
  sedeEls.forEach(el => {
    if (el) el.textContent = contacts.address || '';
  });

  const cfEls = document.querySelectorAll('#legal-cf, #footer-cf');
  cfEls.forEach(el => {
    if (el) el.textContent = contacts.taxCode || '';
  });

  // Social Links
  const fbBtn = document.getElementById('social-fb');
  if (fbBtn) fbBtn.href = contacts.facebook || '#';
  const igBtn = document.getElementById('social-ig');
  if (igBtn) igBtn.href = contacts.instagram || '#';
  const liBtn = document.getElementById('social-li');
  if (liBtn) liBtn.href = contacts.linkedin || '#';

  // Statistiche Chi Siamo
  const statInit = document.getElementById('stat-initiatives');
  if (statInit) statInit.textContent = initiatives.length;

  // Iniziative ed Eventi - Griglia e Filtri
  renderInitiatives(initiatives);
  renderFilters(initiatives);

  // Documenti di Trasparenza
  renderTransparencyDocs(docs);
}

// Converte un colore HEX in HSL per alimentare le variabili di sistema fluide
function applyDynamicColors(primaryHex, secondaryHex) {
  if (primaryHex) {
    const primaryHsl = hexToHsl(primaryHex);
    if (primaryHsl) {
      document.documentElement.style.setProperty('--primary-hue', primaryHsl.h);
      document.documentElement.style.setProperty('--primary-sat', `${primaryHsl.s}%`);
      document.documentElement.style.setProperty('--primary-light', `${primaryHsl.l}%`);
    }
  }
  if (secondaryHex) {
    const secondaryHsl = hexToHsl(secondaryHex);
    if (secondaryHsl) {
      document.documentElement.style.setProperty('--secondary-hue', secondaryHsl.h);
      document.documentElement.style.setProperty('--secondary-sat', `${secondaryHsl.s}%`);
      document.documentElement.style.setProperty('--secondary-light', `${secondaryHsl.l}%`);
    }
  }
}

// Mostra un badge dinamico se stiamo visualizzando dati di anteprima non pubblicati
function showSyncIndicator(show) {
  let indicator = document.getElementById('cms-preview-indicator');
  if (show) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'cms-preview-indicator';
      indicator.className = 'cms-sync-indicator';
      indicator.style.position = 'fixed';
      indicator.style.bottom = '24px';
      indicator.style.left = '24px';
      indicator.style.zIndex = '1000';
      indicator.style.cursor = 'pointer';
      indicator.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Visualizzazione Anteprima (Modifiche Locali)';
      indicator.title = "Clicca per resettare e vedere la versione pubblicata online.";
      
      indicator.addEventListener('click', () => {
        if (confirm("Vuoi cancellare le modifiche in anteprima e ripristinare i dati pubblicati?")) {
          localStorage.removeItem('assoc_cms_data');
          window.location.reload();
        }
      });
      
      document.body.appendChild(indicator);
    }
  } else if (indicator) {
    indicator.remove();
  }
}

/* ==========================================================================
   RENDERING DYNAMIC ELEMENTS
   ========================================================================== */

function renderInitiatives(initiatives) {
  const grid = document.getElementById('initiatives-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = initiatives.filter(init => {
    if (currentFilter === 'all') return true;
    return init.category.toLowerCase().trim() === currentFilter.toLowerCase().trim();
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-light);" class="glass">
        <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 16px; color: var(--primary);"></i>
        <h3>Nessuna iniziativa trovata</h3>
        <p class="section-desc">Non ci sono iniziative pubblicate per la categoria selezionata in questo momento.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(init => {
    const card = document.createElement('article');
    card.className = 'glass-premium init-card';
    
    // Status Badge
    let statusClass = 'badge-primary';
    if (init.status === 'Completato') statusClass = 'badge-danger';
    if (init.status === 'In Programma' || init.status === 'Pianificato') statusClass = 'badge-success';
    if (init.status === 'In Corso') statusClass = 'badge-warning';

    // Formatta la data
    let formattedDate = 'Data da stabilire';
    if (init.date) {
      const parts = init.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        formattedDate = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        formattedDate = init.date;
      }
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800';
    const imageUrl = init.imageUrl || fallbackImg;

    card.innerHTML = `
      <div class="init-img-wrapper">
        <img src="${imageUrl}" alt="${init.title}" onerror="this.src='${fallbackImg}'">
        <div class="init-badge-wrapper">
          <span class="badge ${statusClass}">${init.status || 'In Programma'}</span>
        </div>
        <div class="init-category-wrapper">
          <span class="init-category">${init.category}</span>
        </div>
      </div>
      <div class="init-info">
        <div class="init-date">
          <i class="fa-regular fa-calendar"></i> ${formattedDate}
        </div>
        <h3 class="init-title">${init.title}</h3>
        <p class="init-desc">${init.description}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderFilters(initiatives) {
  const filterBar = document.getElementById('category-filter-bar');
  if (!filterBar) return;

  // Estrae le categorie uniche
  const categories = new Set();
  initiatives.forEach(init => {
    if (init.category) categories.add(init.category.trim());
  });

  // Ripristina la barra mantenendo "Tutte le Iniziative"
  filterBar.innerHTML = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-category="all">Tutte le Iniziative</button>`;

  categories.forEach(cat => {
    const isCatActive = currentFilter.toLowerCase() === cat.toLowerCase();
    const btn = document.createElement('button');
    btn.className = `filter-btn ${isCatActive ? 'active' : ''}`;
    btn.setAttribute('data-category', cat);
    btn.textContent = cat;
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = cat.toLowerCase();
      renderInitiatives(initiatives);
    });

    filterBar.appendChild(btn);
  });

  // Event listener sul primo pulsante (Tutte)
  const allBtn = filterBar.querySelector('[data-category="all"]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      currentFilter = 'all';
      renderInitiatives(initiatives);
    });
  }
}

function renderTransparencyDocs(docs) {
  const list = document.getElementById('docs-list');
  if (!list) return;

  list.innerHTML = '';

  if (docs.length === 0) {
    list.innerHTML = `<p style="text-align: center; color: var(--text-light);">Nessun documento pubblicato.</p>`;
    return;
  }

  docs.forEach(doc => {
    const item = document.createElement('div');
    item.className = 'glass doc-item';

    item.innerHTML = `
      <div class="doc-details">
        <span class="doc-title">${doc.title}</span>
        <div class="doc-meta">
          <span class="doc-year">${doc.year || '2026'}</span>
          <span>Categoria: ${doc.category || 'Trasparenza'}</span>
        </div>
      </div>
      <a href="${doc.url || '#'}" class="btn btn-icon" title="Scarica Documento" target="_blank">
        <i class="fa-solid fa-download"></i>
      </a>
    `;
    list.appendChild(item);
  });
}

/* ==========================================================================
   INTERAZIONI E STILIZZAZIONE UI
   ========================================================================== */

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Carica il tema salvato o rispetta le preferenze di sistema
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', initialTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  
  if (!navbar) return;

  // Effetto contrazione navbar su scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Attivazione link su scroll (Scroll Spy)
    spyScroll();
  });

  // Toggle Menu Mobile
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Chiudi il menu cliccando su un link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

function spyScroll() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  let currentActiveSectionId = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentActiveSectionId = section.getAttribute('id');
    }
  });

  if (currentActiveSectionId) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
        link.classList.add('active');
      }
    });
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulazione invio modulo con toast di successo premium
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Invio in corso...';

    setTimeout(() => {
      showToast('Messaggio inviato con successo! Ti risponderemo a breve.', 'success');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1500);
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

/* ==========================================================================
   FUNZIONI UTILITY
   ========================================================================== */

// Helper per convertire HEX (#000000) in HSL
function hexToHsl(hex) {
  // Pulisce la stringa rimuovendo l'eventuale cancelletto
  hex = hex.replace(/^#/, '');

  // Gestione formato a 3 cifre
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
    h = s = 0; // achromatic
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
