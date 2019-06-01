dbhelper = require('./dbHelper.js');

dbhelper.Salle.insert({
    batiment: 'Ireste',
    etage: 1,
    capacite: 30,
    equipement: 'ordinateurs tableau vidéo-projecteur',
    nom: 'D117',
    description: 'Salle de travail de l\'aile informatique, certains écrans scyntillent parfois',
    photo: 'https://via.placeholder.com/100',
    validation_auto: '0',
})
.then(d117 => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-12 08:00:00',
    date_heure_fin : '2019-06-12 12:00:00',
    id_Element : d117.id_Element,
}).then(() => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-13 14:00:00',
    date_heure_fin : '2019-06-13 17:30:00',
    id_Element : d117.id_Element,
})).then(() => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-14 08:15:00',
    date_heure_fin : '2019-06-14 11:45:00',
    id_Element : d117.id_Element,
}))
.then(() => dbhelper.MotCle.insert({
    mots: 'ordinateurs informatique ubuntu windows',
    id_Element: d117.id_Element,
})))
.then(() => dbhelper.Salle.insert({
    batiment: 'Ireste',
    etage: 2,
    capacite: 30,
    equipement: 'tableau vidéo-projecteur',
    nom: 'E202',
    description: 'Salle de travail classique',
    photo: 'https://via.placeholder.com/100',
    validation_auto: '1',
})
.then(e202 => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-12 08:00:00',
    date_heure_fin : '2019-06-12 12:00:00',
    id_Element : e202.id_Element,
}).then(() => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-12 14:00:00',
    date_heure_fin : '2019-06-12 18:30:00',
    id_Element : e202.id_Element,
}))
.then(() => dbhelper.MotCle.insert({
    mots: 'tableau tables',
    id_Element: e202.id_Element,
}))))
.then(() => dbhelper.Salle.insert({
    batiment: 'IHT',
    etage: 1,
    capacite: 50,
    equipement: 'vidéo-projecteur',
    nom: 'A103',
    description: 'Salle de conférence avec une scène, des tables rondes, des micros ...',
    photo: 'https://via.placeholder.com/100',
    validation_auto: '0',
})
.then(a103 => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-11 18:00:00',
    date_heure_fin : '2019-06-11 20:00:00',
    id_Element : a103.id_Element,
})
.then(() => dbhelper.MotCle.insert({
    mots: 'scène micros',
    id_Element: a103.id_Element,
}))))
.then(() => dbhelper.Materiel.insert({
    quantite: 2,
    categorie: 'Instrument',
    lieu: 'Salle de musique',
    nom: 'Guitare',
    description: 'guitare électrique',
    photo: 'https://via.placeholder.com/100',
    validation_auto: '0',
})
.then(guitare => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-15 15:00:00',
    date_heure_fin : '2019-06-15 20:30:00',
    id_Element : guitare.id_Element,
}).then(() => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-14 15:00:00',
    date_heure_fin : '2019-06-14 20:30:00',
    id_Element : guitare.id_Element,
}))
.then(() => dbhelper.MotCle.insert({
    mots: 'musique électrique',
    id_Element: guitare.id_Element,
}))))
.then(() => dbhelper.Materiel.insert({
    quantite: 1,
    categorie: 'Mobilier',
    lieu: 'Salle projet aile D',
    nom: 'Tableau roulant',
    description: 'Tableau avec des roues',
    photo: 'https://via.placeholder.com/100',
    validation_auto: '1',
})
.then(tableau => dbhelper.Creneau.insert({
    date_heure_debut : '2019-06-12 08:00:00',
    date_heure_fin : '2019-06-15 20:00:00',
    id_Element : tableau.id_Element,
})
.then(() => dbhelper.MotCle.insert({
    mots: 'musique électrique',
    id_Element: tableau.id_Element,
}))))