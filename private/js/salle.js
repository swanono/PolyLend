'use strict';

function getAllSalle () {
    fetch('/api/salle/getall')
    .then(function (response) {
        if (response.ok) {
            response.json()
            .then(salles => salles.forEach(salle => insertSalle(salle)))
            .catch(err => console.error(err));
        }
        else {
            console.error('response not ok !');
        }
    })
    .catch(err => console.error(err));
}

function insertSalle(salleData) {
    let divItemRow = document.createElement('div');
    divItemRow.setAttribute('class', 'item row');

    let divGauche = document.createElement('div');
    divGauche.setAttribute('class', 'gauche col-6');

    let image = document.createElement('img');
    image.setAttribute('src', salleData.photo);
    image.setAttribute('alt', 'photo de la salle');
    image.setAttribute('class', 'float-left');
    divGauche.appendChild(image);

    let h2Nom = document.createElement('h2');
    let strongNom = document.createElement('strong');
    strongNom.textContent = salleData.nom + ', ' + salleData.batiment;
    h2Nom.appendChild(strongNom);
    divGauche.appendChild(h2Nom);

    let pDesc = document.createElement('p');
    pDesc.setAttribute('class', 'description');
    pDesc.innerHTML = 'Capacité : ' + salleData.capacite + '<br/>Equipement : ' + salleData.equipement;
    divGauche.appendChild(pDesc);

    divItemRow.appendChild(divGauche);


    let divDroite = document.createElement('div');
    divDroite.setAttribute('class', 'droite col-6');

    let pDispo = document.createElement('p');
    pDispo.setAttribute('class', 'disponnible');
    pDispo.textContent = 'Disponible selon vos critères';
    divDroite.appendChild(pDispo);

    let buttonPlan = document.createElement('button');
    buttonPlan.setAttribute('type', 'button');
    buttonPlan.setAttribute('class', 'btn btn-light');
    buttonPlan.setAttribute('data-toggle', 'modal');
    buttonPlan.setAttribute('data-target', '#calendrier' + salleData.id);
    buttonPlan.textContent = 'Planning complet';
    divDroite.appendChild(buttonPlan);
    
    let buttonRes = document.createElement('button');
    buttonRes.setAttribute('type', 'button');
    buttonRes.setAttribute('class', 'btn btn-primary');
    buttonRes.setAttribute('data-toggle', 'modal');
    buttonRes.setAttribute('data-target', '#reservation' + salleData.id); // TODO : changer l'id target
    buttonRes.textContent = 'Réserver';
    divDroite.appendChild(buttonRes);

    divItemRow.appendChild(divDroite);

    
    document.querySelector('.liste').appendChild(divItemRow);
    document.querySelector('.liste').appendChild(document.createElement('br'));
}

getAllSalle();