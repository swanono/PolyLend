'use strict';

function getAllMateriel () {
    fetch(prefixDir + '/api/materiel/getall')
    .then( function (response) {
        if (response.ok) {
            response.json()
            .then(data => insertMat(data))
            .catch(err => console.error(err));
        }
        else {
            console.error(response.statusText);
        }
    })
    .catch(err => console.error(err));
}

function insertMat (data) {
    var elemListe = document.querySelector('.liste');
    data.forEach(function (materiel) {
        if (materiel.disponibilite === 'indispo') {
            //creation d'un item indisponible
            let newItemIndispo = document.createElement('div');
            newItemIndispo.setAttribute('class', 'item row item-indisponible');
            newItemIndispo.setAttribute('id-materiel', materiel.id);
            newItemIndispo.setAttribute('id-element', materiel.id_Element);
            elemListe.appendChild(newItemIndispo);

            //positionnement gauche
            let elemDivGauche = document.createElement('div');
            elemDivGauche.setAttribute('class', 'gauche col-6');
            newItemIndispo.appendChild(elemDivGauche);

            //ajout de l'image du materiel
            let imgItem = document.createElement('img');
            imgItem.setAttribute('src', materiel.photo);
            imgItem.setAttribute('class', 'float-left');
            elemDivGauche.appendChild(imgItem);

            //ajout du nom
            let elemH2 = document.createElement('h2');
            let elemStrong = document.createElement('strong');
            elemDivGauche.appendChild(elemH2);
            elemH2.appendChild(elemStrong);
            elemStrong.textContent = materiel.nom;

            //ajout de la description
            let elemPDescription = document.createElement('p');
            elemPDescription.setAttribute('class','description');
            elemPDescription.innerHTML = materiel.description + '<br/>Lieu : ' + materiel.lieu + '<br/>Type : ' + materiel.categorie;
            elemDivGauche.appendChild(elemPDescription);


            //positionnement divDroite
            let elemDivDroite = document.createElement('div');
            elemDivDroite.setAttribute('class', 'droite col-6');
            newItemIndispo.appendChild(elemDivDroite);

            //texte indisponible
            let elemPIndispo = document.createElement('p');
            let elemSpanIndispo = document.createElement('span')
            elemSpanIndispo.setAttribute('class','indisponible');
            elemSpanIndispo.textContent = 'Réservé par : ';
            elemPIndispo.appendChild(elemSpanIndispo);
            //elemPIndispo.textContent += materiel.booker; //PB => casse le style du span...
            elemDivDroite.appendChild(elemPIndispo);

            // boutton affichage calendrier
            let buttonCalendar = document.createElement('button');
            buttonCalendar.setAttribute('type','button');
            buttonCalendar.setAttribute('class','btn btn-light');
            buttonCalendar.setAttribute('data-toggle','modal');
            buttonCalendar.setAttribute('data-target','#calendrier');
            buttonCalendar.setAttribute('onclick', `resetFocusDate();updateCalendar(focusDate, ${materiel.id_Element});`);
            buttonCalendar.textContent = 'Planning complet';
            elemDivDroite.appendChild(buttonCalendar);

            //boutton Message
            let buttonMsg  = document.createElement('button');
            buttonMsg.setAttribute('type','button');
            buttonMsg.setAttribute('class','btn btn-primary');
            buttonMsg.textContent = 'Message';
            elemDivDroite.appendChild(buttonMsg);

            //saut de ligne (mise en page)
            let elemBr = document.createElement('br');
            elemListe.appendChild(elemBr);
        }
        else{
            //creation d'un item disponible
            let newItemDispo = document.createElement('div');
            newItemDispo.setAttribute('class', 'item row');
            newItemDispo.setAttribute('id-materiel', materiel.id);
            newItemDispo.setAttribute('id-element', materiel.id_Element);
            elemListe.appendChild(newItemDispo);

            //positionnement gauche
            let elemDivGauche = document.createElement('div');
            elemDivGauche.setAttribute('class', 'gauche col-6');
            newItemDispo.appendChild(elemDivGauche);

            //ajout de l'image du materiel
            let imgItem = document.createElement('img');
            imgItem.setAttribute('src', materiel.photo);
            imgItem.setAttribute('class', 'float-left');
            elemDivGauche.appendChild(imgItem);

            //ajout du nom
            let elemH2 = document.createElement('h2');
            let elemStrong = document.createElement('strong');
            elemDivGauche.appendChild(elemH2);
            elemH2.appendChild(elemStrong);
            elemStrong.textContent = materiel.nom;

            //ajout de la description
            let elemPDescription = document.createElement('p');
            elemPDescription.setAttribute('class','description');
            elemPDescription.innerHTML = materiel.description + '<br/>Lieu : ' + materiel.lieu + '<br/>Type : ' + materiel.categorie;
            elemDivGauche.appendChild(elemPDescription);


            //positionnement divDroite
            let elemDivDroite = document.createElement('div');
            elemDivDroite.setAttribute('class', 'droite col-6');
            newItemDispo.appendChild(elemDivDroite);

            //texte disponible
            let elemPDispo = document.createElement('p');
            elemPDispo.setAttribute('class','disponible');
            elemPDispo.textContent = 'Disponible selon vos critères';
            elemDivDroite.appendChild(elemPDispo);

            // boutton affichage calendrier
            let buttonCalendar = document.createElement('button');
            buttonCalendar.setAttribute('type','button');
            buttonCalendar.setAttribute('class','btn btn-light');
            buttonCalendar.setAttribute('data-toggle','modal');
            buttonCalendar.setAttribute('data-target','#calendrier');
            buttonCalendar.setAttribute('onclick', `resetFocusDate();updateCalendar(focusDate, ${materiel.id_Element});`);
            buttonCalendar.textContent = 'Planning complet';
            elemDivDroite.appendChild(buttonCalendar);
            elemDivDroite.innerHTML += '&ensp;';

            //boutton Reserver
            let buttonRes  = document.createElement('button');
            buttonRes.setAttribute('type','button');
            buttonRes.setAttribute('class','btn btn-primary');
            buttonRes.setAttribute('data-toggle','modal');
            buttonRes.setAttribute('data-target','#exampleModalCenter');
            buttonRes.textContent = 'Reserver';
            buttonRes.addEventListener('click', actuMaterielReserv);
            elemDivDroite.appendChild(buttonRes);

            //saut de ligne (mise en page)
            let elemBr = document.createElement('br');
            elemListe.appendChild(elemBr);

        }
    })
}

function actuMaterielReserv (event) {
    let idM = parseInt(event.target.parentElement.parentElement.attributes['id-materiel'].value);
    fetch(prefixDir + '/api/materiel/byid', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Materiel: idM}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(result => result.json())
    .then(function (data) {
        document.getElementById('form-reserv').setAttribute('id-materiel', data.id);
        let divGauche = document.getElementById('form-reserv')
                                .lastElementChild
                                .firstElementChild
                                .firstElementChild;

        Array.from(divGauche.children).forEach(function (balise) {
            switch (balise.tagName) {
            case 'IMG':
                balise.setAttribute('src', data.photo);
                break;
            case 'H2':
                balise.firstElementChild.textContent = data.nom;
                break;
            case 'P':
                balise.textContent = data.description;
                break;
            }
        });
    })
    .catch(err => console.error(err));
}



function askReserv () {
    let formBalise = document.getElementById('form-reserv');
    let formData = new FormData(formBalise);

    fetch(prefixDir + '/api/reservation/submit/materiel', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({
            id_Materiel: formBalise.getAttribute('id-materiel'),
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
                divAlert.innerHTML += 'Le matériel n\'est pas disponnible dans le créneau demandé (consultez le planning)';
            }
            if (result.wrongCren) {
                divAlert.innerHTML += 'Le créneau demandé n\'est pas valide';
            }

            document.querySelector('#form-reserv').insertBefore(divAlert, document.querySelector('#form-reserv').lastElementChild);
        }
    })
    .catch(err => console.error(err));
}


async function searchMat (formBalise) {
    let formData = new FormData(formBalise);

    try {
        let response = await fetch(prefixDir + '/api/materiel/search', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({
                critere: formData.get('critere'),
                date_heure_debut: formData.get('date-debut') + ' ' + formData.get('heure-debut'),
                date_heure_fin: formData.get('date-fin') + ' ' + formData.get('heure-fin'),
                categorie: formData.get('type') !== '...' ? formData.get('type') : undefined,
            }),
            headers: new Headers({'Content-type': 'application/json'}),
        });
        let MatDatas = await response.json();

        let MatListe = document.getElementById('liste_materiel');


        while (MatListe.firstChild) {
            MatListe.removeChild(MatListe.firstChild);
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

        MatDatas.sort(function (Mat1, Mat2) {
            let res = 0
            switch (formData.get('tri')) {
            case 'Par dates de disponibilité':
                crenData.sort(function (cren1, cren2) {
                    if ((cren1.id_Element === Mat1.id_Element || cren1.id_Element === Mat2.id_Element)
                        && cren2.id_Element !== Mat1.id_Element && cren2.id_Element !== Mat2.id_Element) {
                        return -1;
                    }
                    if ((cren2.id_Element === Mat1.id_Element || cren2.id_Element === Mat2.id_Element)
                        && cren1.id_Element !== Mat1.id_Element && cren1.id_Element !== Mat2.id_Element) {
                        return 1;
                    }
                    if (cren1.id_Element !== Mat1.id_Element && cren1.id_Element !== Mat2.id_Element
                        && cren2.id_Element !== Mat1.id_Element && cren2.id_Element !== Mat2.id_Element) {
                        return 0;
                    }
                    return cren1.date_heure_debut - cren2.date_heure_debut;
                });
                if (crenData[0]) {
                    if (crenData[0].id_Element === Mat1.id_Element) {
                        res = -1;
                    }
                    if (crenData[0].id_Element === Mat2.id_Element) {
                        res = 1;
                    }
                }
                break;
            case 'Par dates de disponibilité décroissantes':
                crenData.sort(function (cren1, cren2) {
                    if ((cren1.id_Element === Mat1.id_Element || cren1.id_Element === Mat2.id_Element)
                        && cren2.id_Element !== Mat1.id_Element && cren2.id_Element !== Mat2.id_Element) {
                        return -1;
                    }
                    if ((cren2.id_Element === Mat1.id_Element || cren2.id_Element === Mat2.id_Element)
                        && cren1.id_Element !== Mat1.id_Element && cren1.id_Element !== Mat2.id_Element) {
                        return 1;
                    }
                    if (cren1.id_Element !== Mat1.id_Element && cren1.id_Element !== Mat2.id_Element
                        && cren2.id_Element !== Mat1.id_Element && cren2.id_Element !== Mat2.id_Element) {
                        return 0;
                    }
                    return cren2.date_heure_debut - cren1.date_heure_debut;
                });
                if (crenData[0]) {
                    if (crenData[0].id_Element === Mat1.id_Element) {
                        res = -1;
                    }
                    if (crenData[0].id_Element === Mat2.id_Element) {
                        res = 1;
                    }
                }
                break;
            case 'Par quantités':
                res = Mat1.quantite - Mat2.quantite;
                break;
            case 'Par quantités décroissantes':
                res = Mat2.quantite - Mat1.quantite;
                break;
            default:
                break;
            }
            return res;
        });
        insertMat(MatDatas);
    }
    catch (err) {
        console.error(err);
    }
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
getAllMateriel();
