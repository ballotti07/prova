# 🌿 Associazione Orizzonti Verdi - Sito Vetrina & CMS Locale

Benvenuto nel codice sorgente del sito web ufficiale dell'**Associazione Orizzonti Verdi**. Questo progetto è stato progettato su misura per un'associazione neo-costituita che ha la necessità di:
1. **Mostrare le proprie iniziative** ed eventi sul territorio in modo moderno ed accattivante.
2. **Adempiere agli obblighi di legge** del Terzo Settore pubblicando statuto e bilanci in totale trasparenza.
3. **Contenere i costi a ZERO**: il sito è ospitabile gratuitamente al 100% e non richiede database a pagamento.
4. **Essere gestibile senza competenze tecniche**: include un pannello di amministrazione (CMS) visuale ed estremamente semplice da usare.

---

## 🌟 Caratteristiche Principali

* **Design Premium ad Alto Impatto**: Estetica moderna, transizioni fluide, supporto automatico per il Tema Chiaro/Scuro (Light/Dark Mode) e layout 100% reattivo su smartphone e tablet.
* **Colori Brand Personalizzabili**: Puoi cambiare i colori primari e secondari del sito direttamente dal pannello di controllo e vedere l'intero sito ricaricarsi con la nuova palette.
* **Architettura Jamstack (Zero Database)**: I contenuti sono caricati dinamicamente da un file strutturato `data.json`. Questo azzera i costi dei servizi cloud ed elimina il rischio di attacchi hacker al database.
* **Dual-Save CMS (Pannello Amministratore)**:
  * **Salvataggio Automatico (Locale)**: Se avvii il server sul tuo computer, il pannello Admin salva le modifiche direttamente sul file `data.json` del tuo disco rigido con un click.
  * **Esportazione JSON (Online/Offline)**: Puoi scaricare la configurazione aggiornata direttamente dal browser come file `data.json` e caricarla sul tuo hosting.
* **Anteprima Live Istantanea**: Le modifiche effettuate nell'Admin vengono salvate in una bozza temporanea. Se apri il sito pubblico in un'altra scheda, potrai vedere l'anteprima in tempo reale prima di pubblicare!

---

## 📂 Struttura del Progetto

```
site_prova/
├── package.json         # Configurazione degli script di sviluppo Node.js
├── server.js            # Server locale ultra-leggero e API di scrittura file
├── data.json            # Database in formato JSON con testi, eventi e documenti
├── index.html           # Pagina pubblica principale del sito vetrina
├── admin.html           # Pannello gestionale protetto da password
├── app.js               # Motore JavaScript del sito vetrina (caricamento e filtri)
├── admin.js             # Logica del pannello di controllo (editor e salvataggi)
├── style.css            # Stili grafici, variabili HSL, transizioni e responsive
├── 404.html             # Pagina di errore personalizzata in stile glassmorphic
└── README.md            # Questa guida d'uso
```

---

## 🚀 Come Avviare il Progetto in Locale (Sviluppo e Gestione)

Per gestire il sito in modo estremamente comodo e salvare direttamente le modifiche sul tuo computer, assicurati di avere installato [Node.js](https://nodejs.org/).

1. **Apri il terminale** (PowerShell o Prompt dei comandi) nella cartella del progetto:
   ```bash
   cd c:\Matteo\B&M_web_solutions\site_prova
   ```

2. **Avvia il server locale**:
   ```bash
   npm start
   ```

3. **Usa l'applicazione**:
   * **Sito Pubblico**: Apri [http://localhost:3000](http://localhost:3000) nel browser.
   * **Pannello Gestionale (CMS)**: Apri [http://localhost:3000/admin.html](http://localhost:3000/admin.html).
     * **Password Predefinita**: `admin` (puoi cambiarla nella sezione *Pubblica e Impostazioni* dell'Admin).

---

## ✍️ Come Gestire e Aggiornare il Sito (Flusso di Lavoro)

### Metodo 1: Modifica Locale Diretta (Raccomandato)
1. Avvia il server sul tuo computer con `npm start`.
2. Vai su [http://localhost:3000/admin.html](http://localhost:3000/admin.html) ed effettua l'accesso.
3. Modifica i testi, aggiungi eventi o carica link a documenti.
4. Vai nella sezione **"Pubblica e Impostazioni"**. Troverai un riquadro verde che indica *Server Locale Connesso*.
5. Clicca su **"Pubblica Modifiche sul Server"**. I tuoi file sul disco verranno sovrascritti all'istante con i nuovi dati.

### Metodo 2: Aggiornamento Automatico Cloud (Consigliato per il sito online)
1. Apri la pagina di gestione direttamente sul tuo sito online (es. `https://tuosito.netlify.app/admin.html`).
2. Vai nella scheda **"Pubblica e Impostazioni"** e configura la sezione **"Pubblicazione Automatica Online (GitHub / Netlify)"** inserendo il tuo utente GitHub, il nome del repository e il tuo Token PAT (puoi crearlo cliccando sul pulsante dedicato, serve solo l'autorizzazione `repo`).
3. Questa configurazione viene salvata **una sola volta** sul tuo browser in totale sicurezza.
4. Fai le modifiche desiderate nell'Admin.
5. Torna in Impostazioni e clicca su **"Aggiorna Sito Online"**.
6. Il CMS scriverà i dati aggiornati direttamente su GitHub tramite le sue API sicure. Netlify (o Vercel) rileverà il commit e **aggiornerà il sito online in automatico** in circa 10-15 secondi, senza che tu debba scaricare o caricare nulla a mano!

### Metodo 3: Esportazione Manuale (Senza Server e Senza GitHub)
1. Fai doppio click sul file `admin.html` per aprirlo direttamente nel browser (senza avviare terminali).
2. Sblocca il pannello inserendo la password.
3. Modifica i contenuti desiderati.
4. Vai nella scheda **"Pubblica e Impostazioni"** e clicca su **"Scarica data.json Aggiornato"**.
5. Salva il file scaricato all'interno della cartella del tuo sito, **sostituendo** il vecchio file `data.json` esistente.


---

## ☁️ Come Pubblicare il Sito Online GRATIS (Hosting a Costo Zero)

Dato che il sito è composto da file statici (HTML, CSS, JS, JSON), puoi ospitarlo in modo professionale e veloce senza spendere nulla.

### Opzione Raccomandata: Netlify (Online in 15 Secondi)
1. Registrati gratis su [Netlify](https://www.netlify.com/).
2. Accedi alla dashboard principale e naviga su **Netlify Drop** ([https://app.netlify.com/drop](https://app.netlify.com/drop)).
3. **Trascina la cartella `site_prova`** direttamente nel riquadro di caricamento sulla pagina web.
4. In pochissimi secondi il tuo sito sarà online con un indirizzo web gratuito (es. `https://nome-fantasia.netlify.app`).
5. **Acquisto Dominio**: All'interno del pannello Netlify, puoi acquistare un dominio personalizzato (es. `www.orizzontiverdi.it`) per circa 10-12€ all'anno. Netlify configurerà automaticamente i certificati SSL di sicurezza (HTTPS) gratuitamente.

### Come aggiornare il sito online?
Ogni volta che fai modifiche sul tuo computer (usando il *Metodo 1* o *Metodo 2*):
1. Accedi a Netlify.
2. Seleziona il tuo sito web e vai su **Deploys**.
3. Trascina nuovamente la cartella `site_prova` aggiornata nel riquadro di rilascio. Il sito si aggiornerà all'istante a livello mondiale, senza interruzioni di servizio!
