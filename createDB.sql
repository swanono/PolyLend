DROP TABLE IF EXISTS Equipement;
DROP TABLE IF EXISTS Salle;
DROP TABLE IF EXISTS Association;
DROP TABLE IF EXISTS Element;
DROP TABLE IF EXISTS Creneau;
DROP TABLE IF EXISTS Utilisateur;
DROP TABLE IF EXISTS Reservation;


--
-- Table Equipement
--

CREATE TABLE Equipement(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_achat TEXT NOT NULL,
    etat TEXT NOT NULL
);


--
-- Table Salle
--

CREATE TABLE Salle(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_salle INT NOT NULL,
    video_proj INT NOT NULL CHECK(video_proj IN (0, 1)),
    nom_batiment INT TEXT NOT NULL,
    nom_aile TEXT NOT NULL
);


--
-- Table Association
--

CREATE TABLE Association(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    nb_adherents TEXT NOT NULL,
    id_Salle INTEGER NOT NULL REFERENCES Salle(ID) ON DELETE CASCADE
);


--
-- Table Element
--

CREATE TABLE Element(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    photo TEXT NOT NULL,
    id_Equipement INTEGER REFERENCES Equipement(id) ON DELETE SET NULL,
    id_Salle INTEGER NOT NULL REFERENCES Salle(id) ON DELETE CASCADE,
    id_Association INTEGER NOT NULL REFERENCES Association(id) ON DELETE CASCADE
);


--
-- Table Creneau
--

CREATE TABLE Creneau(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_heure_debut TEXT NOT NULL,
    date_heure_fin TEXT NOT NULL,
    etat INT NOT NULL,
    id_Element INTEGER NOT NULL REFERENCES Element(id) ON DELETE CASCADE
);


--
-- Table Utilisateur
--

CREATE TABLE Utilisateur(
    numero_etudiant TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    mot_de_passe TEXT NOT NULL,
    id_Association INTEGER REFERENCES Association(id) ON DELETE SET NULL
);


--
-- Table Reservation
--

CREATE TABLE Reservation(
    nombre_de_personnes INT NOT NULL,
    raison TEXT NOT NULL,
    id_Utilisateur TEXT NOT NULL REFERENCES Utilisateur(numero_etudiant) ON DELETE CASCADE,
    id_Creneau INTEGER PRIMARY KEY REFERENCES Creneau(id) ON DELETE CASCADE
);