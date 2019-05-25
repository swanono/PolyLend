'use strict';

async function fillSalle () {
    try {
        let response = await fetch(prefixDir + '/api/salle/getall');
        let salles = await response.json();
        let batBalises = document.getElementById('batiment');
        while (batBalises.firstChild) {
            batBalises.removeChild(batBalises.firstChild);
        }

        let opt1 = document.createElement('option');
        opt1.textContent = '...';
        batBalises.appendChild(opt1);

        let batListe = [];
        salles.forEach(function (salle) {
            if (batListe.find(bat => bat === salle.batiment) === undefined) {
                batListe.push(salle.batiment);
                let opt = document.createElement('option');
                opt.textContent = salle.batiment;
                batBalises.appendChild(opt);
            }
        });
    }
    catch (err) {
        console.error(err);
    }
}

let crits = document.querySelectorAll('.Critere');
crits.forEach(function (divCrit) {
    if (divCrit.parentElement.getAttribute('id') === 'salles') {
        fillSalle();
    }
});

function adaptSide () {
    let divCritS = document.getElementById('salles');
    let divCritM = document.getElementById('materiel');
    let divCritMS = undefined;
    if (divCritS && divCritM) {
        divCritMS = document.getElementById('side').parentElement;
        divCritS = undefined;
        divCritM = undefined;
    }

    let divListe = document.getElementById('liste_salles');
    if (!divListe) {
        divListe = document.getElementById('liste_materiel');
        if (!divListe) {
            divListe = document.getElementById('liste_salle_materiel');
        }
    }
    divListe = divListe.parentElement;

    if (window.innerWidth < 700 && divListe.getAttribute('class') === 'col-9') {
        if (divCritS) {
            divCritS.setAttribute('class', 'col-md-1');
            document.getElementById('capacite').removeAttribute('style');
            document.getElementById('capacite').setAttribute('class', 'float-right');
        }
        if (divCritM) {
            divCritM.setAttribute('class', 'col-md-1');
        }
        if (divCritMS) {
            divCritMS.setAttribute('class', 'col-md-1');
            document.getElementById('capacite').removeAttribute('style');
            document.getElementById('capacite').setAttribute('class', 'float-right');
        }
        divListe.setAttribute('class', 'col-md-1');
    }
    if (window.innerWidth >= 700 && divListe.getAttribute('class') === 'col-md-1') {
        if (divCritS) {
            divCritS.setAttribute('class', 'col-3');
            document.getElementById('capacite').setAttribute('style', 'width: 90%;');
            document.getElementById('capacite').removeAttribute('class');
        }
        if (divCritM) {
            divCritM.setAttribute('class', 'col-3');
        }
        if (divCritMS) {
            divCritMS.setAttribute('class', 'col-3');
            document.getElementById('capacite').setAttribute('style', 'width: 90%;');
            document.getElementById('capacite').removeAttribute('class');
        }
        divListe.setAttribute('class', 'col-9');
    }
}

window.addEventListener('resize', adaptSide);
adaptSide();