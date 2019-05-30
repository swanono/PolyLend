'use strict';

async function getReservations () {
    let response = await fetch(prefixDir + '/api/reservations/getall');
    if (response.ok) {
        let reservations = await response.json();
        if (reservations.length === undefined) {
            reservations = [];
        }
        document.querySelector('.badge.badge-danger').textContent = '' + reservations.length;

        response = await fetch(prefixDir + '/api/reservations/allbyid', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify(reservations.map(reservation => reservation.id_Reservation)),
            headers: new Headers({'Content-type': 'application/json'}),
        });
        let reservs = await response.json();

        let liste = document.querySelector('#liste_notifs');
        while (liste.firstChild) {
            liste.removeChild(liste.firstChild);
        }
        reservs.forEach(reserv => insertReservation(reserv));
    }
    else {
        console.error('response not ok : ');
        console.error(response);
    }
}

function insertReservation(reservData) {
    fetch(prefixDir + '/api/creneau/byid', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Creneau: reservData.id_Creneau}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(crenDataj => crenDataj.json())
    .then(function (crenData) {
        fetch(prefixDir + '/api/element/byid', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({id_Element: crenData.id_Element}),
            headers: new Headers({'Content-type': 'application/json'}),
        })
        .then(elemDataj => elemDataj.json())
        .then(function (elemData) {
            fetch(prefixDir + '/api/utilisateur/bynum', {
                credentials: 'same-origin',
                method: 'POST',
                body: JSON.stringify({id_Utilisateur: reservData.id_Utilisateur}),
                headers: new Headers({'Content-type': 'application/json'}),
            })
            .then(userDataj => userDataj.json())
            .then(function (userData) {
                let divItemRow = document.createElement('div');
                divItemRow.setAttribute('class', `item row`);
            
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
            
                let divDroite = document.createElement('div');
                divDroite.setAttribute('class', 'droite col-6');
    
                let pDesc = document.createElement('p');
                pDesc.setAttribute('class', '');
                pDesc.innerHTML = 'Réservé du '
                    + reservData.date_heure_debut
                    + ' au ' + reservData.date_heure_fin;
                divDroite.appendChild(pDesc);
                    
                    
            
                divItemRow.appendChild(divGauche);
                divItemRow.appendChild(divDroite);
                document.querySelector('liste').appendChild(divItemRow);
                document.querySelector('liste').appendChild(document.createElement('br'));
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}
