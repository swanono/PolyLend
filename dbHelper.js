'use strict';

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./Database-PolyLend.db', sqlite3.OPEN_READWRITE, function (err) {
    if (err) {
        console.error(err + '\n' + 'run "npm run createDB" to create a database file');
        require('process').exit(-1);
    }
    else {
        console.log('Connected to Database-PolyLend.db');
    }
});

// Rend la fonction get de l'api sqlite compatible avec les promesses
const get = sql => new Promise(function (resolve, reject) {
    db.get(sql, function (err, row) {
        if (err) {
            reject(err);
        }
        else {
            resolve(row);
        }
    });
});

// Idem pour la fonction all
const all = sql => new Promise(function (resolve, reject) {
    db.all(sql, function (err, rows) {
        if (err) {
            reject(err);
        }
        else {
            resolve(rows);
        }
    });
});

// Idem pour la fonction run
const run = sql => new Promise(function (resolve, reject) {
    db.run(sql, function (err) {
        if (err) {
        	reject(err);
        }
        else {
        	resolve();
            console.log('command "' + sql + '" executed.');
        }
    });
});

/*
aller voir les url :
http://www.sqlitetutorial.net/sqlite-nodejs/
http://www.sqlitetutorial.net/sqlite-nodejs/insert/
http://www.sqlitetutorial.net/sqlite-nodejs/query/
http://www.sqlitetutorial.net/sqlite-nodejs/statements-control-flow/
*/