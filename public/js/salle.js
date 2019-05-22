'use strict';

function getAllSalle () {
    fetch('/api/salle/getall')
    .then(function (response) {
        if (response.ok) {
            response.json()
            .then(function (salles) {
                let salleListe = document.querySelector('.liste');
                console.log(salles);
            })
            .catch(err => console.error(err));
        }
        else {
            console.error('response not ok !');
        }
    })
    .catch(err => console.error(err));
}