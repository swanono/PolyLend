# Projet Génie Logiciel - Groupe 4C

Partie 3 (web) du sujet 4 : **Réservation de ressources étudiant**

Auteurs : Éléa Thuilier, Thomas Choquard, Sacha Wanono, Ulysse Guyon

[![Logo PolyLend](./public/image/logo-readme.png "Lien vers le serveur distant de PolyLend")](http://hyblab.polytech.univ-nantes.fr/4C/)

### Sommaire

- [Rapports des phases précédentes](#rapports-des-phases-précédentes)
- [Dépôt GitLab](#dépôt-gitlab)
- [Installation en local](#installation-en-local)
- [Dépendances](#dépendances)
- [Notice d'utilisation du site](#notice-dutilisation-du-site)
- [Routes](#routes)
- [Bugs connus](#bugs-connus)
- [Fonctionnalités non implémentées](#fonctionnalités-non-implémentées)
- [Retour d'expérience](#retour-dexpérience)

## Rapports des phases précédentes

[Rapport Phase 1 IHM](https://docs.google.com/document/d/1yN1q8FLshcoPevb3HeBBLGbJEP1rozqiiMuzPevZynI/edit?usp=sharing)

[Rapport Phase 2 Conception](http://madoc.univ-nantes.fr/mod/wiki/view.php?pageid=11511)

## Dépôt GitLab

ssh : `git@gitlab.univ-nantes.fr:E154706J/projet-genie-logiciel.git`

https : `https://gitlab.univ-nantes.fr/E154706J/projet-genie-logiciel.git`

## Installation en local

Pour installer le serveur sur votre machine, suivez ces instructions :
- Téléchargez le dépot GitLab et entrez dans le dossier nouvellement créé via les commandes suivantes :
```bash
git clone [addresse du dépôt GitLab]

cd ./projet-genie-logiciel
```
- Si sqlite3 est déjà installé sur votre machine et intégré dans votre variable d'environement $PATH, vous pouvez exécuter cette commande :
```bash
rm ./sqlite3*
```
- Installez les modules nécessaires au bon fonctionnement du serveur :
```bash
npm install
```
- Créez la base de données sqlite :
```bash
npm run createDB
```
- Si vous souhaitez insérer des données préconstruites dans la base de données, vous pouvez executer cette commande :
```bash
npm run fillDB
```
- Lancez le serveur :
```bash
npm start
```
Après cette commande, le serveur devrait être lancé en **localhost** sur le **port 8081**.
Si la variable d'environnement $PORT est définie sur un port spécifique pour accueillir le serveur, alors le serveur se lancera sur le port indiqué par cette variable.

## Dépendances

- bcrypt pour le hashage des mots de passe
- sqlite3 pour la base de données
- express et passport pour la gestion des routes et midlewares du serveur
- Bootstrap 4 et JQuery sont utilisés pour la partie client mais ne nécessitent aucune installation

## Notice d'utilisation du site

### En tant que nouvel utilisateur

#### Inscription

Pour vous inscrire, rendez-vous sur la page d'accueil :
- Cliquez sur "Pas encore inscrit ?".
- Complétez vos informations.
- **Attention :** Le mot de passe doit contenir au moins : 1 majuscule, 1 minuscule et 1 chiffre.

(Si vous renseignez un nom contenant 'Lehn' ou 'Perreira' ou 'Normand' vous serez directement enregistré en tant qu'administrateur)

### En tant qu'utilisateur enregistré

#### Connexion

Pour vous connecter, rendez-vous sur la page d'accueil :
- Rentrez votre numéro étudiant et votre mot de passe
- Cliquez sur Se connecter ou appuyez sur la touche Entrée

#### Réserver un matériel

Une fois connecté, rendez-vous sur l'onglet Matériel :
- Cliquez sur le bouton "Reserver" du matériel souhaité. Une pop-up apparaît.
- Remplissez le créneau que vous souhaitez réserver.
- Indiquez votre raison de la réservation (Soyez explicite, afin que l'administrateur de ce matériel accepte votre réservation)
- Appuyez sur le bouton "Réserver"

>  Vous pouvez désormais consulter votre réservation dans l'onglet "Réservation" 
> **Attention :** Certaines réservations nécessitent la validation d'un administrateur, vous recevrez une notifications une fois celle-ci acceptée. 

#### Réserver une salle

Une fois connecté, rendez-vous sur l'onglet Salle :
- Cliquez sur le bouton "Réserver" de la salle souhaité. Une pop-up apparaît.
- Remplissez le créneau que vous souhaité réservé.
- Indiquez votre raison de la réservation (Soyez explicite, afin que l'administrateur de ce matériel accepte votre réservation)
- Appuyez sur le bouton "Réserver"

>  Vous pouvez désormais consulter votre réservation dans l'onglet "Réservation"
> **Attention :** Certaines réservations nécessitent la validation d'un administrateur, vous recevrez une notifications une fois celle-ci acceptée. 

#### Rechercher un matériel

Une fois connecté, rendez-vous sur l'onglet Matériel, sur la gauche de l'écran se trouve un champ de recherche :

- Le champ "Critère" permet la recherche d'un ou plusieurs mots dans le nom, les mots-clés, la description
- Le tri peut s'effectuer par date de disponibilité (croissante/décroissante) ou par quantité (croissante/décroissante)
- Vous pouvez également préciser le type de matériel recherché (informatique, instrument, mobilier, autre). Le choix "..." signifie que vous recherchez tout type de matériel.

#### Rechercher une salle

Une fois connecté, rendez-vous sur l'onglet Salle, sur la gauche de l'écran se trouve un champ de recherche :

- Le champ "Critère" permet la recherche d'un ou plusieurs mots dans le nom, les mots-clés, la description
- Le tri peut s'effectuer par date de disponibilité (croissante/décroissante) ou par capacités (croissante/décroissante).
- Vous pouvez également préciser le bâtiment dans lequel se situe la salle recherchée (Ireste,IHT). Le choix "..." signifie que vous recherchez dans tous les bâtiments.
- Vous pouvez préciser les équipements présents dans la salle recherchée.
- Vous pouvez également chercher en fonction de la capacité de la salle.


### En tant qu'administrateur

#### Valider/refuser une réservation

Une fois connecté en tant qu'administrateur.
Lorsqu'un item nécessite une valdiation, une notification apparait sur le profil d'un administrateur : 
- Cliquez sur la cloche (en haut à droite de l'écran)
- Une liste de notification apparaît dont la demande réservation : "Prenom Nom souhaite emprunter Element du AAAA-MM-DD hh:mm:ss au AAAA-MM-DD hh:mm:ss. Raison : ...."
- Cliquez sur Valider ou Refuser en fonction de votre choix.

#### Proposer un nouveau matériel 

Une fois connecté en tant qu'administrateur, rendez-vous sur l'onglet "Administration" :
- Cliquez sur "Ajouter un élement"
- Cliquez sur l'onglet Matériel (c'est l'onglet par défaut)
- Cocher la case "validation auto" indique que le matériel pourra être réservé sans avoir besoin de passer par un administrateur.
- Indiquez la quantité, le nom, la catégorie, la description, le lieu de disponibilité, les mots clés **(séparez les mots par des espace)**
- Précisez le(s) créneau(x) de disponibilités du matériel (Par défaut un seul créneau est proposé).
- Pour ajouter un créneau appuyez sur le bouton "Ajouter une plage de disponibilité"
- Validez votre ajout en appuyant sur "Ajouter"

> **Attention :** On ne peut pas proposer une image pour représenter un matériel

#### Proposer une nouvelle salle

Une fois connecté en tant qu'administrateur, rendez-vous sur l'onglet "Administration" :
- Cliquez sur "Ajouter un élement"
- Cliquez sur l'onglet Salle
- Cochez la case "validation auto" indique que la salle pourra être réserver sans demande à un administrateur.
- Indiquez le nom, le bâtiment, l'étage, la capacité, la description (facultative), les mots clés **(séparez les mots par des espace)**
- Cochez les équipements présents dans la salle
- Précisez le(s) créneau(x) de disponibilités de la salle (Par défaut un seul créneau est proposé).
- Pour ajouter un créneau appuyez sur le bouton "Ajouter une plage de disponibilité"
- Validez votre ajout en appuyant sur "Ajouter"

> **Attention :** On ne peut pas proposer une image pour représenter une salle


#### Recherches

Une fois connecté en tant qu'administrateur, rendez vous sur l'onglet "Administration". Sur la gauche de l'écran se trouve un champ de recherche :
- cliquer sur l'onglet matériel ou salle selon votre choix
- Référez vous à [Rechercher un matériel](#rechercher-un-matériel) ou à [Rechercher une Salle](#rechercher-une-salle) dans la section utilisateur


#### Supprimer un matériel/une salle

Une fois connecté en tant qu'administrateur, rendez-vous sur l'onglet "Administration" :
- Cliquez l'icône poubelle du matériel ou de la salle à supprimer

#### Changer les droits administrateurs d'un utilisateur

Une fois connecté en tant qu'administrateur, rendez-vous sur l'onglet "Administration" :
- Cliquez sur le bouton "Editer les droits d'administrateur"
- Lorsque l'icône d'un utilisateur possède un bouton rouge, celui-ci ne possède pas les droits administrateurs. Inversement avec le bouton vert.
- Pour donner les droits administrateur à un utilisateur lambda appuyer sur son bouton rouge.
- Pour enlever les droits administrateur à un administrateur appuyer sur son bouton vert.
- Appliquez ensuite le résultat à la base de données en appuyant sur le bouton Appliquer

## Routes

### Routes des pages

#### Partie publique

Cette partie est accessible via `/` ou via le préfixe `/public` indistinctement.

> - GET `/connexion.html`
> 
> Permet d'aller sur la page de connexion ([notice](#connexion))

> - GET `/inscription.html`
>
> Permet d'aller sur la page d'inscription ([notice](#inscription))

#### Partie private

Cette partie n'est accessible que si l'utilisateur s'est connecté avec un compte enregistré. Elle est accessible via le préfixe `/private/user`.

> - GET `/index.html`
>
> Permet d'aller à la page de réservation et de recherche de matériel ([réserver](#réserver-un-matériel) ou [rechercher](#rechercher-un-matériel))

> - GET `/salle.html`
>
> Permet d'aller à la page de réservation et de recherche de salle ([réserver](#réserver-une-salle) ou [rechercher](#rechercher-une-salle))

> - GET `/réservation.html`
>
> Permet d'aller à la page affichant l'historique des réservations de l'utilisateur

#### Partie administration

Cette partie n'est accessible que si l'utilisateur est enregistré comme étant administrateur dans la base de données. Elle est aussi soumise aux règles de la partie private. Elle est accessible via le préfixe `/private/admin`.

> - GET `/administration.html`
>
> Permet d'accéder à la page d'administration des salles et matériels proposés aux utilisateurs ([notice](#en-tant-quadministrateur))

> - GET `/droits.html`
>
> Permet d'accéder à la page permettant de modifier les droits administrateurs des utilisateurs enregistrés ([notice](#changer-les-droits-administrateurs-dun-utilisateur))

### Routes de l'API

Toutes ces routes sont préfixées de `/api`.

> - GET `/whoami/`
>
> Permet de récupérer les données de profil de l'utilisateur connecté.

> - GET `/logout/`
>
> Permet à un utilisateur connecté de se déconnecter et de retourner à la page de connexion.

> - POST `/utilisateur/register/`
>
> Permet à l'utilisateur de s'inscrire sur le site en renseignant son numéro étudiant, son prénom, son nom et son mot de passe.

> - POST `/utilisateur/login/`
>
> Permet à un utilisateur enregistré de se connecter au site en renseignant son numéro étudiant et son mot de passe.

> - POST `/utilisateur/bynum/`
>
> Permet de récupérer les données d'un utilisateur via son numéro étudiant.

> - GET `/utilisateur/getall/`
>
> Permet de récupérer la liste des utilisateurs enregistrés dans le serveur.

> - POST `/utilisateur/setadminrights/`
>
> Permet modifier les droits administrateurs d'un utilisateur en précisant son numéro étudiant et un booléen lui donnant les droits ou non.

> - GET `/notification/getall/`
>
> Permet à un utilisateur de récupérer toutes les notifications le concernant (il devra faire une autre requête api si il veut plus d'informations sur les réservations correspondant à ces notifications).

> - POST `/notification/seen/`
>
> Permet à l'utilisateur de prévenir le serveur qu'il a vu une notification particulière.

> - GET `/reservation/allbyuser/`
>
> Permet à un utilisateur de récupérer toutes les réservations le concernant.

> - POST `/reservation/getelem/`
>
> Permet de récupérer les données de l'élément concerné par un réservation donnée.

> - POST `/reservation/allbyid/`
>
> Permet de récupérer une liste de réservations correspondant à une liste d'id de réservations fournis.

> - POST `/reservation/allbyElem/`
>
> Permet de récupérer la liste des réservations annexées à un élément particulier.

> - POST `/reservation/validate/`
>
> Permet à un administrateur de valider ou refuser une réservation donnée.

> - POST `/reservation/submit/salle/`
>
> Permet à un utilisateur de faire une demande de réservation de salle.

> - POST `/reservation/submit/materiel/`
>
> Permet à un utilisateur de faire une demande de réservation de matériel.

> - POST `/creneau/byid/`
>
> Permet de récupérer un créneau par son id.

> - POST `/creneau/allbyid/`
>
> Permet de récupérer tous les créneaux concernant un élément en particulier.

> - GET `/creneau/getall/`
>
> Permet de récupérer tous les créneaux de la base de données.

> - POST `/element/byid/`
>
> Permet de récupérer toutes les données d'un élément via son id.

> - GET `/salle/getall/`
>
> Permet de récupérer toutes les salles de la base de données.

> - POST `/salle/add/`
>
> Permet à un administrateur de rajouter une salle avec des créneaux et mots-clés associés.

> - POST `/salle/delete/`
>
> Permet à un administrateur de supprimer une salle et tous les créneaux, réservations et mot-clés associés de la base de données.

> - POST `/salle/search/`
>
> Permet de récupérer une liste de salles correspondant à certains critères spécifiques.

> - POST `/salle/byid/`
>
> Permet de récupérer une salle via son id.

> - POST `/materiel/byid/`
>
> Permet de récupérer un matériel via son id.

> - GET `/materiel/getall/`
>
> Permet de récupérer tous les matériels de la base de données.

> - POST `/materiel/delete/`
>
>Permet à un administrateur de supprimer un matériel et tous les créneaux, réservations et mot-clés associés de la base de données.

> - POST `/materiel/search/`
>
> Permet de récupérer une liste de matériels correspondant à certains critères spécifiques.

> - POST `/materiel/add/`
>
> Permet à un administrateur d'ajouter un matériel avec des créneaux et mots-clés associés.

## Bugs connus

- [ ] Dans les formulaires de critères de recherche de toutes les page en possédant un, le champ où on peut inscrire des caractères à chercher ne fonctionne pas pour la partie description d'un matériel ou d'une salle.

## Fonctionnalités non implémentées

- Dans la page /private/admin/administration.html, un administrateur est sensé pouvoir modifier un élément, matériel ou salle, mais nous n'avons pas eu le temps d'implémenter cette fonctionnalité.

- Dans les prototypes fournis dans la [phase IHM](https://docs.google.com/document/d/1yN1q8FLshcoPevb3HeBBLGbJEP1rozqiiMuzPevZynI/edit?usp=sharing) de ce sujet, on pouvait voir apparaître les matériels et salles déjà réservés par quelqu'un d'autre. Cela aurait impliqué un total remaniement de la base de données (qui était déjà bancale) fournie dans la [phase de conception](http://madoc.univ-nantes.fr/mod/wiki/view.php?pageid=11511) et un travail trop important sur les critères de recherches et l'affichage de leurs résultats.

- Dans les prototypes, un bouton message était affiché sur les éléments déjà réservés ou sur les notifications de demandes de réservations refusées. Ce bouton n'a pas été implémenté partiellement à cause du point précédent mais aussi parce qu'il aurait impliqué encore plus de modification de base de données et l'implémentation d'un système de messages jamais décrit dans la [phase de conception](http://madoc.univ-nantes.fr/mod/wiki/view.php?pageid=11511).

## Retour d'expérience

### Difficultés rencontrées : 
    
- Partie HTML/CSS : 
    - Difficulté pour correspondre au prototype créés lors de la première phase : 
    Nous souhaitions que nos templates ressemblent le plus possible aux prototype proposés par le groupe de la phase 1 mais ce n'était pas toujours possible, par exemple pour les calendriers.
    - Création de pop-up :
    La création d'un pop-up n'était pas une vrai difficulté car nous utilisions Bootstrap. Cependant nous devions imbriquer jusqu'à quatre pop-up et cela pouvait être un peu plus compliqué et impliquait certains bugs de scrolling.
    - Création d'une première version du calendrier ainsi que d'un calendrier cliquable. En attendant un calendrier JavaScript nous avons créé un tableau d'exemple que nous colorions en fonction de l'état (disponible, réservé, en attente), cela ne respectait pas la forme du prototype.
    
    Ces deux dernières difficultés nous ont imposé d'adapter la demande à nos capacités en favorisant les fonctionnalités lors de la création.
        
- Partie JavaScript et SQL: 
    - Obligation de refaire la base de données car celle fournie n'était pas adaptée aux prototypes.
    - Création du système de recherche de salle et de matériel compliqué. Nous avons donc tenté de l'implémenter avec nos compétences mais un bon système aurait nécessité plusieurs semaines de travail en plus.
    - Intégration du service sur le serveur distant. Cela nous a permis de nous apercevoir de l'importance de mettre les routes en chemin relatif.

### Ce que nous avons appris : 

Durant ce projet, nous avons appris à mener un projet de développement de A à A.
Nous avons dû nous répartir les tâches en prenant en compte l'importance des tâches à effectuer, leur ordre et les capacités de chacun.
Ce projet nous a aussi permis de développer nos compétences en HTML, CSS (notamment avec Bootstrap) et JavaScript.
Nous avons pu observer l'importance de l'adaptation. En effet nous devions sans arrêt adapter notre travail, ou celui effectué par les groupes précédents, en fonction de nos capacités ou de la demande du client.
