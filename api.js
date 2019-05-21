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
            dbHelper.Materiel.insert({
                quantite: req.body.quantite,
                categorie: req.body.categorie,
                lieu: req.body['lieu-de-dispo'],
                nom: req.body.nom,
                description: req.body.description,
                photo: ''/*trouver le lien*/,
                validation_auto: req.body.validation_auto,
            })
            .then(function (resultat) {
                for (let i = 0 ; i < req.body['date-fin'].length ;i+=1 ) {
                    dbHelper.Creneau.insert({
                        date_heure_debut : `${req.body['date-debut'][i]} ${req.body['heure-debut'][i]}`,
                        date_heure_fin : `${req.body['date-fin'][i]} ${req.body['heure-fin'][i]}`,
                        id_Element : resultat.id,
                    });
                }
                dbHelper.MotCle.insert({
                    mots: req.body['mot-cle'],
                    id_Element: resultat.id,
                });
            })
            .catch(err => console.error(err));
    });

    app.post('/salle/add', function (req, res, next) {
        console.log(req.body);
        
    });

    return app;
}
