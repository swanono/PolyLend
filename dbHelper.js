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
        console.log('command "' + sql + '"');
        if (err) {
            console.log('--- REJECTED ---');
            reject(err);
        }
        else {
            console.log('(executed)');
            resolve(row);
        }
    });
});

// Idem pour la fonction all
const all = sql => new Promise(function (resolve, reject) {
    db.all(sql, function (err, rows) {
        console.log('command "' + sql + '"');
        if (err) {
            console.log('--- REJECTED ---');
            reject(err);
        }
        else {
            console.log('(executed)');
            resolve(rows);
        }
    });
});

// Idem pour la fonction run
const run = sql => new Promise(function (resolve, reject) {
    db.run(sql, function (err) {
        console.log('command "' + sql + '"');
        if (err) {
            console.log('--- REJECTED ---');
            reject(err);
        }
        else {
            console.log('(executed)');
            resolve();
        }
    });
});


module.exports.Element = {
    byId: id => get(`SELECT * FROM Element WHERE id = ${id};`),

    bySalleId: salleId => get(`SELECT * FROM Element WHERE id_Salle = ${salleId};`),

    byEquipId: equipId => get(`SELECT * FROM Element WHERE id_Equipement = ${equipId};`),

    all: () => all('SELECT * FROM Element;'),
};


const checkEquipData = equipData => new Promise(function (resolve, reject) {
    if (equipData.nom === undefined || equipData.date_achat === undefined || equipData.etat === undefined) {
        reject('Attributs de l\'équipement mal renseignés (nom - date_achat - etat)');
    }
    else if (equipData.description === undefined || equipData.photo === undefined
        || equipData.id_Salle === undefined || equipData.id_Association === undefined) {
        reject('Attributs de l\'élément mal renseignés (description - photo - id_Salle - id_Association)');
    }
    else {
        resolve(equipData);
    }
});

module.exports.Equipement = {
    insert: equipData => new Promise(function (resolve, reject) {
        checkEquipData(equipData)
        .then(function (equipData) {
            run(`INSERT INTO Equipement (nom, date_achat, etat)
                VALUES ("${equipData.nom}", "${equipData.date_achat}", "${equipData.etat}");`)
            .then(function () {
                get('SELECT MAX(id) as id FROM Equipement;')
                .then(function (maxid) {
                    run(`INSERT INTO Element (description, photo, id_Equipement, id_Salle, id_Association)
                        VALUES ("${equipData.description}",
                                "${equipData.photo}",
                                ${maxid.id},
                                ${equipData.id_Salle},
                                ${equipData.id_Association});`)
                    .then(function () {
                        get('SELECT * FROM Equipement JOIN Element ON Element.id_Equipement = Equipement.id WHERE (SELECT MAX(id) FROM Equipement) = Equipement.id;')
                        .then(res => resolve(res))
                        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
                    })
                    .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
                })
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    byName: name => get(`SELECT * FROM Equipement JOIN Element ON Element.id_Equipement = Equipement.id WHERE Equipement.nom = ${name};`),

    byId: id => get(`SELECT * FROM Equipement JOIN Element ON Element.id_Equipement = Equipement.id WHERE Equipement.id = ${id};`),

    all: () => all('SELECT * FROM Equipement JOIN Element ON Element.id_Equipement = Equipement.id'),
};


const checkSalleData = salleData => new Promise(function (resolve, reject) {
    let hasBasicAttr = !(salleData.numero_salle === undefined || salleData.video_proj === undefined
        || salleData.nom_batiment === undefined || salleData.nom_aile === undefined);
    let hasElemAttr = !(salleData.description === undefined || salleData.photo === undefined
        || salleData.id_Association === undefined);
    let hasSomeAttr = !(salleData.description === undefined && salleData.photo === undefined
        && salleData.id_Association === undefined);

    if (hasBasicAttr) {
        if (hasElemAttr) {
            resolve(true);
        }
        else if (hasSomeAttr) {
            reject('Attributs de l\'élément mal renseignés (description - photo - id_Salle - id_Association)');
        }
        else {
            resolve(false);
        }
    }
    else {
        reject('Attributs de la salle mal renseignés (numero_salle - video_proj - nom_batiment - nom_aile)');
    }
});

module.exports.Salle = {
    insert: salleData => new Promise(function (resolve, reject) {
        checkSalleData(salleData)
        .then(function (result) {
            run(`INSERT INTO Salle (numero_salle, video_proj, nom_batiment, nom_aile)
                VALUES (${salleData.numero_salle},
                        ${!salleData.video_proj ? 0 : 1},
                        "${salleData.nom_batiment}",
                        "${salleData.nom_aile}");`)
            .then(function () {
                if (result) {
                    get('SELECT MAX(id) as id FROM Salle;')
                    .then(function (maxid) {
                        run(`INSERT INTO Element (description, photo, id_Salle, id_Association)
                            VALUES ("${salleData.description}",
                                    "${salleData.photo}",
                                    ${maxid.id},
                                    ${salleData.id_Association});`);
                    })
                    .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
                }

                get(`SELECT * FROM Salle ${result ? 'JOIN Element ON Salle.id = Element.id_Salle' : ''} WHERE (SELECT MAX(id) FROM Salle) = Salle.id;`)
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));

        })
        .catch(err => reject(err));
    }),

    byId: id => get(`SELECT * FROM Salle WHERE Salle.id = ${id};`),

    byIdFull: id => get(`SELECT * FROM Salle JOIN Element ON Element.id_Salle = Salle.id WHERE Salle.id = ${id};`),

    byNum: num => get(`SELECT * FROM Salle WHERE Salle.numero_salle = ${num};`),

    byNumFull: num => get(`SELECT * FROM Salle JOIN Element ON Element.id_Salle = Salle.id WHERE Salle.numero_salle = ${num};`),

    all: () => all('SELECT * FROM Salle'),

    allFull: () => all('SELECT * FROM Salle JOIN Element ON Element.id_Salle = Salle.id;'),
};


const checkAssoData = assoData => new Promise(function (resolve, reject) {
    if (assoData.nom === undefined || assoData.nb_adherents === undefined || assoData.id_Salle === undefined) {
        reject('Attributs de l\'association mal renseignés (nom - nb_adherents - id_Salle)');
    }
    else {
        resolve(assoData);
    }
});

module.exports.Association = {
    insert: assoData => new Promise(function (resolve, reject) {
        checkAssoData(assoData)
        .then(function (assoData) {
            run(`INSERT INTO Association (nom, nb_adherents, id_Salle)
                VALUES ("${assoData.nom}",
                        ${assoData.nb_adherents},
                        ${assoData.id_Salle});`)
            .then(function () {
                get('SELECT * FROM Association WHERE (SELECT MAX(id) FROM Association) = id;')
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    byId: id => get(`SELECT * FROM Association WHERE id = ${id};`),

    byName: name => get(`SELECT * FROM Association WHERE nom = "${name}";`),

    bySalleId: id => get(`SELECT * FROM Association WHERE id_Salle = ${id};`),

    all: () => all('SELECT * FROM Association;'),
};


const checkUserData = userData => new Promise(function (resolve, reject) {
    if (userData.numero_etudiant === undefined || userData.nom === undefined
        || userData.prenom === undefined || userData.mot_de_passe === undefined) {
        reject('Attributs de l\'utilisateur mal renseignés (nom - prenom - numero_etudiant - mot_de_passe - [id_Association])');
    }
    else if (userData.id_Association === undefined) {
        resolve(false);
    }
    else {
        resolve(true);
    }
});

module.exports.Utilisateur = {
    insert: userData => new Promise(function (resolve, reject) {
        checkUserData(userData)
        .then(function (hasIdAsso) {
            run(`INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe${hasIdAsso ? ', id_Association' : ''})
                VALUES ("${userData.numero_etudiant}",
                        "${userData.nom}",
                        "${userData.prenom}",
                        "${userData.mot_de_passe}"
                        ${hasIdAsso ? (', ' + userData.id_Association) : ''});`)
            .then(function () {
                get(`SELECT * FROM Utilisateur WHERE numero_etudiant = "${userData.numero_etudiant}";`)
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    byNumEt: numEt => get(`SELECT * FROM Utilisateur WHERE numero_etudiant = "${numEt}";`),

    all: () => all('SELECT * FROM Utilisateur;'),
};


const checkCrenData = crenData => new Promise(function (resolve, reject) {
    if (crenData.date_heure_debut === undefined || crenData.date_heure_fin === undefined
        || crenData.etat === undefined || crenData.id_Element === undefined) {
        reject('Attributs du créneau mal renseignés (date_heure_debut - date_heure_fin - etat - id_Element)');
    }
    else {
        resolve(crenData);
    }
});

module.exports.Creneau = {
    insert: crenData => new Promise(function (resolve, reject) {
        checkCrenData(crenData)
        .then(function (crenData) {
            run(`INSERT INTO Creneau (date_heure_debut, date_heure_fin, etat, id_Element)
                VALUES ("${crenData.date_heure_debut}",
                        "${crenData.date_heure_fin}",
                        ${crenData.etat},
                        ${crenData.id_Element});`)
            .then(function () {
                get('SELECT * FROM Creneau WHERE (SELECT MAX(id) FROM Creneau) = id;')
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    byId: id => get(`SELECT * FROM Creneau WHERE id = ${id};`),

    allByElem: idElem => all(`SELECT * FROM Creneau WHERE id_Element = ${idElem};`),

    all: () => all('SELECT * FROM Creneau;'),
};


const checkReservData = reservData => new Promise(function (resolve, reject) {
    if (reservData.nombre_de_personnes === undefined || reservData.raison === undefined
        || reservData.id_Utilisateur === undefined || reservData.id_Creneau === undefined) {
        reject('Attributs de la réservation mal renseignés (nombre_de_personnes - raison - id_Utilisateur - id_Creneau)');
    }
    else {
        resolve(reservData);
    }
});

module.exports.Reservation = {
    insert: reservData => new Promise(function (resolve, reject) {
        checkReservData(reservData)
        .then(function (reservData) {
            run(`INSERT INTO Reservation VALUES (
                ${reservData.nombre_de_personnes},
                "${reservData.raison}",
                "${reservData.id_Utilisateur}",
                ${reservData.id_Creneau});`)
            .then(function () {
                get(`SELECT * FROM Reservation WHERE id_Creneau = ${reservData.id_Creneau};`)
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    getCrenData: crenId => get(`SELECT * FROM Reservation JOIN Creneau ON Reservation.id_Creneau = Creneau.id WHERE Reservation.id_Creneau = ${crenId};`),

    byCrenId: crenId => get(`SELECT * FROM Reservation WHERE id_Creneau = ${crenId};`),

    allByUserId: userId => all(`SELECT * FROM Reservation WHERE id_Utilisateur = ${userId};`),

    all: () => all('SELECT * FROM Reservation;'),
};

/*
aller voir les url :
http://www.sqlitetutorial.net/sqlite-nodejs/
*/