'use strict';

async function getNotifs () {
    let response = await fetch('/api/notification/getall');
    if (response.ok) {
        let notifs = await response.json();
        if (notifs.length === undefined) {
            notifs = [];
        }
        document.querySelector('.badge.badge-danger').textContent = '' + notifs.length;

        response = await fetch('/api/reservation/allbyid', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify(notifs.map(notif => notif.id_Reservation)),
            headers: new Headers({'Content-type': 'application/json'}),
        });
        let reservs = await response.json();

        let liste = document.querySelector('#liste_notifs');
        while (liste.firstChild) {
            liste.removeChild(liste.firstChild);
        }
        reservs.forEach(reserv => insertNotif(reserv));
    }
    else {
        console.error('response not ok :');
        console.error(response);
    }
}

function insertNotif(reservData) {
    fetch('/api/creneau/byid', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Creneau: reservData.id_Creneau}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(crenDataj => crenDataj.json())
    .then(function (crenData) {
        fetch('/api/element/byid', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({id_Element: crenData.id_Element}),
            headers: new Headers({'Content-type': 'application/json'}),
        })
        .then(elemDataj => elemDataj.json())
        .then(function (elemData) {
            fetch('/api/utilisateur/bynum', {
                credentials: 'same-origin',
                method: 'POST',
                body: JSON.stringify({id_Utilisateur: reservData.id_Utilisateur}),
                headers: new Headers({'Content-type': 'application/json'}),
            })
            .then(userDataj => userDataj.json())
            .then(function (userData) {
                let divItemRow = document.createElement('div');
                divItemRow.setAttribute('class', `item row item-${reservData.validation === -1 ? 'indisponible' : (reservData.validation === 0 ? 'en-attente' : 'disponible')}`);
            
                let divGauche = document.createElement('div');
                divGauche.setAttribute('class', 'gauche col-4');
            
                let image = document.createElement('img');
                image.setAttribute('class', 'float-left');
                image.setAttribute('src', elemData.photo);
                image.setAttribute('alt', 'photo de la reservation'); // <h5 style= "text-align:center;"><strong>Accepté</strong></h5>
                divGauche.appendChild(image);
    
                let h5etat = document.createElement('h5');
                h5etat.setAttribute('style', 'text-align:center;');
    
                let strongetat = document.createElement('strong');
                strongetat.textContent = (reservData.validation === 0 ? 'En attente de validation' : (reservData.validation === -1 ? 'Refusé' : 'Validé'));
                h5etat.appendChild(strongetat);
                divGauche.appendChild(h5etat);
            
                let divDroite = document.createElement('div');
                divDroite.setAttribute('class', 'droite col-8');
    
                let pDesc = document.createElement('p');
                pDesc.setAttribute('class', 'description float-left');
                if (reservData.validation === 0) {
                    pDesc.innerHTML = userData.prenom + ' ' + userData.nom
                        + ' souhaite emprunter '
                        + (elemData.batiment === undefined ? '' : 'la salle ')
                        + elemData.nom
                        + ' du ' + reservData.date_heure_debut
                        + ' au ' + reservData.date_heure_fin
                        + '.<br/>Raison : '
                        + reservData.raison;
                    divDroite.appendChild(pDesc);
                    
                    let divButtons = document.createElement('div');
                    divButtons.setAttribute('class', 'btn-group');

                    let inputVal = document.createElement('input');
                    inputVal.setAttribute('type', 'submit');
                    inputVal.setAttribute('class', 'btn btn-success');
                    inputVal.setAttribute('value', 'Valider');
                    inputVal.addEventListener('click', () => validateReserv(event, reservData.id, true));
                    divButtons.appendChild(inputVal);

                    let inputRef = document.createElement('input');
                    inputRef.setAttribute('type', 'submit');
                    inputRef.setAttribute('class', 'btn btn-danger');
                    inputRef.setAttribute('value', 'Refuser');
                    inputRef.addEventListener('click', () => {validateReserv(event, reservData.id, false);});
                    divButtons.appendChild(inputRef);
                    divDroite.appendChild(divButtons);
                }
                else {
                    pDesc.textContent = 'Votre demande de réservation pour '
                        + (elemData.batiment === undefined ? '' : 'la salle ')
                        + elemData.nom
                        + ' du ' + reservData.date_heure_debut
                        + ' au ' + reservData.date_heure_fin
                        + ' a été '
                        + (reservData.validation === -1 ? 'refusée.' : 'acceptée.');
                    divDroite.appendChild(pDesc);
                }
            
                divItemRow.appendChild(divGauche);
                divItemRow.appendChild(divDroite);
                document.querySelector('#liste_notifs').appendChild(divItemRow);
                document.querySelector('#liste_notifs').appendChild(document.createElement('br'));
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

function validateReserv(event, id, valid) {
    fetch('/api/reservation/validate', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Reservation: id, validate: (!valid ? false : true)}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(() => getNotifs())
    .catch(err => console.error(err));
}

async function openNotifs() {
    await getNotifs();
    let response = await fetch('/api/notification/getall');
    if (response.ok) {
        let notifs = await response.json();
        notifs.forEach(notif => {
            if (notif.admin === 0) {
                fetch('/api/notification/seen', {
                    credentials: 'same-origin',
                    method: 'POST',
                    body: JSON.stringify({id_Reservation: notif.id_Reservation}),
                    headers: new Headers({'Content-type': 'application/json'}),
                })
                .catch(err => console.error(err));
            }
        });
    }
    else {
        console.error('response not ok :');
        console.error(response);
    }
    getNbNotifs();
}

async function getNbNotifs() {
    let response = await fetch('/api/notification/getall');
    if (response.ok) {
        let notifs = await response.json();
        document.querySelector('.badge.badge-danger').textContent = '' + notifs.length;
    }
    else {
        console.error('response not ok :');
        console.error(response);
    }
}

getNbNotifs();
document.getElementById('btn-notifs').addEventListener('click', openNotifs);


// à utiliser quand on saura comment ça marche
/*let idIntervalNotif = setInterval(getNotifs, 1000);
window.addEventListener('unload', clearInterval(idIntervalNotif));*/