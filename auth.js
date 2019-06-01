/* eslint-env node */
'use strict';

// Ce module permet de gérer l'authentification avec la librairie passportjs
// Il dépend également du module dbHelper puisque les informations de nos
// utilisateurs sont stockées dans la base de données

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dbHelper = require('./dbHelper.js');

// BCrypt module
const bcrypt = require('bcrypt');
const saltRounds = 11;

// LocalStrategy = stockage des identifiants et mots de passe
// des utilisateurs en local dans notre base de données
passport.use(new LocalStrategy({
        usernameField: 'identifiant',
        passwordField: 'password',
    },
    function (username, password, cb) {
        // On récupère les information (mot de passe) de l'utilisateur
        // passé en paramètre
        dbHelper.Utilisateur.byNumEt(username)
        .then(
            user => {
                // Utilisateur pas dans la base de données
                if (!user) {
                    cb(null, false);
                }
                // Utilisateur dans la base de données et mot de passe ok
                else if (user.mot_de_passe === password && username === 'FIRST_ADMIN_SERVER' && password === 'un truc absurde') {
                    cb(null, user);
                }
                // Utilisateur dans la base de données mais mauvais mot de passe
                else {
                    bcrypt.compare(password, user.mot_de_passe)
                    .then(function (res) {
                        if (!res) {
                            cb(null, false);
                        }
                        else {
                            cb(null, user);
                        }
                    })
                    .catch(err => {console.log(err); cb(null, false);})
                }
            },
            err => {
                cb(err);
            },
        );
    }
));

// Stocke les données de l'utilisation dans le cookie de session
passport.serializeUser(function (user, cb) {
    console.debug('serializeUser ', JSON.stringify(user));
    cb(null, user);
});

// Récupère les données de l'utilisateur depuis le cookie de session
passport.deserializeUser(function (user, cb) {
    console.debug('deserializeUser ' + JSON.stringify(user));
    cb(null, user);
});


// Puisque c'est un module, on export au moins une fonction
// Ici c'est un "constructeur" qui prend une application express
// en paramètre afin de se déclarer comme middlewwre et pouvoir gérer
// l'authentification sur toutes les routes du site
module.exports = function (app) {
    app.use(require('cookie-parser')());
    app.use(require('body-parser').urlencoded({extended: true}));
    app.use(require('body-parser').json());
    app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));

    // Initialize Passport and restore authentication state, if any, from the
    // session.
    app.use(passport.initialize());
    app.use(passport.session());

    return passport;
};
