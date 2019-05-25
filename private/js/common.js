'use strict';

const prod = false;

const prefixDir = prod ? '/4C' : '';

fetch(prefixDir + '/api/whoami')
.then(response => response.json())
.then(user => document.getElementById('username').innerHTML = (user.prenom + ' ' + user.nom + '<br/>' + user.numero_etudiant))
.catch(err => console.error(err));