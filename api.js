/* eslint-env node */
'use strict';

// Ce module nodejs gère l'API de notre site
// Il définit l'ensemble des routes (relative à "/api") corresponant aux
// points d'entrée de l'API

// Expressjs
const express = require('express');
// Notre module nodejs d'accès simplifié à la base de données
const dbHelper = require('./dbhelper.js');


module.exports = (passport) => {
    const app = express();

    app.post('/materiel/add', function (req, res, next) {
        console.log(req.body);
        /*
        dbHelper.Association.byName(req.body.assoName)
        .then(function (asso){
            dbHelper.Equipement.insert({
                nom: req.body.name,
                date_achat: `${req.body.jour_achat< 10 ? '0' + req.body.jour_achat : req.body.jour_achat}/${req.body.mois_achat < 10 ? '0' + req.body.mois_achat : req.body.mois_achat}/${req.body.annee_achat}`,
                etat: req.body.etat,
                description: req.body.description,
                photo: ''/*trouver le lien,
                id_Salle: asso.id_Salle,
                id_Association: asso.id,
            });
        })
        .catch(err => console.error(err));*/
    });

    return app;
}
