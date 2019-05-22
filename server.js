'use strict';

const express = require('express');
const app = express();
const api = require('./api.js');
const auth = require('./auth.js');
const dbHelper = require('./dbhelper.js');
const passport = auth(app);



// l'api d'accès aux données sera disponible sous la route "/api"
app.use('/api', api(passport));

// Le contenu statique public sera lu à partir du repertoire 'public'
app.use('/', express.static('public'));
app.use('/public', express.static('public'));
<<<<<<< HEAD
app.use('/private', express.static('private'));

=======

app.use('/private/admin',
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

app.use('/private',
    require('connect-ensure-login').ensureLoggedIn('/public/connexion.html'),
    function (req, res, next) {
        console.log('requesting private access : ' + JSON.stringify(req.user));
        next();
    },
    express.static('private')
);
>>>>>>> f2292536ec12339a823376bd5287df7941206a09

const server = app.listen(8081, function () {
    let port = server.address().port;
    console.log('Listening on http://127.0.0.1:%s', port);
});
