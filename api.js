/* eslint-env node */
'use strict';

// Ce module nodejs gère l'API de notre site
// Il définit l'ensemble des routes (relative à "/api") corresponant aux
// points d'entrée de l'API

// Expressjs
const express = require('express');
// Notre module nodejs d'accès simplifié à la base de données
const dbHelper = require('./dbHelper.js');

const prod = false;

const prefixDir = prod ? '/4C' : '';

function isEmptyOrSpaces (str) {
    return str === null || str === undefined || str.match(/^ *$/) !== null;
}

function normalizeDH (str) {
    if (str.indexOf('-') === -1) {
        return undefined;
    }
    if (str.indexOf(':') === -1) {
        return str + '00:00:00';
    }
    return str;
}

module.exports = (passport) => {
    const app = express();

    app.get('/whoami', function (req, res) {
        res.send(req.user);
    });

    app.get('/logout', function (req, res) {
        req.logOut();
        res.redirect(prefixDir + '/public/connexion.html');
    });

    app.post('/utilisateur/register', function (req, res) {
        dbHelper.Utilisateur.byNumEt(req.body['numero-etu'])
        .then(function (etu) {
            if (etu) {
                res.send({success: false, message: 'username already exists'});
            }
            else {
                dbHelper.Utilisateur.insert({
                    numero_etudiant: req.body['numero-etu'],
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    mot_de_passe: req.body.password,
                })
                .then(() => res.redirect(prefixDir + '/public/connexion.html'))
                .catch(err => {console.error(err); res.json(err);});
            }
        })
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/utilisateur/login', function (req, res, next) {
        if (!req.body.identifiant) {
            return res.send({success: false, message: 'empty username'});
        }
        if (!req.body.password) {
            return res.send({success: false, message: 'empty password'});
        }
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.redirect(prefixDir + '/public/connexion.html');
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                console.log('>>> Authentification : ');
                console.log(user);
                return res.redirect(prefixDir + '/private/user/index.html');
            });
        })(req, res, next);
    });

    app.post('/utilisateur/bynum', function (req, res) {
        dbHelper.Utilisateur.byNumEt(req.body.id_Utilisateur)
        .then(etu => res.json(etu))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.get('/utilisateur/getall', function (req, res) {
        dbHelper.Utilisateur.all()
        .then(etu => res.json(etu))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/utilisateur/setadminrights', function (req, res) {
        dbHelper.Utilisateur.grantAdminRights(req.body.numero_etudiant, req.body.admin)
        .then(() => res.json({ok: true,}))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.get('/notification/getall', function (req, res) {
        dbHelper.Notification.all()
        .then(function (notifs) {
            dbHelper.Reservation.all()
            .then(function (reservs) {
                // TODO : vérifier qu'on envoie bien les bonnes notifs
                notifs = notifs.filter(notif => {
                    return (reservs.find(reserv => reserv.id === notif.id_Reservation).id_Utilisateur === req.user.numero_etudiant && notif.admin === 0) || (req.user.admin === 1 && notif.admin === 1);
                });
                res.json(notifs);
            })
            .catch(err => {console.error(err); res.json(err);});
        })
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/notification/seen', function (req, res) {
        dbHelper.Notification.delete(req.body.id_Reservation)
        .then(() => true)
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/reservation/allbyid', function (req, res) {
        dbHelper.Reservation.allById(req.body)
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/reservation/validate', function (req, res) {
        dbHelper.Reservation.validate(req.body.id_Reservation, req.body.validate)
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/reservation/submit/salle', function (req, res) {
        if (Date.parse(req.body.date_heure_debut) >= Date.parse(req.body.date_heure_fin)) {
            res.json({ok: false, wrongCren: true});
        }
        else {
            dbHelper.Salle.byId(req.body.id_Salle)
            .then(function (salleData) {
                dbHelper.Reservation.allByElemId(salleData.id_Element)
                .then(function (reservDatas) {
                    reservDatas.forEach(function (reservData) {
                        if (Date.parse(reservData.date_heure_debut) < Date.parse(req.body.date_heure_fin)
                            && Date.parse(reservData.date_heure_fin) > Date.parse(req.body.date_heure_debut)) {
                            res.json({ok: false, alreadyTaken: true,});
                        }
                    });

                    dbHelper.Creneau.allByElemId(salleData.id_Element)
                    .then(function (crenDatas) {
                        let cren = crenDatas.find(function (crenData) {
                            return (Date.parse(req.body.date_heure_debut) >= Date.parse(crenData.date_heure_debut)
                                    && Date.parse(req.body.date_heure_fin) <= Date.parse(crenData.date_heure_fin));
                        });

                        if (cren === undefined) {
                            res.json({ok: false, outOfCren: true});
                        }
                        else {
                            dbHelper.Element.byId(salleData.id_Element)
                            .then(elemData => dbHelper.Reservation.insert({
                                raison: req.body.raison,
                                date_heure_debut: req.body.date_heure_debut,
                                date_heure_fin: req.body.date_heure_fin,
                                id_Utilisateur: req.user.numero_etudiant,
                                id_Creneau: cren.id,
                                validation: elemData.validation_auto,
                            }))
                            .then(result => res.json(result))
                            .catch(err => {console.error(err); res.json(err);});
                        }
                    })
                    .catch(err => {console.error(err); res.json(err);});
                })
                .catch(err => {console.error(err); res.json(err);});
            })
            .catch(err => {console.error(err); res.json(err);});
        }
    });

    app.post('/reservation/submit/materiel', function (req, res) {
        if (Date.parse(req.body.date_heure_debut) >= Date.parse(req.body.date_heure_fin)) {
            res.json({ok: false, wrongCren: true});
        }
        else {
            dbHelper.Materiel.byId(req.body.id_Materiel)
            .then(function (data) {
                console.log('On reserve l\'element :');
                console.log(data.id_Element);
                dbHelper.Reservation.allByElemId(data.id_Element)
                .then(function (reservDatas) {
                    reservDatas.forEach(function (reservData) {
                        if (Date.parse(reservData.date_heure_debut) < Date.parse(req.body.date_heure_fin)
                            && Date.parse(reservData.date_heure_fin) > Date.parse(req.body.date_heure_debut)) {
                            res.json({ok: false, alreadyTaken: true,});
                        }
                    });

                    dbHelper.Creneau.allByElemId(data.id_Element)
                    .then(function (crenDatas) {
                        let cren = crenDatas.find(function (crenData) {
                            return (Date.parse(req.body.date_heure_debut) >= Date.parse(crenData.date_heure_debut)
                                    && Date.parse(req.body.date_heure_fin) <= Date.parse(crenData.date_heure_fin));
                        });

                        if (cren === undefined) {
                            res.json({ok: false, outOfCren: true});
                        }
                        else {
                            dbHelper.Element.byId(data.id_Element)
                            .then(elemData => dbHelper.Reservation.insert({
                                raison: req.body.raison,
                                date_heure_debut: req.body.date_heure_debut,
                                date_heure_fin: req.body.date_heure_fin,
                                id_Utilisateur: req.user.numero_etudiant,
                                id_Creneau: cren.id,
                                validation: elemData.validation_auto,
                            }))
                            .then( function (result) {
                                res.json(result);
                            })
                            .catch(err => {console.error(err); res.json(err);});
                        }
                    })
                    .catch(err => {console.error(err); res.json(err);});
                })
                .catch(err => {console.error(err); res.json(err);});
            })
            .catch(err => {console.error(err); res.json(err);});
        }
    });

    app.post('/creneau/byid', function (req, res) {
        dbHelper.Creneau.byId(req.body.id_Creneau)
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.get('/creneau/getall', function (req, res) {
        dbHelper.Creneau.all()
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/element/byid', function (req, res) {
        dbHelper.Element.byIdFull(req.body.id_Element)
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    })

    app.post('/materiel/add', function (req, res, next) {
        dbHelper.Materiel.insert({
            quantite: req.body.quantite,
            categorie: req.body.categorie,
            lieu: req.body['lieu-de-dispo'],
            nom: req.body.nom,
            description: req.body.description,
            photo: 'https://via.placeholder.com/100',
            validation_auto: !req.body.validation_auto ? '0' : '1',
        })
        .then(function (resultat) {
            if (typeof(req.body['date-fin']) === 'string' || req.body['date-fin'] instanceof String) {
                req.body['date-debut'] = [req.body['date-debut']];
                req.body['date-fin'] = [req.body['date-fin']];
                req.body['heure-debut'] = [req.body['heure-debut']];
                req.body['heure-fin'] = [req.body['heure-fin']];
            }
            let promises = [];
            if (typeof(req.body['date-fin']) === 'string' || req.body['date-fin'] instanceof String) {
                req.body['date-debut'] = [req.body['date-debut']];
                req.body['heure-debut'] = [req.body['heure-debut']];
                req.body['date-fin'] = [req.body['date-fin']];
                req.body['heure-fin'] = [req.body['heure-fin']];
            }
            for (let i = 0; i < req.body['date-fin'].length; i += 1) {
                promises.push(dbHelper.Creneau.insert({
                    date_heure_debut : `${req.body['date-debut'][i]} ${req.body['heure-debut'][i]}`,
                    date_heure_fin : `${req.body['date-fin'][i]} ${req.body['heure-fin'][i]}`,
                    id_Element : resultat.id_Element,
                }));
            }
            promises.push(dbHelper.MotCle.insert({
                mots: req.body['mot-cle'],
                id_Element: resultat.id_Element,
            }));

            Promise.all(promises)
            .then(() => res.redirect(prefixDir + '/private/admin/administration.html'))
            .catch(err => {console.error(err); res.json(err);});
        })
        .catch(err => {console.error(err); res.json(err);});
    });

    app.get('/salle/getall', function (req, res) {
        dbHelper.Salle.all()
        .then(salles => res.json(salles))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/salle/add', function (req, res, next) {
        let equipmentString = '';

        if (req.body.videoproj === 'on') {
            equipmentString += 'vidéo-projecteur';
        }
        if (req.body.tableau === 'on') {
            if (req.body.videoproj === 'on'){
                equipmentString += ' ';
            }
            equipmentString += 'tableau';
        }
        if (req.body.ordinateurs === 'on') {
            if (equipmentString.length !== 0){
                equipmentString += ' ';
            }
            equipmentString += 'ordinateurs';
        }

        dbHelper.Salle.insert({
            batiment: req.body.batiment,
            etage: req.body.etage,
            capacite: req.body.capacite,
            equipement: equipmentString,
            nom: req.body.nom,
            description: req.body.description,
            photo: 'https://via.placeholder.com/100',
            validation_auto: !req.body.validation_auto ? '0' : '1',
        })
        .then(function (resultat) {
            let promises = [];
            if (typeof(req.body['date-fin']) === 'string' || req.body['date-fin'] instanceof String) {
                req.body['date-debut'] = [req.body['date-debut']];
                req.body['heure-debut'] = [req.body['heure-debut']];
                req.body['date-fin'] = [req.body['date-fin']];
                req.body['heure-fin'] = [req.body['heure-fin']];
            }
            for (let i = 0; i < req.body['date-fin'].length; i += 1) {
                promises.push(dbHelper.Creneau.insert({
                    date_heure_debut : `${req.body['date-debut'][i]} ${req.body['heure-debut'][i]}`,
                    date_heure_fin : `${req.body['date-fin'][i]} ${req.body['heure-fin'][i]}`,
                    id_Element : resultat.id_Element,
                }));
            }
            promises.push(dbHelper.MotCle.insert({
                mots: req.body['mot-cle'],
                id_Element: resultat.id_Element,
            }));

            Promise.all(promises)
            .then(() => res.redirect(prefixDir + '/private/admin/administration.html'))
            .catch(err => {console.error(err); res.json(err);});
        })
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/salle/delete', function (req, res) {
        dbHelper.MotCle.deleteByElem(req.body.id_Element)
        .then(() => dbHelper.Reservation.deleteByElemId(req.body.id_Element))
        .then(idRes => idRes.forEach(i => dbHelper.Notification.delete(i.id).catch(err => {console.error(err); res.json(err);})))
        .then(() => dbHelper.Creneau.deleteAllByElem(req.body.id_Element))
        .then(() => dbHelper.Salle.deleteById(req.body.id_Salle))
        .then(() => res.json({ok: true,}))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/salle/search', function (req, res) {
        let hasCrit = !isEmptyOrSpaces(req.body.critere);
        let dhd = normalizeDH(req.body.date_heure_debut);
        let hasDHD = !isEmptyOrSpaces(req.body.date_heure_debut) && dhd !== undefined;
        let dhf = normalizeDH(req.body.date_heure_fin);
        let hasDHF = !isEmptyOrSpaces(req.body.date_heure_fin) && dhf !== undefined;
        let hasVproj = !isEmptyOrSpaces(req.body.videoproj);
        let hasTab = !isEmptyOrSpaces(req.body.tableau);
        let hasOrdi = !isEmptyOrSpaces(req.body.ordinateurs);
        let hasCap = !isEmptyOrSpaces(req.body.capacite);

        let crits = hasCrit ? req.body.critere.split(' ') : [];
        let paramSalle = {
            batiment: req.body.batiment,
            capacite: hasCap ? parseInt(req.body.capacite) : undefined,
            equipement: (hasVproj || hasTab || hasOrdi ?
                            (hasVproj ? 'vidéo-projecteur' : '')
                            + ((hasVproj) && (hasTab || hasOrdi) ? ' ' : '')
                            + (hasTab ? 'tableau' : '')
                            + ((hasVproj || hasTab) && (hasOrdi) ? ' ' : '')
                            + (hasOrdi ? 'ordinateurs' : '')
                            : undefined),
        };

        let cren = {
            date_heure_debut: hasDHD ? dhd : (hasDHF ? dhf : undefined),
            date_heure_fin: hasDHF ? dhf : (hasDHD ? dhd : undefined),
        };

        let promises = hasCrit ? [
            ...crits.map(crit => {
                paramSalle.etage = undefined;
                paramSalle.description = undefined;
                paramSalle.nom = crit;
                return dbHelper.Salle.allByParams(paramSalle);
            }),
            ...crits.map(crit => {
                paramSalle.nom = undefined;
                paramSalle.description = undefined;
                paramSalle.etage = (isNaN(parseInt(crit)) ? undefined : parseInt(crit));
                return dbHelper.Salle.allByParams(paramSalle);
            }),
            ...crits.map(crit => {
                paramSalle.nom = undefined;
                paramSalle.etage = undefined;
                paramSalle.description = crit;
                return dbHelper.Salle.allByParams(paramSalle);
            }),
        ] : [
            dbHelper.Salle.allByParams(paramSalle)
        ];


        dbHelper.MotCle.allBySentence(hasCrit ? req.body.critere : '1478562548632145863694520')
        .then(function (rows) {
            if (rows) {
                rows.forEach(row => promises.push(dbHelper.Element.byIdFull(row.id_Element)));
            }

            Promise.all(promises)
            .then(function (allSalles) {
                let salles = [...new Set(allSalles.map(salleStack => {
                    if (salleStack === null || salleStack === undefined || typeof(salleStack[Symbol.iterator]) !== 'function') {
                        return salleStack;
                    }
                    else {
                        return [...salleStack];
                    }
                }))][0];

                if(cren.date_heure_debut) {
                    let crenPromises = salles.map(s => dbHelper.Creneau.allByElemIncluding(s.id_Element, cren));

                    Promise.all(crenPromises)
                    .then(function (crenValids) {
                        let sallesValids = [].concat.apply([], crenValids.filter((v, i, a) =>
                            a.indexOf(a.find(crf => v.id_Element === crf.id_Element)) === i && v.length > 0
                        ))
                        .map(cr => dbHelper.Element.byIdFull(cr.id_Element));

                        Promise.all(sallesValids)
                        .then(final => res.json(final))
                        .catch(err => {console.error(err); res.json(err);});
                    })
                    .catch(err => {console.error(err); res.json(err);});
                }
                else {
                    res.json(salles);
                }
            })
            .catch(err => {console.error(err); res.json(err);});
        })
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/salle/byid', function (req, res) {
        dbHelper.Salle.byId(req.body.id_Salle)
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.post('/materiel/byid', function (req, res) {
        dbHelper.Materiel.byId(req.body.id_Materiel)
        .then(result => res.json(result))
        .catch(err => {console.error(err); res.json(err);});
    });

    app.get('/materiel/getall', function (req, res) {
        dbHelper.Materiel.all()
        .then(function (materiels) {
            materiels.forEach( function (materiel) {
                dbHelper.Creneau.allByElemId(materiel.id_Element)
                .then( function (cren) {
                    console.log(cren);
                });
                materiel.disponibilite = 'dispo';
            });

            console.log(materiels);
            return res.json(materiels);
        })
        .catch(err => {console.error(err); res.json(err);});
    });


    app.post('/materiel/search', function (req, res) {
        let hasCrit = !isEmptyOrSpaces(req.body.critere);
        let dhd = normalizeDH(req.body.date_heure_debut);
        let hasDHD = !isEmptyOrSpaces(req.body.date_heure_debut) && dhd !== undefined;
        let dhf = normalizeDH(req.body.date_heure_fin);
        let hasDHF = !isEmptyOrSpaces(req.body.date_heure_fin) && dhf !== undefined;
        let hasVproj = !isEmptyOrSpaces(req.body.videoproj);
        let hasTab = !isEmptyOrSpaces(req.body.tableau);
        let hasOrdi = !isEmptyOrSpaces(req.body.ordinateurs);
        let hasCap = !isEmptyOrSpaces(req.body.capacite);

        let crits = hasCrit ? req.body.critere.split(' ') : [];
        let paramMat = {
            categorie: (req.body.categorie === 'Non précisé') ? undefined : req.body.categorie,
        };

        let cren = {
            date_heure_debut: hasDHD ? dhd : (hasDHF ? dhf : undefined),
            date_heure_fin: hasDHF ? dhf : (hasDHD ? dhd : undefined),
        };
        console.log('crits :');
        console.log(crits);
        let promises = hasCrit ? [

            ...crits.map(crit => {
                console.log('crit :');
                console.log(crit);
                paramMat.lieu = undefined;
                paramMat.description = undefined;
                paramMat.nom = crit;
                return dbHelper.Materiel.allByParams(paramMat);
            }),
            ...crits.map(crit => {
                paramMat.nom = undefined;
                paramMat.description = undefined;
                paramMat.lieu = crit;
                return dbHelper.Materiel.allByParams(paramMat);
            }),
            ...crits.map(crit => {
                paramMat.nom = undefined;
                paramMat.lieu = undefined;
                paramMat.description = crit;
                return dbHelper.Materiel.allByParams(paramMat);
            }),
        ] : [
            dbHelper.Materiel.allByParams(paramMat)
        ];
        dbHelper.MotCle.allBySentence(hasCrit ? req.body.critere : '1478562548632145863694520')
        .then(function (rows) {
            if (rows) {
                rows.forEach(row => promises.push(dbHelper.Element.byIdFull(row.id_Element)));
            }

            Promise.all(promises)
            .then(function (allMats) {
                let mats = [...new Set(allMats.map(matStack => {
                    if (matStack === null || matStack === undefined || typeof(matStack[Symbol.iterator]) !== 'function') {

                        return matStack;
                    }
                    else {
                        return [...matStack];
                    }
                }))][0];

                if(cren.date_heure_debut) {
                    let crenPromises = mats.map(s => dbHelper.Creneau.allByElemIncluding(s.id_Element, cren));

                    Promise.all(crenPromises)
                    .then(function (crenValids) {
                        let matsValids = [].concat.apply([], crenValids.filter((v, i, a) =>
                            a.indexOf(a.find(crf => v.id_Element === crf.id_Element)) === i && v.length > 0
                        ))
                        .map(cr => dbHelper.Element.byIdFull(cr.id_Element));

                        Promise.all(matsValids)
                        .then(final => res.json(final))
                        .catch(err => {console.error(err); res.json(err);});
                    })
                    .catch(err => {console.error(err); res.json(err);});
                }
                else {

                    res.json(mats);
                }
            })
            .catch(err => {console.error(err); res.json(err);});
        })
        .catch(err => {console.error(err); res.json(err);});
    });




    return app;
}
