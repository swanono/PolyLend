'use strict';

const express = require('express');
const app = express();
const api = require('./api.js');
const auth = require('./auth.js');
const passport = auth(app);



// l'api d'accès aux données sera disponible sous la route "/api"
app.use('/api', api(passport));

// Le contenu statique public sera lu à partir du repertoire 'public'
app.use('/public', express.static('public'));



app.listen(8081);
