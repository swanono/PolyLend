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

INSERT INTO Utilisateur (numero_etudiant, nom, prenom, mot_de_passe) VALUES ("E154706J", "Guyon", "Ulysse", "Lol11111");
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("D117", "salle info cool", "default.png", 0);
INSERT INTO Element (nom, description, photo, validation_auto) VALUES ("D118", "salle de classe", "default.png", 0);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 1, 30, "fauteuils cools", 2);
INSERT INTO Salle (batiment, etage, capacite, equipement, id_Element) VALUES ("Ireste", 1, 30, "pc cools", 1);


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