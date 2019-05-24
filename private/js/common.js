'use strict';

fetch('/api/whoami')
.then(response => response.json())
.then(user => document.getElementById('username').innerHTML = (user.prenom + ' ' + user.nom + '<br/>' + user.numero_etudiant))
.catch(err => console.error(err));