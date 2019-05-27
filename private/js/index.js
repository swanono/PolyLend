'use strict';

function getAllMateriel () {
    fetch(prefixDir + '/api/materiel/getall')
    .then( function (response) {
        if (response.ok) {
            response.json()
            .then( function (data) {
                var elemListe = document.querySelector('.liste');
                data.forEach( function (materiel) {
                    if (materiel.disponibilite === 'dispo') {
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
                        elemPDescription.textContent = materiel.description;
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
                        buttonCalendar.setAttribute('data-target','#calendrier1');
                        buttonCalendar.textContent = 'Planning complet';
                        elemDivDroite.appendChild(buttonCalendar);

                        //boutton Reserver
                        let buttonRes  = document.createElement('button');
                        buttonRes.setAttribute('type','button');
                        buttonRes.setAttribute('class','btn btn-primary');
                        buttonRes.setAttribute('data-toggle','modal');
                        buttonRes.setAttribute('data-target','#exampleModalCenter');
                        buttonRes.textContent = 'Reserver';
                        elemDivDroite.appendChild(buttonRes);

                        //saut de ligne (mise en page)
                        let elemBr = document.createElement('br');
                        elemListe.appendChild(elemBr);


                    }

                    else {
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
                        elemPDescription.textContent = materiel.description;
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
                        buttonCalendar.setAttribute('data-target','#calendrier1');
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
                })
            })
            .catch(err => console.error(err));
        }
        else {
            console.log(response.statusText);
        }
    })
    .catch(err => console.error(err));
}

console.log('test');
getAllMateriel();
