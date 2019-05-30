'use strict';

async function searchSalle (formBalise) {
    let formData = new FormData(formBalise);

    try {
        let response = await fetch(prefixDir + '/api/salle/search', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({
                critere: formData.get('critere'),
                date_heure_debut: formData.get('date-debut') + ' ' + formData.get('heure-debut'),
                date_heure_fin: formData.get('date-fin') + ' ' + formData.get('heure-fin'),
                batiment: formData.get('batiment') !== '...' ? formData.get('batiment') : undefined,
                videoproj: formData.get('videoproj'),
                tableau: formData.get('tableau'),
                ordinateurs: formData.get('ordinateurs'),
                capacite: formData.get('capacite'),
            }),
            headers: new Headers({'Content-type': 'application/json'}),
        });
        let salleDatas = await response.json();

        let salleListe = document.getElementById('liste_salles');
        while (salleListe.firstChild) {
            salleListe.removeChild(salleListe.firstChild);
        }

        
        let crens = await fetch(prefixDir + '/api/creneau/getall');
        let crenData = await crens.json();
        crenData = crenData.map(c => {
            return {
                id: c.id,
                date_heure_debut: Date.parse(c.date_heure_debut) + 3600000,
                date_heure_fin: Date.parse(c.date_heure_fin) + 3600000,
                id_Element: c.id_Element,
            };
        })
        .filter(c => c.date_heure_fin > Date.now());

        salleDatas.sort(function (salle1, salle2) {
            let res = 0
            switch (formData.get('tri')) {
            case 'Par dates de disponibilité':
                crenData.sort(function (cren1, cren2) {
                    if ((cren1.id_Element === salle1.id_Element || cren1.id_Element === salle2.id_Element)
                        && cren2.id_Element !== salle1.id_Element && cren2.id_Element !== salle2.id_Element) {
                        return -1;
                    }
                    if ((cren2.id_Element === salle1.id_Element || cren2.id_Element === salle2.id_Element)
                        && cren1.id_Element !== salle1.id_Element && cren1.id_Element !== salle2.id_Element) {
                        return 1;
                    }
                    if (cren1.id_Element !== salle1.id_Element && cren1.id_Element !== salle2.id_Element
                        && cren2.id_Element !== salle1.id_Element && cren2.id_Element !== salle2.id_Element) {
                        return 0;
                    }
                    return cren1.date_heure_debut - cren2.date_heure_debut;
                });
                if (crenData[0]) {
                    if (crenData[0].id_Element === salle1.id_Element) {
                        res = -1;
                    }
                    if (crenData[0].id_Element === salle2.id_Element) {
                        res = 1;
                    }
                }
                break;
            case 'Par dates de disponibilité décroissantes':
                crenData.sort(function (cren1, cren2) {
                    if ((cren1.id_Element === salle1.id_Element || cren1.id_Element === salle2.id_Element)
                        && cren2.id_Element !== salle1.id_Element && cren2.id_Element !== salle2.id_Element) {
                        return -1;
                    }
                    if ((cren2.id_Element === salle1.id_Element || cren2.id_Element === salle2.id_Element)
                        && cren1.id_Element !== salle1.id_Element && cren1.id_Element !== salle2.id_Element) {
                        return 1;
                    }
                    if (cren1.id_Element !== salle1.id_Element && cren1.id_Element !== salle2.id_Element
                        && cren2.id_Element !== salle1.id_Element && cren2.id_Element !== salle2.id_Element) {
                        return 0;
                    }
                    return cren2.date_heure_debut - cren1.date_heure_debut;
                });
                if (crenData[0]) {
                    if (crenData[0].id_Element === salle1.id_Element) {
                        res = -1;
                    }
                    if (crenData[0].id_Element === salle2.id_Element) {
                        res = 1;
                    }
                }
                break;
            case 'Par capacités':
                res = salle1.capacite - salle2.capacite;
                break;
            case 'Par capacités décroissantes':
                res = salle2.capacite - salle1.capacite;
                break;
            default:
                break;
            }
            return res;
        });

        salleDatas.forEach(salle => insertSalle(salle));
    }
    catch (err) {
        console.error(err);
    }
}

async function getAllSalle () {
    let response = await fetch(prefixDir + '/api/salle/getall');
    if (response.ok) {
        let salles = await response.json();
        let salleListe = document.querySelector('#liste_salles');
        while (salleListe.firstChild) {
            salleListe.removeChild(salleListe.firstChild);
        }
        salles.reverse().forEach(salle => insertSalle(salle));
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
    pDispo.setAttribute('class', 'disponible');
    pDispo.textContent = 'Disponible selon vos critères'; // TODO changer en fonction de si la case dispo est cochées
    divDroite.appendChild(pDispo);

    let buttonPlan = document.createElement('button');
    buttonPlan.setAttribute('type', 'button');
    buttonPlan.setAttribute('class', 'btn btn-light');
    buttonPlan.setAttribute('data-toggle', 'modal');
    buttonPlan.setAttribute('data-target', '#calendrier');
    buttonPlan.setAttribute('onclick', `resetFocusDate();updateCalendar(focusDate, ${salleData.id_Element});`);
    buttonPlan.textContent = 'Planning complet';
    divDroite.appendChild(buttonPlan);
    divDroite.innerHTML += '&ensp;';
    
    let buttonRes = document.createElement('button');
    buttonRes.setAttribute('type', 'button');
    buttonRes.setAttribute('class', 'btn btn-primary');
    buttonRes.setAttribute('data-toggle', 'modal');
    buttonRes.setAttribute('data-target', '#exampleModalCenter'); // TODO : changer l'id target
    buttonRes.textContent = 'Réserver';
    buttonRes.addEventListener('click', actuSalleReserv);
    divDroite.appendChild(buttonRes);

    divItemRow.appendChild(divDroite);
    
    document.getElementById('liste_salles').appendChild(divItemRow);
    document.getElementById('liste_salles').appendChild(document.createElement('br'));
}

function actuSalleReserv (event) {
    let idS = parseInt(event.target.parentElement.parentElement.attributes['id-salle'].value);
    fetch(prefixDir + '/api/salle/byid', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Salle: idS}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(result => result.json())
    .then(function (salleData) {
        document.getElementById('form-reserv').setAttribute('id-salle', salleData.id);
        let divGauche = document.querySelector('#form-reserv')
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

        document.getElementById('btn_planning_reserv').setAttribute('onclick', `resetFocusDate();updateCalendar(focusDate, ${salleData.id_Element});`);
    })
    .catch(err => console.error(err));
}

function actuSalleCal (event) {

}

function askReserv () {
    let formBalise = document.getElementById('form-reserv');
    let formData = new FormData(formBalise);

    fetch(prefixDir + '/api/reservation/submit/salle', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({
            id_Salle: formBalise.getAttribute('id-salle'),
            date_heure_debut: formData.get('date-debut') + ' ' + formData.get('heure-debut'),
            date_heure_fin: formData.get('date-fin') + ' ' + formData.get('heure-fin'),
            raison: formData.get('raison'),
        }),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(response => response.json())
    .then(function (result) {
        if (result.ok === false) {
            let divAlert = document.createElement('div');
            divAlert.setAttribute('class', 'alert alert-danger');
            divAlert.setAttribute('role', 'alert');
            divAlert.innerHTML = '<strong>Erreur!</strong> ';
            if (result.alreadyTaken) {
                divAlert.innerHTML += 'Le créneau que vous essayez de réserver est déjà pris (consultez le planning)';
            }
            if (result.outOfCren) {
                divAlert.innerHTML += 'La salle n\'est pas disponnible dans le créneau demandé (consultez le planning)';
            }
            if (result.wrongCren) {
                divAlert.innerHTML += 'Le créneau demandé n\'est pas valide';
            }

            document.querySelector('#form-reserv').insertBefore(divAlert, document.querySelector('#form-reserv').lastElementChild);
        }
    })
    .catch(err => console.error(err));
}

document.querySelector('button.btn.btn-danger.col-2').addEventListener('click', function () {
    let divAlert = document.querySelector('div.alert.alert-danger');
    if (divAlert) {
        document.querySelector('#form-reserv').removeChild(divAlert);
    }
});
document.querySelector('input.btn.btn-primary.col-2').addEventListener('click', function () {
    let divAlert = document.querySelector('div.alert.alert-danger');
    if (divAlert) {
        document.querySelector('#form-reserv').removeChild(divAlert);
    }
});
document.querySelector('input.btn.btn-primary.col-2').addEventListener('click', askReserv);
getAllSalle();
