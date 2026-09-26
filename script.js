let elencoSpese = [];

document.addEventListener("DOMContentLoaded", () => {
    caricaCoordinatori();
    const dataInput = document.getElementById("data");
    if (dataInput) dataInput.valueAsDate = new Date();
});

// Passaggio tra le 6 sezioni
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Carica l'elenco dei coordinatori dal file JSON
function caricaCoordinatori() {
    fetch('coordinatori.json')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('coordinatore');
            const selectFiltro = document.getElementById('filtroCoordinatore');
            if (select) {
                select.innerHTML = 'Seleziona Coordinatore...';
                data.forEach(coord => {
                    select.innerHTML += `${coord}`;
                });
            }
            if (selectFiltro) {
                selectFiltro.innerHTML = 'Tutti i Coordinatori';
                data.forEach(coord => {
                    selectFiltro.innerHTML += `${coord}`;
                });
            }
        })
        .catch(err => console.error("Errore nel caricamento dei coordinatori:", err));
}

// Calcolo automatico in tempo reale (Tariffa 0,25 €/Km)
function calcolaTotali() {
    const km = parseFloat(document.getElementById('km').value) || 0;
    const autostrade = parseFloat(document.getElementById('autostrade').value) || 0;
    const vitto = parseFloat(document.getElementById('vitto').value) || 0;
    const varie = parseFloat(document.getElementById('varie').value) || 0;

    const totKm = km * 0.25;
    const totGenerale = totKm + autostrade + vitto + varie;

    document.getElementById('totKmEuro').innerText = "€ " + totKm.toFixed(2);
    document.getElementById('totEuro').innerText = "€ " + totGenerale.toFixed(2);
}

function calcolaPreventivo() {
    const km = parseFloat(document.getElementById('calcKm').value) || 0;
    document.getElementById('resKm').innerText = (km * 0.25).toFixed(2);
}

// Aggiunge la nota spesa alla tabella
function aggiungiTrasferta() {
    const data = document.getElementById('data').value;
    const comune = document.getElementById('comune').value;
    const coord = document.getElementById('coordinatore').value;
    const nome = document.getElementById('nomeCognome').value || "LORENZO VALLEGGI";
    const ispettore = document.getElementById('tipologiaIspettore').value || "PISA";
    const km = parseFloat(document.getElementById('km').value) || 0;
    const autostrade = parseFloat(document.getElementById('autostrade').value) || 0;
    const vitto = parseFloat(document.getElementById('vitto').value) || 0;
    const varie = parseFloat(document.getElementById('varie').value) || 0;

    if (!comune || !coord) {
        alert("Inserisci il Comune e seleziona un Coordinatore!");
        return;
    }

    const totKmEuro = km * 0.25;
    const totEuro = totKmEuro + autostrade + vitto + varie;

    const spesa = { data, comune, coord, nome, ispettore, km, totKmEuro, autostrade, vitto, varie, totEuro };
    elencoSpese.push(spesa);

    aggiornaTabelle();
    
    // Reset parziale dei campi
    document.getElementById('comune').value = '';
    document.getElementById('km').value = '0';
    document.getElementById('autostrade').value = '0';
    document.getElementById('vitto').value = '0';
    document.getElementById('varie').value = '0';
    calcolaTotali();
}

function aggiornaTabelle() {
    const tbody = document.querySelector('#tabellaSpese tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let totKmAcc = 0, totKmEuroAcc = 0, totAutoAcc = 0, totVittoAcc = 0, totVarieAcc = 0, totEuroAcc = 0;

    elencoSpese.forEach(s => {
        tbody.innerHTML += `
