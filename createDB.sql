DROP TABLE IF EXISTS Element;
DROP TABLE IF EXISTS Materiel;
DROP TABLE IF EXISTS Salle;
DROP TABLE IF EXISTS Creneau;
DROP TABLE IF EXISTS Utilisateur;
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS MotCle;
DROP TABLE IF EXISTS Notification;
DROP VIEW IF EXISTS SalleFull;
DROP VIEW IF EXISTS MaterielFull;

PRAGMA foreign_keys = ON;

--
-- Table Element
--

CREATE TABLE Element(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT NOT NULL,
    photo TEXT NOT NULL,
    validation_auto INT NOT NULL CHECK(validation_auto IN (0, 1))
);


--
-- Table Materiel
--

CREATE TABLE Materiel(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantite INT NOT NULL,
    categorie TEXT NOT NULL,
    lieu TEXT NOT NULL,
    id_Element INTEGER NOT NULL,
	FOREIGN KEY (id_Element) REFERENCES Element(id) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Table Salle
--

CREATE TABLE Salle(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batiment TEXT NOT NULL,
    etage INT NOT NULL,
    capacite INT NOT NULL,
    equipement TEXT NOT NULL,
    id_Element INTEGER NOT NULL,
	FOREIGN KEY (id_Element) REFERENCES Element(id) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Table Utilisateur
--

CREATE TABLE Utilisateur(
    numero_etudiant TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    mot_de_passe TEXT NOT NULL,
    admin INT DEFAULT 0 NOT NULL CHECK(admin IN (0, 1))
);


--
-- Table Creneau
--

CREATE TABLE Creneau(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_heure_debut TEXT NOT NULL,
    date_heure_fin TEXT NOT NULL,
    id_Element INTEGER NOT NULL,
	FOREIGN KEY (id_Element) REFERENCES Element(id) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Table Reservation
--

CREATE TABLE Reservation(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raison TEXT NOT NULL,
    validation INT DEFAULT 0 NOT NULL CHECK(validation IN (-1, 0, 1)),
    date_heure_debut TEXT NOT NULL,
    date_heure_fin TEXT NOT NULL,
    id_Utilisateur TEXT NOT NULL,
    id_Creneau INTEGER NOT NULL,
	FOREIGN KEY (id_Utilisateur) REFERENCES Utilisateur(numero_etudiant) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (id_Creneau) REFERENCES Creneau(id) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Table MotCle
--

CREATE TABLE MotCle(
    id_Element INTEGER NOT NULL,
    mot TEXT NOT NULL,
    PRIMARY KEY (id_Element, mot),
	FOREIGN KEY (id_Element) REFERENCES Element(id) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Table Notification
--

CREATE TABLE Notification(
    id_Reservation INTEGER PRIMARY KEY,
    admin INT NOT NULL CHECK (admin IN (0, 1)),
    FOREIGN KEY (id_Reservation) REFERENCES Reservation(id) ON DELETE CASCADE ON UPDATE CASCADE
);


--
-- Peuplement original
--

INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe, admin) VALUES ("E154706J", "Guyon", "Ulysse", "mdpUlysse123", 1);
INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe, admin) VALUES ("E189415L", "Wanono", "Sacha", "mdpSacha123", 1);
INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe, admin) VALUES ("E168087D", "Thuilier", "Elea", "mdpElea123", 1);
INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe, admin) VALUES ("E123456T", "Choquard", "Thomas", "mdpThomas123", 1);
INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe, admin) VALUES ("E123456A", "Etudiant", "Georges", "mdpGeorges123", 0);

INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("C003", "salle avec ordis", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("C002", "salle avec ordis cools", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("B022", "salle classique", "https://via.placeholder.com/100", 1);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("B023", "salle classique", "https://via.placeholder.com/100", 1);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("B001", "salle avec ordis cools", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("D117", "salle avec ordis oufs", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("B022", "salle inconnue de l'aile B d'Ireste", "https://via.placeholder.com/100", 1);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("A103", "salle de conf", "https://via.placeholder.com/100", 0);

INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 0, 30, "ordis", 2);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 0, 30, "ordis cools", 1);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("IHT", 0, 20, "video-projecteur", 3);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("IHT", 0, 20, "video-projecteur", 4);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 0, 30, "ordis cools", 5);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 1, 30, "ordis oufs, video-projecteur", 6);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 0, 30, "???", 7);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("IHT", 1, 30, "double video-projecteur, scene", 8);

INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Guitare", "ça fait de la musique", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Chariot", "ça roule", "https://via.placeholder.com/100", 1);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Canapé", "en cuir", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Chaise roulante", "ça roule", "https://via.placeholder.com/100", 1);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Micro", "ça fait du son", "https://via.placeholder.com/100", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Tableau roulant", "ça roule et ça affiche", "https://via.placeholder.com/100", 1);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("Video-projecteur", "pour afficher des trucs", "https://via.placeholder.com/100", 0);

INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (2, "Autre", "accueil IHT", 10);
INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (3, "Instrument", "salle de musique", 9);
INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (3, "Mobilier", "salle Peip", 11);
INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (30, "Mobilier", "D008 Ireste", 12);
INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (2, "Instrument", "salle de musique", 13);
INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (5, "Mobilier", "salle Peip", 14);
INSERT INTO Materiel (quantite, categorie, lieu, id_Element) VALUES (1, "Informatique", "accueil IHT ???", 15);

INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element) VALUES ("2019-01-03 19:30:00", "2019-01-04 19:30:00", 9);
INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element) VALUES ("2019-01-06 08:00:00", "2019-01-06 20:00:00", 9);
INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element) VALUES ("2019-01-20 08:00:00", "2019-01-20 11:30:00", 1);
INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element) VALUES ("2019-01-01 00:00:00", "2019-01-25 23:59:00", 10);
INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element) VALUES ("2019-01-03 19:30:00", "2019-01-05 20:00:00", 13);
INSERT INTO Creneau (date_heure_debut, date_heure_fin, id_Element) VALUES ("2019-01-12 14:00:00", "2019-01-12 17:15:00", 8);

INSERT INTO Reservation (raison, validation, date_heure_debut, date_heure_fin, id_Utilisateur, id_Creneau) VALUES ("je veux chanter", 0, "2019-01-03 20:00:00", "2019-01-03 22:00:00", "E189415L", 1);
INSERT INTO Reservation (raison, validation, date_heure_debut, date_heure_fin, id_Utilisateur, id_Creneau) VALUES ("je veux chanter", 0, "2019-01-03 20:00:00", "2019-01-03 22:00:00", "E189415L", 5);
INSERT INTO Reservation (raison, validation, date_heure_debut, date_heure_fin, id_Utilisateur, id_Creneau) VALUES ("déplacement de classeurs IdeSYS", 1, "2019-01-10 08:00:00", "2019-01-10 19:00:00", "E154706J", 4);
INSERT INTO Reservation (raison, validation, date_heure_debut, date_heure_fin, id_Utilisateur, id_Creneau) VALUES ("je veux faire une conference", 0, "2019-01-12 15:00:00", "2019-01-12 16:30:00", "E168087D", 6);

INSERT INTO MotCle VALUES (9, "électrique");
INSERT INTO MotCle VALUES (9, "cool");
INSERT INTO MotCle VALUES (11, "rouge");
INSERT INTO MotCle VALUES (11, "2places");
INSERT INTO MotCle VALUES (6, "informatique");

INSERT INTO Notification VALUES (1, 1);
INSERT INTO Notification VALUES (2, 0);
INSERT INTO Notification VALUES (3, 1);
INSERT INTO Notification VALUES (4, 1);


--
-- Vue SalleFull
--

CREATE VIEW SalleFull AS
SELECT Salle.id, batiment, etage, capacite, equipement, id_Element, nom, description, photo, validation_auto
FROM Salle JOIN Element ON Salle.id = Element.id;


--
-- Vue MaterielFull
--

CREATE VIEW MaterielFull AS
SELECT Materiel.id, quantite, categorie, lieu, id_Element, nom, description, photo, validation_auto
FROM Materiel JOIN Element ON Materiel.id = Element.id;