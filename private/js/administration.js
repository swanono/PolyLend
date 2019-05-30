'use strict';

function addCren (strTab) {
    let tabBalise = document.getElementById('tableau-sans-bordure-' + strTab).firstElementChild;

    let tr = document.createElement('tr');

    let tdInputs = document.createElement('td');
    let divInputs = document.createElement('div');
    divInputs.setAttribute('class', 'form-group row');

    let p1 = document.createElement('p');
    p1.innerHTML = 'Du: <input class="float-right" name="date-debut" style="margin-right: 2px;" type="date" required><input type="time" name="heure-debut" required>';
    divInputs.appendChild(p1);

    let p2 = document.createElement('p');
    p2.innerHTML = 'Au: <input class="float-right" type="date" name="date-fin" required><input type="time" name="heure-fin" required>';
    divInputs.appendChild(p2);

    tdInputs.appendChild(divInputs);
    tr.appendChild(tdInputs);


    let tdTabs = document.createElement('td');
    tdTabs.innerHTML += '&ensp;&ensp;';
    tr.appendChild(tdTabs);

    let tdButton = document.createElement('td');
    let imgPoubelle = document.createElement('img');
    imgPoubelle.setAttribute('src', '../../public/image/poubelle.svg');
    imgPoubelle.setAttribute('width', '22px');
    let button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-danger btn-sm');
    button.appendChild(imgPoubelle);
    button.addEventListener('click', () => tr.remove());
    tdButton.appendChild(button);
    tr.appendChild(tdButton);

    tabBalise.appendChild(tr);
}

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

        let salleListe = document.getElementById('liste_salle_materiel');
        while (salleListe.firstChild) {
            salleListe.removeChild(salleListe.firstChild);
        }
        
        let crens = await fetch(prefixDir + '/api/creneau/getall');
        let crenData = await crens.json();
        crenData = crenData.map(c => {
            let d = new Date();
            return {
                id: c.id,
                date_heure_debut: Date.parse(c.date_heure_debut) - d.getTimezoneOffset()*60000,
                date_heure_fin: Date.parse(c.date_heure_fin) - d.getTimezoneOffset()*60000,
                id_Element: c.id_Element,
            };
        })
        .filter(c => c.date_heure_fin > Date.now());

        salleDatas.sort(function (salle1, salle2) {
            let res = 0
            switch (formData.get('tri_salle')) {
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
        let salleListe = document.getElementById('liste_salle_materiel');
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
    buttonPlan.textContent = 'Planning';
    // TODO buttonPlan.addEventListener('click', actuSalleCal);
    divDroite.appendChild(buttonPlan);
    divDroite.innerHTML += '&ensp;';
    
    let buttonMod = document.createElement('button');
    buttonMod.setAttribute('type', 'button');
    buttonMod.setAttribute('class', 'btn btn-warning');
    buttonMod.setAttribute('data-toggle', 'modal');
    buttonMod.setAttribute('data-target', ''); // TODO : changer l'id target
    buttonMod.textContent = 'Modifier';
    divDroite.appendChild(buttonMod);
    divDroite.innerHTML += '&ensp;';
    
    let buttonSuppr = document.createElement('button');
    buttonSuppr.setAttribute('type', 'button');
    buttonSuppr.setAttribute('class', 'btn btn-danger');
    buttonSuppr.innerHTML = '<img src="../../public/image/poubelle.svg" width="22px">';
    buttonSuppr.addEventListener('click', deleteSalle);
    divDroite.appendChild(buttonSuppr);

    divItemRow.appendChild(divDroite);
    
    document.getElementById('liste_salle_materiel').appendChild(divItemRow);
    document.getElementById('liste_salle_materiel').appendChild(document.createElement('br'));
}

async function deleteSalle (event) {
    let divItem = event.target;
    while (divItem.getAttribute('id-salle') === null) {
        divItem = divItem.parentElement;
    }
    
    try {
        await fetch(prefixDir + '/api/salle/delete', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({
                id_Salle: divItem.getAttribute('id-salle'),
                id_Element: divItem.getAttribute('id-element'),
            }),
            headers: new Headers({'Content-type': 'application/json'}),
        });

        divItem.remove();
    }
    catch (err) {
        console.log(err);
    }
}

document.getElementById('nav_salle').addEventListener('click', getAllSalle);
document.getElementById('ajout_cren_salle').addEventListener('click', () => addCren('salle'));
document.getElementById('ajout_cren_materiel').addEventListener('click', () => addCren('materiel'));


function getAllMateriel () {
    fetch(prefixDir + '/api/materiel/getall')
    .then(function (response) {
        if (response.ok) {
            response.json()
            .then(data => insertMat(data.reverse()))
            .catch(err => console.error(err));
        }
        else {
            console.error(response.statusText);
        }
    })
    .catch(err => console.error(err));
}

function insertMat (data) {
    let matListe = document.getElementById('liste_salle_materiel');
    while (matListe.firstChild) {
        matListe.removeChild(matListe.firstChild);
    }
    var elemListe = document.getElementById('liste_salle_materiel');
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
            
    
            let buttonMod = document.createElement('button');
            buttonMod.setAttribute('type', 'button');
            buttonMod.setAttribute('class', 'btn btn-warning');
            buttonMod.setAttribute('data-toggle', 'modal');
            buttonMod.setAttribute('data-target', ''); // TODO : changer l'id target
            buttonMod.textContent = 'Modifier';
            elemDivDroite.appendChild(buttonMod);
            elemDivDroite.innerHTML += '&ensp;';
    
            let buttonSuppr = document.createElement('button');
            buttonSuppr.setAttribute('type', 'button');
            buttonSuppr.setAttribute('class', 'btn btn-danger');
            buttonSuppr.innerHTML = '<img src="../../public/image/poubelle.svg" width="22px">';
            buttonSuppr.addEventListener('click', deleteMateriel);
            elemDivDroite.appendChild(buttonSuppr);

            elemListe.appendChild(document.createElement('br'));
        }
    })
}

async function deleteMateriel (event) {
    let divItem = event.target;
    while (divItem.getAttribute('id-materiel') === null) {
        divItem = divItem.parentElement;
    }
    
    try {
        await fetch(prefixDir + '/api/salle/delete', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({
                id_Salle: divItem.getAttribute('id-materiel'),
                id_Element: divItem.getAttribute('id-element'),
            }),
            headers: new Headers({'Content-type': 'application/json'}),
        });

        divItem.remove();
    }
    catch (err) {
        console.log(err);
    }
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

        let MatListe = document.getElementById('liste_salle_materiel');


        while (MatListe.firstChild) {
            MatListe.removeChild(MatListe.firstChild);
        }

        let crens = await fetch(prefixDir + '/api/creneau/getall');
        let crenData = await crens.json();
        crenData = crenData.map(c => {
            let d = new Date();
            return {
                id: c.id,
                date_heure_debut: Date.parse(c.date_heure_debut) - d.getTimezoneOffset()*60000,
                date_heure_fin: Date.parse(c.date_heure_fin) - d.getTimezoneOffset()*60000,
                id_Element: c.id_Element,
            };
        })
        .filter(c => c.date_heure_fin > Date.now());

        MatDatas.sort(function (Mat1, Mat2) {
            let res = 0
            switch (formData.get('tri_materiel')) {
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

document.getElementById('nav_materiel').addEventListener('click', getAllMateriel);
getAllMateriel();
