const TARIFFA_KM = 0.25;
let scontrinoBase64 = "";

let databaseSpese = JSON.parse(localStorage.getItem('databaseSpese')) || [];
let databaseTelepass = JSON.parse(localStorage.getItem('databaseTelepass')) || [];

const coordinatoriIniziali = [
    "Coordinatore Bruscolini", "Coordinatore Caletta", "Coordinatore Casaburi",
    "Coordinatore Ceniti", "Coordinatore Ledda", "Coordinatore Mazzoleni",
    "Coordinatore Migliaccio", "Coordinatore Piccinetti", "Coordinatore Stella", "Coordinatore Vendemini"
];

function cambiaTab(tabIndex, elementoTab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    elementoTab.classList.add('active');
    const targetSezione = document.getElementById('tab' + tabIndex);
    if(targetSezione) {
        targetSezione.classList.add('active');
    }
    
    if(tabIndex === 3) aggiornaArchivioScontrini();
    if(tabIndex === 5) aggiornaSintesiReferenti();
    if(tabIndex === 6) aggiornaSintesiScontrini();
}

const select = document.getElementById('coordinatore-select');
function popolaMenu(lista) {
    if(!select) return;
    select.innerHTML = '<option value="">Seleziona Coordinatore...</option>';
    lista.forEach(coord => {
        let opt = document.createElement('option');
        opt.value = coord; opt.textContent = coord; select.appendChild(opt);
    });
}
fetch('./coordinatori.json').then(res => res.json()).then(data => popolaMenu(data)).catch(() => popolaMenu(coordinatoriIniziali));

const inputScontrino = document.getElementById('scontrino');
if(inputScontrino) {
    inputScontrino.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('label-foto').textContent = "✅ Caricato";
            const reader = new FileReader();
            reader.onload = function(event) { scontrinoBase64 = event.target.result; };
            reader.readAsDataURL(file);
        }
    });
}

const formSpese = document.getElementById('spese-form');
if(formSpese) {
    formSpese.addEventListener('submit', function(e) {
        e.preventDefault();
        const nuovaSpesa = {
            id: Date.now(),
            data: document.getElementById('data').value,
            comune: document.getElementById('comune').value,
            coordinatore: document.getElementById('coordinatore-select').value,
            km: parseFloat(document.getElementById('km').value) || 0,
            autostrade: parseFloat(document.getElementById('autostrade').value) || 0,
            vitto: parseFloat(document.getElementById('vitto').value) || 0,
            varie: parseFloat(document.getElementById('varie').value) || 0,
            scontrino: scontrinoBase64
        };

        databaseSpese.push(nuovaSpesa);
        salvaEAggiorna();
        
        document.getElementById('comune').value = ''; document.getElementById('km').value = '';
        document.getElementById('autostrade').value = ''; document.getElementById('vitto').value = '';
        document.getElementById('varie').value = ''; document.getElementById('scontrino').value = '';
        document.getElementById('label-foto').textContent = "📸 Scontrino"; scontrinoBase64 = "";
    });
}

function aggiungiTelepass(e) {
    e.preventDefault();
    const nuovoPedaggio = {
        data: document.getElementById('tel-data').value,
        tratta: document.getElementById('tel-tratta').value,
        importo: parseFloat(document.getElementById('tel-importo').value) || 0
    };
    databaseTelepass.push(nuovoPedaggio);
    localStorage.setItem('databaseTelepass', JSON.stringify(databaseTelepass));
    document.getElementById('tel-tratta').value = ''; document.getElementById('tel-importo').value = '';
    renderingTelepass();
    aggiornaTotaleGenerale();
}

function cancellaRiga(id) {
    databaseSpese = databaseSpese.filter(item => item.id !== id);
    salvaEAggiorna();
}

function svuotaTutto() {
    if(confirm("Sei sicuro di cancellare tutti i dati salvati?")) {
        databaseSpese = []; databaseTelepass = [];
        salvaEAggiorna(); localStorage.removeItem('databaseTelepass');
        renderingTelepass();
    }
}

function salvaEAggiorna() {
    localStorage.setItem('databaseSpese', JSON.stringify(databaseSpese));
    renderingTabellaPrincipale();
    aggiornaTotaleGenerale();
}

function renderingTabellaPrincipale() {
    const corpo = document.getElementById('tabella-corpo');
    if(!corpo) return;
    corpo.innerHTML = "";
    databaseSpese.forEach(item => {
        const totKmEuro = item.km * TARIFFA_KM;
        const totaleRiga = totKmEuro + item.autostrade + item.vitto + item.varie;
        const dataFormattata = new Date(item.data).toLocaleDateString('it-IT');
        let imgHtml = item.scontrino ? `<img src="${item.scontrino}" class="anteprima-img" onclick="apriImmagine('${item.scontrino}')">` : '<span class="nessun-allegato">Nessuno</span>';
        
        corpo.innerHTML += `<tr>
            <td>${dataFormattata}</td><td>${item.comune}</td><td>${item.coordinatore}</td><td>${item.km}</td>
            <td>€ ${totKmEuro.toFixed(2)}</td><td>€ ${item.autostrade.toFixed(2)}</td><td>€ ${item.vitto.toFixed(2)}</td><td>€ ${item.varie.toFixed(2)}</td>
            <td>${imgHtml}</td><td class="totale-evidenziato">€ ${totaleRiga.toFixed(2)}</td>
            <td><button class="btn-danger" onclick="cancellaRiga(${item.id})">Elimina</button></td>
        </tr>`;
    });
}

function renderingTelepass() {
    const corpo = document.getElementById('tabella-telepass-corpo');
    if(!corpo) return;
    corpo.innerHTML = "";
    databaseTelepass.forEach(item => {
        corpo.innerHTML += `<tr><td>${new Date(item.data).toLocaleDateString('it-IT')}</td><td>${item.tratta}</td><td>€ ${item.importo.toFixed(2)}</td></tr>`;
    });
}

function aggiornaTotaleGenerale() {
    let totale = 0;
    databaseSpese.forEach(i => totale += (i.km * TARIFFA_KM) + i.autostrade + i.vitto + i.varie);
    databaseTelepass.forEach(t => totale += t.importo);
    const el = document.getElementById('tot-generale-euro');
    if(el) el.textContent = "€ " + totale.toFixed(2);
}

function aggiornaArchivioScontrini() {
    const container = document.getElementById('lista-scontrini-globali');
    if(!container) return;
    container.innerHTML = "";
    const filtrati = databaseSpese.filter(i => i.scontrino);
    if(filtrati.length === 0) { container.innerHTML = "<p class='nessun-allegato'>Nessuno scontrino ancora caricato.</p>"; return; }
    filtrati.forEach(item => {
        container.innerHTML += `<div style="text-align:center; background:#f0f0f0; padding:10px; border-radius:6px;"><img src="${item.scontrino}" style="width:110px; height:110px; object-fit:cover; border-radius:4px;" onclick="apriImmagine('${item.scontrino}')"><br><small><strong>${item.comune}</strong><br>${new Date(item.data).toLocaleDateString('it-IT')}</small></div>`;
    });
}

function aggiornaSintesiReferenti() {
    const corpo = document.getElementById('tabella-sintesi-referenti');
    if(!corpo) return;
    corpo.innerHTML = "";
    coordinatoriIniziali.forEach(coord => {
        const righeFiltrate = databaseSpese.filter(i => i.coordinatore === coord);
        let kmTot = 0, rimborsoKm = 0, altreSpese = 0;
        righeFiltrate.forEach(r => { kmTot += r.km; rimborsoKm += r.km * TARIFFA_KM; altreSpese += r.autostrade + r.vitto + r.varie; });
        if(kmTot > 0 || altreSpese > 0) {
            corpo.innerHTML += `<tr><td>${coord}</td><td>${kmTot}</td><td>€ ${rimborsoKm.toFixed(2)}</td><td>€ ${altreSpese.toFixed(2)}</td><td class="totale-evidenziato">€ ${(rimborsoKm+altreSpese).toFixed(2)}</td></tr>`;
        }
    });
    if(corpo.innerHTML === "") corpo.innerHTML = "<tr><td colspan='5' class='nessun-allegato' style='text-align:center;'>Nessun dato disponibile. Inserisci prima delle trasferte.</td></tr>";
}

function aggiornaSintesiScontrini() {
    const corpo = document.getElementById('tabella-sintesi-scontrini');
    if(!corpo) return;
    corpo.innerHTML = "";
    databaseSpese.forEach(item => {
        const importoSpesa = item.vitto + item.varie;
        const stato = item.scontrino ? "<span style='color:green; font-weight:bold;'>✅ Presente</span>" : "<span style='color:red; font-weight:bold;'>❌ MANCANTE</span>";
        corpo.innerHTML += `<tr><td>${new Date(item.data).toLocaleDateString('it-IT')}</td><td>${item.comune}</td><td>€ ${importoSpesa.toFixed(2)}</td><td>${stato}</td></tr>`;
    });
    if(databaseSpese.length === 0) corpo.innerHTML = "<tr><td colspan='4' class='nessun-allegato' style='text-align:center;'>Nessuna spesa inserita.</td></tr>";
}

function apriImmagine(base64Data) {
    const nuovaFinestra = window.open();
    nuovaFinestra.document.write(`<img src="${base64Data}" style="max-width:100%; margin:20px auto; display:block; border-radius:4px; box-shadow:0 2px 10px rgba(0,0,0,0.2);">`);
}

renderingTabellaPrincipale();
renderingTelepass();
aggiornaTotaleGenerale();
