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

    app.post('/element/equipement/add', function (req, res, next) {
        console.log(req.body);
    });

    return app;
}
