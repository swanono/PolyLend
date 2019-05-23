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

    app.get('/whoami', function (req, res) {
        res.send(req.user);
    });

    app.get('/logout', function (req, res) {
        req.logOut();
        res.redirect('/public/connexion.html');
    });

    app.post('/utilisateur/register', function (req, res) {
        dbHelper.Utilisateur.byNumEt(req.body['numero-etu'])
        .then(function (etu) {
            if (etu) {
                res.send({success: false, message: 'username already exists'});
            }
            else {
                dbHelper.Utilisateur.insert({
                    numero_etudiant: req.body['numero-etu'],
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    mot_de_passe: req.body.password,
                })
                .then(() => res.redirect('/public/connexion.html'))
                .catch(err => console.error(err));
            }
        })
        .catch(err => console.error(err));
    });

    app.post('/utilisateur/login', function (req, res, next) {
        if (!req.body.identifiant) {
            return res.send({success: false, message: 'empty username'});
        }
        if (!req.body.password) {
            return res.send({success: false, message: 'empty password'});
        }
        passport.authenticate('local', function (err, user, info) {
            console.log(user);
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.redirect('/public/connexion.html');
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/private/user/index.html');
            });
        })(req, res, next);
    });

    app.post('/utilisateur/bynum', function (req, res) {
        dbHelper.Utilisateur.byNumEt(req.body.id_Utilisateur)
        .then(etu => res.json(etu))
        .catch(err => console.error(err));
    });

    app.get('/notification/getall', function (req, res) {
        dbHelper.Notification.all()
        .then(function (notifs) {
            dbHelper.Reservation.all()
            .then(function (reservs) {
                // TODO : vérifier qu'on envoie bien les bonnes notifs 
                notifs = notifs.filter(notif => {
                    return (reservs.find(reserv => reserv.id === notif.id_Reservation).id_Utilisateur === req.user.numero_etudiant && notif.admin === 0) || (req.user.admin === 1 && notif.admin === 1);
                });
                res.json(notifs);
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });

    app.post('/notification/seen', function (req, res) {
        dbHelper.Notification.delete(req.body.id_Reservation)
        .then(() => true)
        .catch(err => console.error(err));
    });

    app.post('/reservation/allbyid', function (req, res) {
        dbHelper.Reservation.allById(req.body)
        .then(result => res.json(result))
        .catch(err => console.error(err));
    });

    app.post('/reservation/validate', function (req, res) {
        dbHelper.Reservation.validate(req.body.id_Reservation, req.body.validate)
        .then(result => res.json(result))
        .catch(err => console.error(err));
    });

    app.post('/creneau/byid', function (req, res) {
        dbHelper.Creneau.byId(req.body.id_Creneau)
        .then(result => res.json(result))
        .catch(err => console.error(err));
    });

    app.post('/element/byid', function (req, res) {
        dbHelper.Element.byIdFull(req.body.id_Element)
        .then(result => res.json(result))
        .catch(err => console.error(err));
    })

    app.post('/materiel/add', function (req, res, next) {
        dbHelper.Materiel.insert({
            quantite: req.body.quantite,
            categorie: req.body.categorie,
            lieu: req.body['lieu-de-dispo'],
            nom: req.body.nom,
            description: req.body.description,
            photo: 'https://via.placeholder.com/100',
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

    app.get('/salle/getall', function (req, res) {
        dbHelper.Salle.all()
        .then(salles => res.json(salles))
        .catch(err => console.error(err));
    });

    app.post('/salle/add', function (req, res, next) {
        let equipmentString = '';

        if (req.body.videoproj === 'on') {
            equipmentString += 'vidéo projecteur';
        }
        if (req.body.tableau === 'on') {
            if (req.body.videoproj === 'on'){
                equipmentString += ', tableau';
            }
            else {
                equipmentString += 'tableau';
            }
        }
        if (req.body.autre !== '') {
            if (equipmentString.length !== 0){
                equipmentString += `, ${req.body.autre}`;
            }
        }

        dbHelper.Salle.insert({
            batiment: req.body.batiment,
            etage: req.body.etage,
            capacite: req.body.capacite,
            equipement: equipmentString,
            nom: req.body.nom,
            description: req.body.description,
            photo: 'https://via.placeholder.com/100',
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
            })
            .then(() => res.redirect('/private/admin/administration.html'))
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
        
    });

    app.post('/salle/byid', function (req, res) {
        dbHelper.Salle.byId(req.body.id_Salle)
        .then(result => res.json(result))
        .catch(err => console.error(err));
    });

    return app;
}
