let registroNoteSpese = [];

document.addEventListener("DOMContentLoaded", () => {
    caricaCoordinatori();
    const dataField = document.getElementById("inputData");
    if (dataField) dataField.valueAsDate = new Date();
});

// Gestione navigazione 6 moduli
function openModule(moduleId) {
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));

    const section = document.getElementById(moduleId);
    if (section) section.classList.add('active');

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Caricamento coordinatori dal file coordinatori.json
function caricaCoordinatori() {
    fetch('coordinatori.json')
        .then(response => response.json())
        .then(lista => {
            const select = document.getElementById('inputCoordinatore');
            const selectFiltro = document.getElementById('filterCoordinatore');
            
            if (select) {
                select.innerHTML = 'Seleziona Coordinatore...';
                lista.forEach(item => {
                    select.innerHTML += `${item}`;
                });
            }
            if (selectFiltro) {
                selectFiltro.innerHTML = 'Tutti i Coordinatori';
                lista.forEach(item => {
                    selectFiltro.innerHTML += `${item}`;
                });
            }
        })
        .catch(err => console.error("Errore nel caricamento del file JSON:", err));
}

// Calcoli automatici (0,25 €/Km)
function aggiornaFormuleLive() {
    const km = parseFloat(document.getElementById('inputKm').value) || 0;
    const auto = parseFloat(document.getElementById('inputAuto').value) || 0;
    const vitto = parseFloat(document.getElementById('inputVitto').value) || 0;
    const varie = parseFloat(document.getElementById('inputVarie').value) || 0;

    const totKmEuro = km * 0.25;
    const totGenerale = totKmEuro + auto + vitto + varie;

    document.getElementById('previewTotKm').innerText = "€ " + totKmEuro.toFixed(2).replace('.', ',');
    document.getElementById('previewTotSpesa').innerText = "€ " + totGenerale.toFixed(2).replace('.', ',');
}

function calcolaPreventivo() {
    const km = parseFloat(document.getElementById('calcKm').value) || 0;
    document.getElementById('resKm').innerText = (km * 0.25).toFixed(2).replace('.', ',');
}

// Aggiunge la nota spesa e aggiorna i totali
function inserisciNotaSpesa() {
    const data = document.getElementById('inputData').value;
    const comune = document.getElementById('inputComune').value;
    const coord = document.getElementById('inputCoordinatore').value;
    const nome = document.getElementById('inputNome').value || "LORENZO VALLEGGI";
    const ispettore = document.getElementById('inputIspettore').value || "PISA";
    const km = parseFloat(document.getElementById('inputKm').value) || 0;
    const auto = parseFloat(document.getElementById('inputAuto').value) || 0;
    const vitto = parseFloat(document.getElementById('inputVitto').value) || 0;
    const varie = parseFloat(document.getElementById('inputVarie').value) || 0;

    if (!comune || !coord) {
        alert("Inserisci il Comune e seleziona un Coordinatore!");
        return;
    }

    const totKmEuro = km * 0.25;
    const totEuro = totKmEuro + auto + vitto + varie;

    const nuovaRiga = { data, comune, coord, nome, ispettore, km, totKmEuro, auto, vitto, varie, totEuro };
    registroNoteSpese.push(nuovaRiga);

    aggiornaTabella();

    // Reset dei campi di input
    document.getElementById('inputComune').value = '';
    document.getElementById('inputKm').value = '0';
    document.getElementById('inputAuto').value = '0';
    document.getElementById('inputVitto').value = '0';
    document.getElementById('inputVarie').value = '0';
    aggiornaFormuleLive();
}

function aggiornaTabella() {
    const tbody = document.querySelector('#mainTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    let sumKm = 0, sumKmEuro = 0, sumAuto = 0, sumVitto = 0, sumVarie = 0, sumTot = 0;

    registroNoteSpese.forEach(item => {
        tbody.innerHTML += `
