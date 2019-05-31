'use strict';

function ajoutUtilisateurs () {
    let table = document.querySelector('table.table.table-bordered').lastElementChild;

    fetch('../../api/utilisateur/getall/')
    .then(r => {if (r.ok) {return r;} else {throw r;}})
    .then(users => users.json())
    .then(function (userDatas) {
        userDatas.forEach(function (userData, index) {
            let tr = document.createElement('tr');

            let th = document.createElement('th');
            th.setAttribute('scope', 'row');
            th.textContent = index;
            tr.appendChild(th);

            let tdName = document.createElement('td');
            tdName.textContent = userData.prenom + ' ' + userData.nom;
            tr.appendChild(tdName);

            let tdNumEtu = document.createElement('td');
            tdNumEtu.textContent = userData.numero_etudiant;
            tr.appendChild(tdNumEtu);

            let tdAdmin = document.createElement('td');
            let button = document.createElement('button');
            button.setAttribute('style', 'width: 100%; height: 100%;');
            button.setAttribute('class', 'btn btn-' + (!userData.admin ? 'danger' : 'success'));
            button.innerHTML = '&nbsp;';
            button.addEventListener('click', changeColor);
            tdAdmin.appendChild(button);

            tr.appendChild(tdAdmin);
            table.appendChild(tr);
        });
    })
    .catch(err => console.error(err));
}

function changeColor (event) {
    let button = event.target;
    let isAdmin = button.getAttribute('class').includes('success');
    button.setAttribute('class', 'btn btn-' + (isAdmin ? 'danger' : 'success'));
}

function applyAdmin () {
    let table = document.querySelector('table.table.table-bordered').lastElementChild;

    Array.from(table.children).forEach(function (tr) {
        let button = tr.lastElementChild.firstElementChild;
        let numEtu = tr.lastElementChild.previousElementSibling.textContent;

        fetch('../../api/utilisateur/setadminrights/', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({
                numero_etudiant: numEtu,
                admin: button.getAttribute('class').includes('success'),
            }),
            headers: new Headers({'Content-type': 'application/json'}),
        })
        .then(r => {if (r.ok) {return r;} else {throw r;}})
        .then(res => res.json())
        .then(function (result) {
            if (result.ok) {
                let divAlert = document.getElementById('divalert');
                divAlert.style.transition = 'visibility 0.5s, opacity 0.5s';
                divAlert.style.visibility = 'visible';
                divAlert.style.opacity = 1;

                setTimeout(() => {
                    divAlert.style.transition = 'visibility 2s, opacity 2s';
                    divAlert.style.opacity = 0;
                }, 3000);
            }
        })
        .catch(err => console.error(err));
    });
}

document.getElementById('apply').addEventListener('click', applyAdmin);
ajoutUtilisateurs();