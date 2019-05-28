'use strict';

var prod = false;

var prefixDir = prod ? '/4C' : '';

fetch(prefixDir + '/api/whoami')
.then(response => response.json())
.then(function (result) {
	if(result.admin === 1){
		let div_nav = document.getElementById('nav');
		console.log(div_nav);

		let aBalise = document.createElement('a');
		aBalise.setAttribute('class', 'btn btn-secondary');
		aBalise.setAttribute('type', 'button');
		aBalise.setAttribute('href', '../admin/administration.html');
		
		let imgBalise = document.createElement('img');
		imgBalise.setAttribute('height','70px');
		imgBalise.setAttribute('src', '../../public/image/administration.svg');

		aBalise.appendChild(imgBalise);
		aBalise.appendChild(document.createElement('br'));
		aBalise.append('Administration');
		


		div_nav.insertBefore(aBalise, div_nav.lastElementChild);

	}
});


