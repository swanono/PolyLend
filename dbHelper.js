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


// promesse permettant de vérifier si l'objet elemData donné en paramètre est correct
const checkElemData = elemData => new Promise(function (resolve, reject) {
    if (elemData.nom === undefined || elemData.description === undefined
        || elemData.photo === undefined || elemData.validation_auto === undefined) {
        reject('Attributs de l\'élément mal renseignés (nom - description - photo - validation_auto)');
    }
    else {
        resolve(elemData);
    }
});

// Objet permettant d'accéder à la table élément
module.exports.Element = {
    insert: elemData => new Promise(function (resolve, reject) {
        checkElemData(elemData)
        .then(function (elemData) {
            run(`INSERT INTO Element (nom, description, photo, validation_auto)
                VALUES ("${elemData.nom}",
                        "${elemData.description}",
                        "${elemData.photo}",
                        ${!elemData.validation_auto ? 0 : 1});`)
            .then(function () {
                get('SELECT * FROM Element WHERE (SELECT MAX(id) FROM Element) = id;')
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    byId: id => get(`SELECT * FROM Element WHERE id = ${id};`),

    byName: name => get(`SELECT * FROM Element WHERE nom = "${name}";`),

    all: () => all('SELECT * FROM Element;'),

    deleteById: id => run(`DELETE FROM Element WHERE id = ${id};`),

    deleteByName: name => run(`DELETE FROM Element WHERE nom = "${name}";`),
};

// promesse permettant de vérifier si l'objet matData donné en paramètre est correct
const checkMatData = matData => new Promise(function (resolve, reject) {
    if (matData.quantite === undefined || matData.categorie === undefined || matData.lieu === undefined) {
        reject('Attributs de l\'équipement mal renseignés (quantite - categorie - lieu)');
    }
    else if (matData.nom === undefined || matData.description === undefined
        || matData.photo === undefined || matData.validation_auto === undefined) {
        reject('Attributs de l\'élément mal renseignés (nom - description - photo - validation_auto)');
    }
    else {
        resolve(matData);
    }
});

// Objet dont les attributs sont des promesses renvoyant le résultat des requêtes correspondantes
module.exports.Materiel = {
    // insertion d'une ligne dans la table Element puis une ligne dans la table Materiel grace à l'id de l'élément créé
    insert: matData => new Promise(function (resolve, reject) {
        checkMatData(matData)
        .then(function (matData) {
            run(`INSERT INTO Element (nom, description, photo, validation_auto)
                VALUES ("${matData.nom}",
                        "${matData.description}",
                        "${matData.photo}",
                        ${!matData.validation_auto ? 0 : 1});`)
            .then(function () {
                get('SELECT * FROM Element WHERE (SELECT MAX(id) FROM Element) = id;')
                .then(function (elem) {
                    run(`INSERT INTO Materiel (quantite, categorie, lieu, id_Element)
                        VALUES (${matData.quantite},
                                "${matData.categorie}",
                                "${matData.lieu}",
                                ${elem.id});`)
                    .then(function () {
                        get('SELECT * FROM Materiel JOIN Element ON Materiel.id_Element = Element.id WHERE (SELECT MAX(id) FROM Materiel) = Materiel.id;')
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

    // récupération d'une ligne grace au nom du matériel
    byName: name => get(`SELECT * FROM Materiel JOIN Element ON Materiel.id_Element = Element.id WHERE Element.nom = "${name}";`),

    // récupération d'une ligne grace à l'id du matériel
    byId: id => get(`SELECT * FROM Materiel JOIN Element ON Materiel.id_Element = Element.id WHERE Materiel.id = ${id};`),

    // récupération de toutes les lignes du matériel
    all: () => all('SELECT * FROM Materiel JOIN Element ON Materiel.id_Element = Element.id;'),

    // déletion de l'élément puis du matériel grace à l'id du matériel
    deleteById: id => new Promise(function (resolve, reject) {
        get(`SELECT * FROM Materiel WHERE id = ${id};`)
        .then(function (mat) {
            run(`DELETE FROM Element WHERE id = ${mat.id_Element};`)
            .then(function () {
                run(`DELETE FROM Materiel WHERE id = ${mat.id};`)
                .then(function () {
                    resolve(mat);
                })
                .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }),

    // déletion de l'élément puis du matériel grace au nom du matériel
    deleteByName: name => new Promise(function (resolve, reject) {
        get(`SELECT * FROM Materiel JOIN Element ON Materiel.id_Element = Element.id WHERE nom = ${name};`)
        .then(function (mat) {
            run(`DELETE FROM Element WHERE id = ${mat.id_Element};`)
            .then(function () {
                run(`DELETE FROM Materiel WHERE id = ${mat.id};`)
                .then(function () {
                    resolve(mat);
                })
                .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }),
};


// promesse permettant de vérifier si l'objet salleData donné en paramètre est correct
const checkSalleData = salleData => new Promise(function (resolve, reject) {
    if (salleData.batiment === undefined || salleData.etage === undefined
        || salleData.capacite === undefined || salleData.equipement === undefined) {
        reject('Attributs de la salle mal renseignés (batiment - etage - capacite - equipement)');
    }
    else if (salleData.nom === undefined || salleData.description === undefined
        || salleData.photo === undefined || salleData.validation_auto === undefined) {
        reject('Attributs de l\'élément mal renseignés (nom - description - photo - validation_auto)');
    }
    else {
        resolve(salleData);
    }
});

// Objet dont les attributs sont des promesses renvoyant le résultat des requêtes correspondantes
module.exports.Salle = {
    // insertion d'une ligne dans la table Salle et possiblement une ligne dans la table Element
    insert: salleData => new Promise(function (resolve, reject) {
        checkSalleData(salleData)
        .then(function (salleData) {
            run(`INSERT INTO Element (nom, description, photo, validation_auto)
                VALUES ("${salleData.nom}",
                        "${salleData.description}",
                        "${salleData.photo}",
                        ${!salleData.validation_auto ? 0 : 1});`)
            .then(function () {
                get('SELECT * FROM Element WHERE (SELECT MAX(id) FROM Element) = id;')
                .then(function (elem) {
                    run(`INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element)
                        VALUES ("${salleData.batiment}",
                                ${salleData.etage},
                                ${salleData.capacite},
                                "${salleData.equipement}"
                                ${elem.id});`)
                    .then(function () {
                        get('SELECT * FROM Salle JOIN Element ON Salle.id_Element = Element.id WHERE (SELECT MAX(id) FROM Salle) = Salle.id;')
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

    // récupération d'une ligne grace au nom de la salle
    byName: name => get(`SELECT * FROM Salle JOIN Element ON Salle.id_Element = Element.id WHERE Element.nom = "${name}";`),

    // récupération d'une ligne grace à l'id de la salle
    byId: id => get(`SELECT * FROM Salle JOIN Element ON Salle.id_Element = Element.id WHERE Salle.id = ${id};`),

    // récupération de toutes les salles de la base
    all: () => all('SELECT * FROM Salle JOIN Element ON Salle.id_Element = Element.id;'),

    // déletion de l'élément puis de la salle grace à l'id de la salle
    deleteById: id => new Promise(function (resolve, reject) {
        get(`SELECT * FROM Salle WHERE id = ${id};`)
        .then(function (salle) {
            run(`DELETE FROM Element WHERE id = ${salle.id_Element};`)
            .then(function () {
                run(`DELETE FROM Salle WHERE id = ${salle.id};`)
                .then(function () {
                    resolve(salle);
                })
                .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }),

    // déletion de l'élément puis de la salle grace au nom de la salle
    deleteByName: name => new Promise(function (resolve, reject) {
        get(`SELECT * FROM Salle JOIN Element ON Salle.id_Element = Element.id WHERE nom = ${name};`)
        .then(function (salle) {
            run(`DELETE FROM Element WHERE id = ${salle.id_Element};`)
            .then(function () {
                run(`DELETE FROM Salle WHERE id = ${salle.id};`)
                .then(function () {
                    resolve(salle);
                })
                .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }),
};

// promesse permettant de vérifier si l'objet userData donné en paramètre est correct
const checkUserData = userData => new Promise(function (resolve, reject) {
    if (userData.numero_etudiant === undefined || userData.nom === undefined
        || userData.prenom === undefined || userData.mot_de_passe === undefined) {
        reject('Attributs de l\'utilisateur mal renseignés (nom - prenom - numero_etudiant - mot_de_passe)');
    }
    else {
        resolve(userData);
    }
});

// Objet dont les attributs sont des promesses renvoyant le résultat des requêtes correspondantes
module.exports.Utilisateur = {
    // insertion d'une ligne dans la table Utilisateur
    insert: userData => new Promise(function (resolve, reject) {
        checkUserData(userData)
        .then(function (userData) {
            run(`INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe)
                VALUES ("${userData.numero_etudiant}",
                        "${userData.nom}",
                        "${userData.prenom}",
                        "${userData.mot_de_passe}");`)
            .then(function () {
                resolve(Object.assign(userData, {admin: 0}));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    // récupération d'une ligne grace au numéro étudiant voulu
    byNumEt: numEt => get(`SELECT * FROM Utilisateur WHERE numero_etudiant = "${numEt}";`),

    // récupération de tous les utiisateurs de la base
    all: () => all('SELECT * FROM Utilisateur;'),

    // délétion d'un utilisateur grace à son id
    deleteByNumEt: numEt => run(`DELETE * FROM Utilisateur WHERE numero_etudiant = "${numEt}";`),
};


// promesse permettant de vérifier si l'objet crenData donné en paramètre est correct
const checkCrenData = crenData => new Promise(function (resolve, reject) {
    if (crenData.date_heure_debut === undefined || crenData.date_heure_fin === undefined || crenData.id_Element === undefined) {
        reject('Attributs du créneau mal renseignés (date_heure_debut - date_heure_fin - id_Element)');
    }
    else {
        resolve(crenData);
    }
});

// Objet dont les attributs sont des promesses renvoyant le résultat des requêtes correspondantes
module.exports.Creneau = {
    // insertion d'une ligne dans la table Creneau
    insert: crenData => new Promise(function (resolve, reject) {
        checkCrenData(crenData)
        .then(function (crenData) {
            run(`INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element)
                VALUES ("${crenData.date_heure_debut}",
                        "${crenData.date_heure_fin}",
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

    // récupération d'une ligne grace à l'id du créneau
    byId: id => get(`SELECT * FROM Creneau WHERE id = ${id};`),

    // récupération de tous les créneaux associés à un élément
    allByElem: idElem => all(`SELECT * FROM Creneau WHERE id_Element = ${idElem};`),

    // récupération de tous les créneaux de la base
    all: () => all('SELECT * FROM Creneau;'),

    // délétion d'un créneau grace à son id
    deleteById: id => run(`DELETE FROM Creneau WHERE id = ${id};`),

    // délétion de tous les créneaux liés à un élément
    deleteAllByElem: idElem => run(`DELETE FROM Creneau WHERE id_Element = ${idElem};`),
};


// promesse permettant de vérifier si l'objet reservData donné en paramètre est correct
const checkReservData = reservData => new Promise(function (resolve, reject) {
    if (reservData.nombre_de_personnes === undefined || reservData.raison === undefined
        || reservData.date_heure_debut === undefined || reservData.date_heure_fin === undefined
        || reservData.id_Utilisateur === undefined || reservData.id_Creneau === undefined) {
        reject('Attributs de la réservation mal renseignés (nombre_de_personnes - raison - date_heure_debut - date_heure_fin - id_Utilisateur - id_Creneau)');
    }
    else {
        resolve(reservData);
    }
});

// Objet dont les attributs sont des promesses renvoyant le résultat des requêtes correspondantes
module.exports.Reservation = {
    // insertion d'une ligne dans la table Réservation
    insert: reservData => new Promise(function (resolve, reject) {
        checkReservData(reservData)
        .then(function (reservData) {
            run(`INSERT INTO Reservation (nombre_de_personnes, raison, date_heure_debut, date_heure_fin, id_Utilisateur, id_Creneau)
                VALUES (${reservData.nombre_de_personnes},
                        "${reservData.raison}",
                        "${reservData.date_heure_debut}",
                        "${reservData.date_heure_fin}",
                        "${reservData.id_Utilisateur}",
                        ${reservData.id_Creneau});`)
            .then(function () {
                get('SELECT * FROM Reservation WHERE (SELECT MAX(id) FROM Reservation) = id;')
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    // récupération d'un élément grace à l'id de sa réservation
    getElemData: id => get(`SELECT * FROM Element LEFT OUTER JOIN (SELECT Reservation.id as id, Creneau.id_Element FROM Reservation JOIN Creneau ON Reservation.id_Creneau = Creneau.id) WHERE Reservation.id = ${id};`),

    // récupération d'une ligne grace à l'id de la réservation
    byId: id => get(`SELECT * FROM Reservation WHERE id = ${id};`),

	// récupération de toutes les réservations liées à un élément
    allByElemId: elemId => all(`SELECT * FROM Reservation LEFT OUTER JOIN (SELECT * FROM Creneau WHERE id_Element = ${elemId});`),

    // récupération de toutes les réservations d'un utilisateur
    allByUserId: userId => all(`SELECT * FROM Reservation WHERE id_Utilisateur = "${userId}";`),

    // récupération de toutes les réservations de la base
    all: () => all('SELECT * FROM Reservation;'),

    // délétion d'une réservation grace à son id
    deleteById: id => run(`DELETE FROM Reservation WHERE id = ${id};`),

    // TODO : delete et get via elemId
};


// promesse permettant de vérifier si l'objet motcleData donné en paramètre est correct
const checkMotcleData = motcleData => new Promise(function (resolve, reject) {
    if (motcleData.id_Element === undefined) {
        reject('Attributs de l\'objet mot clé mal renseignés (id_Element - mots)');
    }
    else if (motcleData.mots === undefined) {
        resolve({id_Element: motcleData.id_Element, mots: ['']});
    }
    else {
        if ((typeof motcleData) === 'string' || (motcleData instanceof String)) {
            resolve({id_Element: motcleData.id_Element, mots: motcleData.split(' ')});
        }
        else if (Array.isArray(motcleData.mots)) {
            let isStringArray = true;
            motcleData.mots.forEach(function (mot) {
                if ((typeof mot) !== 'string' && !(mot instanceof String)) {
                    isStringArray = false;
                }
            });

            if (isStringArray) {
                resolve(motcleData);
            }
            else {
                reject('L\'array fourni n\'est pas constitué uniquement de string');
            }
        }
        else {
            reject('L\'objet mot clé fourni n\'est pas de type string ou n\'est pas un array de string');
        }
    }
});

module.exports.MotCle = {
    // insertion d'une ou plusieurs lignes dans la table MotCle
    insert: motcleData => new Promise(function (resolve, reject) {
        checkMotcleData(motcleData)
        .then(function (motcleData) {
            let promises = motcleData.mots.map(mot => run(`INSERT INTO MotCle VALUES(${motcleData.id_Element}, "${mot}");`));
            Promise.all(promises)
            .then(function () {
                all(`SELECT * FROM MotCle WHERE id_Element = ${motcleData.id_Element};`)
                .then(res => resolve(res))
                .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    // récupération de toutes les lignes concernant un certain élément
    byElemId: elemId => all(`SELECT * FROM MotCle WHERE id_Element = ${elemId};`),

    // récupération de toutes les lignes concernant un certain mot
    byWord: word => all(`SELECT * FROM MotCle WHERE mot = "${word}";`),

    // récupération de toutes les lignes de la base
    all: () => all('SELECT * FROM MotCle;'),

    // délétion de toutes les lignes liées à un élément
    deleteByElem: elemId => run(`DELETE FROM MotCle WHERE id_Element = ${elemId};`),

    // délétion de la ligne contenant un mot précis et un élément précis
    deleteByPair: (word, elemId) => run(`DELETE FROM MotCle WHERE id_Element = ${elemId} AND mot = "${word}";`),
};


/*
aller voir l'url :
http://www.sqlitetutorial.net/sqlite-nodejs/
*/

