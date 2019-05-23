'use strict';

async function getAllSalle () {
    let response = await fetch('/api/salle/getall');
    if (response.ok) {
        let salles = await response.json();
        salles.forEach(salle => insertSalle(salle));
    }
    else {
        console.error('response not ok !');
    }
}

function insertSalle(salleData) {
    let divItemRow = document.createElement('div');
    divItemRow.setAttribute('class', 'item row');
    divItemRow.setAttribute('id-salle', salleData.id);
    divItemRow.setAttribute('id-element', salleData.id_Element);

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
    pDispo.textContent = 'Disponible selon vos critères'; // TODO changer en fonction de si la case dispo est cochées
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
    buttonRes.setAttribute('data-target', '#exampleModalCenter'); // TODO : changer l'id target
    buttonRes.textContent = 'Réserver';
    buttonRes.addEventListener('click', actuSalleReserv);
    divDroite.appendChild(buttonRes);

    divItemRow.appendChild(divDroite);
    
    document.querySelector('#liste_salles').appendChild(divItemRow);
    document.querySelector('#liste_salles').appendChild(document.createElement('br'));
}

function actuSalleReserv (event) {
    let idS = parseInt(event.target.parentElement.parentElement.attributes['id-salle'].value);
    fetch('/api/salle/byid', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Salle: idS}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(result => result.json())
    .then(function (salleData) {
        let divGauche = document.querySelector('#exampleModalCenter')
                                .firstElementChild
                                .firstElementChild
                                .firstElementChild
                                .lastElementChild
                                .firstElementChild
                                .firstElementChild;
        
        Array.from(divGauche.children).forEach(function (balise) {
            switch (balise.tagName) {
            case 'IMG':
                balise.setAttribute('src', salleData.photo);
                break;
            case 'H2':
                balise.firstElementChild.textContent = salleData.nom + ', ' + salleData.batiment;
                break;
            case 'P':
                balise.textContent = salleData.description;
                break;
            }
        });
    })
    .catch(err => console.error(err));
}

getAllSalle();
