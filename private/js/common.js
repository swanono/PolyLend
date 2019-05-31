'use strict';

fetch('../../api/whoami/')
.then(r => {if (r.ok) {return r;} else {throw r;}})
.then(response => response.json())
.then(user => document.getElementById('username').innerHTML = (user.prenom + ' ' + user.nom + '<br/>' + user.numero_etudiant))
.catch(err => console.error(err));