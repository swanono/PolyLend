'use strict';

const prod = true;

const prefixDir = prod ? '/4C' : '';

fetch(prefixDir + '/api/whoami')
.then(function(response) {
	response.json()
	.then(function (result) {
		alert('numero_etudiant = ' + result.numero_etudiant
				+ '\nnom = ' + result.nom
				+ '\nprenom = ' + result.prenom
				+ '\nmot_de_passe = ' + result.mot_de_passe
				+ '\nadmin = ' + result.admin);
	});
})