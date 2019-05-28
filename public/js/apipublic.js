'use strict';


let form_login = document.getElementById('form_login');
if (form_login) {
    form_login.setAttribute('action', (window.location.pathname.includes('public') ? '../' : '') + './api/utilisateur/login/');
}

let form_register = document.getElementById('form_register');
if (form_register) {
	form_register.setAttribute('action', (window.location.pathname.includes('public') ? '../' : '') + './api/utilisateur/register/');
}
