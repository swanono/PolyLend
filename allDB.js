'use strict';

const dbHelper = require('./dbHelper.js');

dbHelper.Utilisateur.all().then(res => console.log(res)).catch(err => console.error(err));
dbHelper.Salle.all().then(res => console.log(res)).catch(err => console.error(err));
dbHelper.Materiel.all().then(res => console.log(res)).catch(err => console.error(err));
dbHelper.Creneau.all().then(res => console.log(res)).catch(err => console.error(err));
dbHelper.Reservation.all().then(res => console.log(res)).catch(err => console.error(err));
dbHelper.MotCle.all().then(res => console.log(res)).catch(err => console.error(err));