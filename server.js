'use strict';

const express = require('express');
const app = express();
const api = require('./api.js');
const auth = require('./auth.js');
const passport = auth(app);



// l'api d'accès aux données sera disponible sous la route "/api"
app.use('/api', api(passport));

// Le contenu statique public sera lu à partir du repertoire 'public'
app.use('/', express.static('public'));
app.use('/public', express.static('public'));
app.use('/private', express.static('private'));


const server = app.listen(8081, function () {
    let port = server.address().port;
    console.log('Listening on http://127.0.0.1:%s', port);
});
