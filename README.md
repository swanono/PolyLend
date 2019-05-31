# Projet Génie Logiciel - Groupe 4C

Partie 3 (web) du sujet 4 : réservation de ressources étudiant

[![Logo PolyLend](./public/image/logo.png "un lien vers le serveur distant de PolyLend")](http://hyblab.polytech.univ-nantes.fr/4C/)

## Dépôt GitLab

ssh : git@gitlab.univ-nantes.fr:E154706J/projet-genie-logiciel.git

https : https://gitlab.univ-nantes.fr/E154706J/projet-genie-logiciel.git

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
- Lancez le serveur (cette commande inclu aussi la création de la base de données, rendant la commande précédente optionnelle) :
```bash
npm start
```
Après cette commande, le serveur devrait être lancé en **localhost** sur le **port 8081**.
Si la variable d'environnement $PORT est définie sur un port spécifique pour accueillir le serveur, alors le serveur se lancera sur le port indiqué par cette variable.

## Dépendances

Aucune dépendance autre que celles données dans le sujet de madoc n'est nécessaire.

Les dépendances sont :
- sqlite3 pour la base de données
- express et passport pour la gestion des routes et midlewares du serveur
- Bootstrap 4 et JQuery sont utilisés pour la partie client mais ne nécessitent aucune installation

## Notice d'utilisation du site

### En tant que nouvel utilisateur

### En tant qu'utilisateur enregistré

### En tant qu'administrateur

## Routes

### Routes des pages

### Routes de l'API

## Bugs connus

- Dans les formulaires de critères de recherche de toutes les page en possédant un, le champ où on peut inscrire des caractères à chercher ne fonctionne pas pour la partie description d'un matériel ou d'une salle.

## Fonctionnalités non implémentées

- Dans la page /private/admin/administration.html, un administrateur est sensé pouvoir modifier un élément, matériel ou salle, mais nous n'avons pas eu le temps d'implémenter cette fonctionnalité.
- Dans les prototypes fournis dans la phase 1 de ce sujet, on pouvait voir apparaître les matériels et salles déjà réservés par quelqu'un d'autre. Cela aurait impliqué un total remaniement de la base de données (qui était déjà bancale) fournie dans la phase de conception et un travail trop important sur les critères de recherches et l'affichage de leurs résultats.
- Dans les prototypes, un bouton message était affiché sur les éléments déjà réservés ou sur les notifications de demandes de réservations refusées. Ce bouton n'a pas été implémenté partiellement à cause du point précédent mais aussi parce qu'il aurait impliqué encore plus de modification de base de données et l'implémentation d'un système de messages jamais décrit dans la phase de conception.

## Retour d'expérience