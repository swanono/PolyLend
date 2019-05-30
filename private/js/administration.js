'use strict';

function deleteCren (row) {

}

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

function actuSalleCal (event) {

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
    buttonPlan.textContent = 'Planning';
    buttonPlan.addEventListener('click', actuSalleCal);
    divDroite.appendChild(buttonPlan);
    divDroite.innerHTML += '&ensp;';
    
    let buttonMod = document.createElement('button');
    buttonMod.setAttribute('type', 'button');
    buttonMod.setAttribute('class', 'btn btn-warning');
    buttonMod.setAttribute('data-toggle', 'modal');
    buttonMod.setAttribute('data-target', '#exampleModalCenter'); // TODO : changer l'id target
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

