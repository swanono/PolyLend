'use strict';

async function getReservations () {
    let response = await fetch('../../api/reservation/allbyuser/');
    if (response.ok) {
        let reservations = await response.json();

        let liste = document.getElementById('liste_reserv');
        while (liste.firstChild) {
            liste.removeChild(liste.firstChild);
        }
        reservations.sort((reserv1, reserv2) => reserv2.id - reserv1.id).forEach(reserv => insertReservation(reserv));
    }
    else {
        console.error('response not ok : ');
        console.error(response);
    }
}

function insertReservation(reservData) {
    fetch('../../api/reservation/getelem/', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Reservation: reservData.id}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(elemDataj => elemDataj.json())
    .then(function (elemData) {
        let divItemRow = document.createElement('div');
        divItemRow.setAttribute('class', 'item row');
    
        let divGauche = document.createElement('div');
        divGauche.setAttribute('class', 'gauche col-6');
    
        let image = document.createElement('img');
        image.setAttribute('class', 'float-left');
        image.setAttribute('src', elemData.photo);
        image.setAttribute('alt', 'photo de la reservation');
        divGauche.appendChild(image);

        let h2etat = document.createElement('h2');
        //h2etat.setAttribute('style', 'text-align:center;');

        let strongetat = document.createElement('strong');
        strongetat.textContent = elemData.nom;
        h2etat.appendChild(strongetat);
        divGauche.appendChild(h2etat);

        let petat = document.createElement('p');
        petat.textContent = elemData.description;
        divGauche.appendChild(petat);
    
        let divDroite = document.createElement('div');
        divDroite.setAttribute('class', 'droite col-6');

        let pDesc = document.createElement('p');
        pDesc.setAttribute('class', '');
        pDesc.textContent = 'Réservé du '
            + reservData.date_heure_debut
            + ' au ' + reservData.date_heure_fin;
        divDroite.appendChild(pDesc);

        let strongValid = document.createElement('strong');
        switch (reservData.validation) {
        case -1 :
            strongValid.textContent = 'Refusé';
            strongValid.style.color = 'red';
            break;
        case 0:
            strongValid.textContent = 'En Attente';
            strongValid.style.color = 'orange';
            break;
        case 1:
            strongValid.textContent = 'Accepté';
            strongValid.style.color = 'green';
            break;
        default:
            break;
        }
        divDroite.appendChild(strongValid);
            
        divItemRow.appendChild(divGauche);
        divItemRow.appendChild(divDroite);
        document.getElementById('liste_reserv').appendChild(divItemRow);
        document.getElementById('liste_reserv').appendChild(document.createElement('br'));
    })
    .catch(err => console.error(err));
}

getReservations();