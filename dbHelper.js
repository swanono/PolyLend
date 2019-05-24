'use strict';

const sqlite3 = require('sqlite3').verbose();

const dbName = 'Database-PolyLend.db';

const db = new sqlite3.Database('./' + dbName, sqlite3.OPEN_READWRITE, function (err) {
    if (err) {
        console.error(err + '\n' + 'run "npm run createDB" to create a database file');
        require('process').exit(-1);
    }
    else {
        console.log('Connected to ' + dbName);
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

    byIdFull: id => new Promise(function (resolve, reject) {
        get(`SELECT * FROM SalleFull WHERE id_Element = ${id};`)
        .then(function (salle) {
            if (salle) {
                resolve(salle);
            }
            else {
                get(`SELECT * FROM MaterielFull WHERE id_Element = ${id};`)
                .then(materiel => resolve(materiel))
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            }
        })
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }),

    byName: name => get(`SELECT * FROM Element WHERE nom = "${name}";`),

    all: (countBegin = 0, countEnd = 0) => new Promise(function (resolve, reject) {
        let request = 'SELECT * FROM Element';

        if (countBegin > 0) {
            request += ' GROUP BY id HAVING ';

            if (countEnd > 0) {
                request += `id <= (SELECT MAX(id) FROM Element) - ${countBegin} + 1 AND id >= (SELECT MAX(id) FROM Element) - ${countEnd} + 1`;
            }
            else {
                request += `id >= (SELECT MAX(id) FROM Element) - ${countBegin} + 1`;
            }

            request += ' ORDER BY id DESC';
        }
        request += ';';

        all(request)
        .then(result => resolve(result))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

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
                        get('SELECT * FROM MaterielFull WHERE (SELECT MAX(id) FROM Materiel) = id;')
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
    byName: name => get(`SELECT * FROM MaterielFull WHERE nom = "${name}";`),

    // récupération d'une ligne grace à l'id du matériel
    byId: id => get(`SELECT * FROM MaterielFull WHERE id = ${id};`),

    // récupération de tous les matériels d'une certaine catégorie
    allByCategory: cat => all(`SELECT * FROM MaterielFull WHERE categorie = ${cat};`),

    // récupération de tous les matériels répondant à des critères donnés
    allByParams: params => new Promise(function (resolve, reject) {
        hasQuant = (params.quantite !== undefined);
        hasLoc = (params.lieu !== undefined);
        hasName = (params.nom !== undefined);
        hasCateg = (params.categorie !== undefined);
        hasDesc = (params.description !== undefined);

        all(`SELECT * FROM MaterielFull WHERE (
            ${hasName ? 'nom = "' + params.nom + '" ' : ''}
            ${(hasName && (hasQuant || hasLoc || hasCateg || hasDesc)) ? 'AND ' : ''}
            ${hasQuant ? 'quantite = ' + params.quantite + ' ' : ''}
            ${((hasName || hasQuant) && (hasLoc || hasCateg || hasDesc)) ? 'AND ' : ''}
            ${hasLoc ? 'lieu LIKE "%' + params.lieu + '%" ' : ''}
            ${((hasName || hasQuant || hasLoc) && (hasCateg || hasDesc)) ? 'AND ' : ''}
            ${hasCateg ? 'categorie = "' + params.categorie + '" ' : ''}
            ${((hasName || hasQuant || hasLoc || hasCateg) && (hasDesc)) ? 'AND ' : ''}
            ${hasDesc ? 'description LIKE "%' + params.description + '%" ' : ''}
        );`)
        .then(res => resolve(res))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

    // récupération de toutes les lignes du matériel
    all: (countBegin = 0, countEnd = 0) => new Promise(function (resolve, reject) {
        let request = 'SELECT * FROM MaterielFull';

        if (countBegin > 0) {
            request += ' GROUP BY id HAVING ';

            if (countEnd > 0) {
                request += `id <= (SELECT MAX(id) FROM Materiel) - ${countBegin} + 1 AND id >= (SELECT MAX(id) FROM Materiel) - ${countEnd} + 1`;
            }
            else {
                request += `id >= (SELECT MAX(id) FROM Materiel) - ${countBegin} + 1`;
            }
        }
        request += ';';

        all(request)
        .then(result => resolve(result))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

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
        get(`SELECT * FROM MaterielFull WHERE nom = ${name};`)
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
                                "${salleData.equipement}",
                                ${elem.id});`)
                    .then(function () {
                        get('SELECT * FROM SalleFull WHERE (SELECT MAX(id) FROM Salle) = id;')
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
    byName: name => get(`SELECT * FROM SalleFull WHERE nom = "${name}";`),

    // récupération d'une ligne grace à l'id de la salle
    byId: id => get(`SELECT * FROM SalleFull WHERE id = ${id};`),

    // récupération de toutes les salles d'un batiment
    allByBat: bat => all(`SELECT * FROM SalleFull WHERE batiment = "${bat}";`),

    // récupération de toutes les salles ayant une capacité minimum demandée
    allByMinCap: cap => all(`SELECT * FROM SalleFull WHERE capacite >= ${cap};`),

    // récupération de toutes les salles répondant aux paramètres fournis
    allByParams: params => new Promise(function (resolve, reject) {
        let hasName = (params.nom !== undefined);
        let hasBat = (params.batiment !== undefined);
        let hasMinCap = (params.capacite !== undefined);
        let hasEtage = (params.etage !== undefined);
        let hasDesc = (params.description !== undefined);
        let hasEquip = (params.equipement !== undefined);

        let sql = `SELECT * FROM SalleFull WHERE (
            ${hasName ? 'nom LIKE "%' + params.nom + '%" AND ' : ''}
            ${hasBat ? 'batiment = "' + params.batiment + '" AND ' : ''}
            ${hasMinCap ? 'capacite >= ' + params.capacite + ' AND ' : ''}
            ${hasEtage ? 'etage = ' + params.etage + ' AND ' : ''}
            ${hasDesc ? 'description LIKE "%' + params.description + '%" AND ' : ''}
            0 = 0 `;

        if (hasEquip) {
            sql += (hasName || hasBat || hasMinCap || hasEtage || hasDesc) ? 'AND (' : '';
            params.equipement.split(' ').forEach(function (equip) {
                sql += `equipement LIKE "%${equip}%" OR `;
            });
            sql += '0 != 0)'
        }

        sql += ');';

        all(sql)
        .then(res => resolve(res))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

    // récupération de toutes les salles de la base
    all: (countBegin = 0, countEnd = 0) => new Promise(function (resolve, reject) {
        let request = 'SELECT * FROM SalleFull';

        if (countBegin > 0) {
            request += ' GROUP BY id HAVING ';

            if (countEnd > 0) {
                request += `id <= (SELECT MAX(id) FROM Salle) - ${countBegin} + 1 AND id >= (SELECT MAX(id) FROM Salle) - ${countEnd} + 1`;
            }
            else {
                request += `id >= (SELECT MAX(id) FROM Salle) - ${countBegin} + 1`;
            }
        }
        request += ';';

        all(request)
        .then(result => resolve(result))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

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
        get(`SELECT * FROM SalleFull WHERE nom = ${name};`)
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

    // changement du statut admin de l'utilisateur voulu
    grantAdminRights: (numEt, grant = true) => run(`UPDATE Utilisateur SET admin = ${grant ? '1' : '0'} WHERE numero_etudiant = "${numEt}";`),

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
                VALUES (datetime("${crenData.date_heure_debut}"),
                        datetime("${crenData.date_heure_fin}"),
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
    allByElemId: idElem => all(`SELECT * FROM Creneau WHERE id_Element = ${idElem};`),

    allIncluding: cren => all(`SELECT * FROM Creneau WHERE
                                datetime(${cren.date_heure_debut}) >= datetime(date_heure_debut)
                                AND datetime(${cren.date_heure_fin}) <= datetime(date_heure_fin);`),

    // récupération de tous les créneaux associés à un élément et incluant une certaine date
    allByElemIncluding: (idElem, cren) => all(`SELECT * FROM Creneau WHERE id_Element = ${idElem}
                                                    AND datetime("${cren.date_heure_debut}") >= datetime(date_heure_debut)
                                                    AND datetime("${cren.date_heure_fin}") <= datetime(date_heure_fin);`),

    // récupération de tous les créneaux de la base
    all: () => all('SELECT * FROM Creneau;'),

    // délétion d'un créneau grace à son id
    deleteById: id => run(`DELETE FROM Creneau WHERE id = ${id};`),

    // délétion de tous les créneaux liés à un élément
    deleteAllByElem: idElem => run(`DELETE FROM Creneau WHERE id_Element = ${idElem};`),
};


// promesse permettant de vérifier si l'objet reservData donné en paramètre est correct
const checkReservData = reservData => new Promise(function (resolve, reject) {
    if (reservData.raison === undefined
        || reservData.date_heure_debut === undefined || reservData.date_heure_fin === undefined
        || reservData.id_Utilisateur === undefined || reservData.id_Creneau === undefined) {
        reject('Attributs de la réservation mal renseignés (raison - date_heure_debut - date_heure_fin - id_Utilisateur - id_Creneau)');
    }
    else {
        get(`SELECT * FROM CreneauElem WHERE id = ${reservData.id_Creneau};`)
        .then(result => resolve(result.validation_auto === 1))
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }
});

// Objet dont les attributs sont des promesses renvoyant le résultat des requêtes correspondantes
module.exports.Reservation = {
    // insertion d'une ligne dans la table Réservation
    insert: reservData => new Promise(function (resolve, reject) {
        checkReservData(reservData)
        .then(function (valid_auto) {
            run(`INSERT INTO Reservation (raison, ${valid_auto ? 'validation, ' : ''}date_heure_debut, date_heure_fin, id_Utilisateur, id_Creneau)
                VALUES ("${reservData.raison}",
                        ${valid_auto ? 1 + ',' : ''}
                        datetime("${reservData.date_heure_debut}"),
                        datetime("${reservData.date_heure_fin}"),
                        "${reservData.id_Utilisateur}",
                        ${reservData.id_Creneau});`)
            .then(function () {
                get('SELECT * FROM Reservation WHERE (SELECT MAX(id) FROM Reservation) = id;')
                .then(function (result) {
                    if (!valid_auto) {
                        run(`INSERT INTO Notification VALUES (${result.id}, 1);`)
                        .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
                    }
                    resolve(result);
                })
                .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject(err));
    }),

    // récupération d'un élément grace à l'id de sa réservation
    // TODO : peut-être à changer
    getElemData: id => get(`SELECT * FROM Element LEFT OUTER JOIN (SELECT Reservation.id as id, Creneau.id_Element FROM Reservation JOIN Creneau ON Reservation.id_Creneau = Creneau.id) WHERE Reservation.id = ${id};`),

    // récupération d'une ligne grace à l'id de la réservation
    byId: id => get(`SELECT * FROM Reservation WHERE id = ${id};`),

    allById: idArray => new Promise(function (resolve, reject) {
        let promises = idArray.map(id => get(`SELECT * FROM Reservation WHERE id = ${id};`));
        Promise.all(promises)
        .then(result => resolve(result))
        .catch(err => reject('erreur dans le lancement de  la commande get :\n' + err));
    }),

    // récupération de toutes les réservations liées à un élément
    allByElemId: elemId => all(`SELECT * FROM ReservationFull WHERE id_Element = ${elemId};`),

    // récupération de toutes les réservations liées à un créneau
    allByCrenId: crenId => all(`SELECT * FROM Reservation WHERE id_Creneau = ${crenId};`),

    // récupération de toutes les réservations d'un utilisateur
    allByUserId: userId => all(`SELECT * FROM Reservation WHERE id_Utilisateur = "${userId}";`),

    // récupération de toutes les réservations de la base
    all: (countBegin = 0, countEnd = 0) => new Promise(function (resolve, reject) {
        let request = 'SELECT * FROM Reservation';

        if (countBegin > 0) {
            request += ' GROUP BY id HAVING ';

            if (countEnd > 0) {
                request += `id <= (SELECT MAX(id) FROM Reservation) - ${countBegin} + 1 AND id >= (SELECT MAX(id) FROM Reservation) - ${countEnd} + 1`;
            }
            else {
                request += `id >= (SELECT MAX(id) FROM Reservation) - ${countBegin} + 1`;
            }

            request += ' ORDER BY id DESC';
        }
        request += ';';

        all(request)
        .then(result => resolve(result))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

    // changer la validation d'une réservation
    validate: (id, accept = true) => new Promise(function (resolve, reject) {
        run(`UPDATE Reservation SET validation = ${accept ? 1 : -1} WHERE id = ${id};`)
        .then(function () {
            run(`DELETE FROM Notification WHERE id_Reservation = ${id};`)
            .then(function () {
                run(`INSERT INTO Notification VALUES (${id}, 0);`)
                .then(() => resolve(true))
                .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
            })
            .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
        })
        .catch(err => reject('erreur dans le lancement de  la commande run :\n' + err));
    }),

    // délétion d'une réservation grace à son id
    deleteById: id => run(`DELETE FROM Reservation WHERE id = ${id};`),

    // délétion de toutes les réservations liées à un élément
    deleteByElemId: elemId => run(`DELETE FROM Reservation WHERE (SELECT id_Element FROM Creneau WHERE id_Creneau = Creneau.id) = ${elemId};`),

    // délétion de toutes les réservations liées à un créneau
    deleteByCrenId: crenId => run(`DELETE FROM Reservation WHERE id_Creneau = ${crenId};`),
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
        if ((typeof motcleData.mots) === 'string' || (motcleData.mots instanceof String)) {
            resolve({id_Element: motcleData.id_Element, mots: motcleData.mots.split(' ')});
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
    allByElemId: elemId => all(`SELECT * FROM MotCle WHERE id_Element = ${elemId};`),

    // récupération de toutes les lignes concernant un certain mot
    allByWord: word => all(`SELECT * FROM MotCle WHERE mot LIKE "%${word}%";`),

    // récupération de toutes les lignes concernant les mots d'une "phrase"
    allBySentence: sentence => new Promise(function (resolve, reject) {
        if (typeof(sentence) === 'string' || (sentence instanceof String)) {
            sentence = sentence.split(' ');
            let promises = sentence.map(mot => all(`SELECT * FROM MotCle WHERE mot LIKE "%${mot}%";`));

            Promise.all(promises)
            .then(results => resolve(Object.assign(...results)))
            .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
        }
        else {
            reject('l\'objet fourni n\'est pas de type string');
        }
    }),

    // récupération de toutes les lignes de la base
    all: () => all('SELECT * FROM MotCle;'),

    // délétion de toutes les lignes liées à un élément
    deleteByElem: elemId => run(`DELETE FROM MotCle WHERE id_Element = ${elemId};`),

    // délétion de la ligne contenant un mot précis et un élément précis
    deleteByPair: (word, elemId) => run(`DELETE FROM MotCle WHERE id_Element = ${elemId} AND mot = "${word}";`),
};


module.exports.Notification = {
    all: (countBegin = 0, countEnd = 0) => new Promise(function (resolve, reject) {
        let request = 'SELECT * FROM Notification';

        if (countBegin > 0) {
            request += ' GROUP BY id_Reservation HAVING ';

            if (countEnd > 0) {
                request += `id_Reservation <= (SELECT MAX(id_Reservation) FROM Notification) - ${countBegin} + 1 AND id_Reservation >= (SELECT MAX(id_Reservation) FROM Notification) - ${countEnd} + 1`;
            }
            else {
                request += `id_Reservation >= (SELECT MAX(id_Reservation) FROM Notification) - ${countBegin} + 1`;
            }

            request += ' ORDER BY id DESC';
        }
        request += ';';

        all(request)
        .then(result => resolve(result))
        .catch(err => reject('erreur dans le lancement de  la commande all :\n' + err));
    }),

    delete: reservId => run(`DELETE FROM Notification WHERE id_Reservation = ${reservId};`),
}

/*
aller voir l'url :
http://www.sqlitetutorial.net/sqlite-nodejs/
*/
