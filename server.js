'use strict';

const express = require('express');
const app = express();
const api = require('./api.js');
const auth = require('./auth.js');
const dbHelper = require('./dbHelper.js');
const passport = auth(app);

const prod = false;

const prefixDir = prod ? '/4C' : '';

// l'api d'accès aux données sera disponible sous la route "/api"
app.use(prefixDir + '/api',
    function (req, res, next) {
        if ((req.url.indexOf('/utilisateur/login') === -1 && req.url.indexOf('/utilisateur/register') === -1 && req.url.indexOf('/reservation/allbyElem') === -1 && !req.user)
            || (req.url.indexOf('/add') >= 0 && req.user.admin === 0)) {
            res.redirect('/public/connexion.html');
        }
        else {
            next();
        }
    },
    api(passport)
);

// Le contenu statique public sera lu à partir du repertoire 'public'
app.use(prefixDir + '/', express.static('public'));
app.use(prefixDir + '/public', express.static('public'));

app.use(prefixDir + '/private/admin',
    require('connect-ensure-login').ensureLoggedIn('/public/connexion.html'),
    function (req, res, next) {
        console.log('requesting admin access : ' + JSON.stringify(req.user));
        if (!req.user) {
            res.redirect('/public/connexion.html');
        }
        else {
            dbHelper.Utilisateur.byNumEt(req.user.numero_etudiant)
            .then(function (etu) {
                if (etu) {
                    if (etu.admin === 1 && etu.mot_de_passe === req.user.mot_de_passe) {
                        next();
                    }
                    else {
                        res.redirect('/public/connexion.html');
                    }
                }
                else {
                    res.redirect('/public/connexion.html');
                }
            })
            .catch(err => {
                console.error(err);
                res.redirect('/public/connexion.html')
            });
        }
    }
);

app.use(prefixDir + '/private',
    require('connect-ensure-login').ensureLoggedIn('/public/connexion.html'),
    function (req, res, next) {
        console.log('requesting private access : ' + JSON.stringify(req.user));
        next();
    },
    express.static('private')
);

let envPort = 'PORT' in process.env ? process.env.PORT : 8081;

const server = app.listen(envPort, function () {
    let port = server.address().port;
    let addr = server.address().address === '::' ? 'localhost' : server.address().address;
    console.log('Listening on http://%s:%s', addr, port);
});
