'use strict';

// Notre module nodejs d'accès simplifié à la base de données
const dbHelper = require('./dbHelper.js');


dbHelper.Salle.insert({
    numero_salle: 25,
    video_proj: 0,
    nom_batiment: 'IHT',
    nom_aile: 'B',
})
.then(function (salle) {
    dbHelper.Association.insert({
        nom: 'IdeSYS',
        nb_adherents: 18,
        id_Salle: salle.id,
    })
    .then(function (asso) {
        dbHelper.Salle.insert({
            numero_salle: 23,
            video_proj: 1,
            nom_batiment: 'IHT',
            nom_aile: 'B',
            description: 'la salle des CA d idesys',
            photo: 'photophoto',
            id_Association: asso.id,
        });

        dbHelper.Utilisateur.insert({
            numero_etudiant: 'E154706J',
            nom: 'GUYON',
            prenom: 'Ulysse',
            mot_de_passe: 'Le mot de passe de ulysse',
            id_Association: asso.id,
        });

        dbHelper.Equipement.insert({
            nom: 'chaise',
            date_achat: '30/08/2013',
            etat: 'ok',
            description: 'la chaise de la prez',
            photo: 'photophoto',
            id_Salle: asso.id_Salle,
            id_Association: asso.id,
        })
        .then(function (newEquip) {
            console.log('une ' + newEquip.nom + ' a été insérée dans la bdd. Son etat est : ' + newEquip.etat);
        })
        .catch(err => console.error(err));
    });
})
.catch(err => console.error(err));