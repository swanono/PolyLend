'use strict';

async function fillSalle () {
    try {
        let response = await fetch('../../api/salle/getall/');
        if (!response.ok) {
            throw response;
        }
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