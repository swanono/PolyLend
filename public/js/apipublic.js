'use strict';


document.getElementById('form_login').setAttribute('action', (window.location.pathname.includes('public') ? '../' : '') + './api/utilisateur/login/');
document.getElementById('form_register').setAttribute('action', (window.location.pathname.includes('public') ? '../' : '') + './api/utilisateur/register/');