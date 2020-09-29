# Application Link

1. Présentation de l'application
2. Manuel d'installation et d'utilisation
3. Fonctionnalitées implémentées
4. Liste des bugs connus et améliorations à apporter

----------------------------------------------------------------------------------------------------
## 1 - Présentation de l'application

Link est une application de chat permettant à ses utilisateurs d'échanger entre eux via un principe
pour le moins original: l'utilisateur ne peut pas choisir à qui il envoie ses messages mais il
peut choisir le rayon (en km) dans lequel il peut envoyer/recevoir des messages aux/des autres
utilisateurs de l'application.

----------------------------------------------------------------------------------------------------
## 2 - Manuel d'installation et d'utilisation

Pour utiliser l'application sur Windows:

*Prérequis:*
1. Node.js
2. Cordova
3. Java 1.8 (la version est importante)
4. Gradle
5. MongoDB
6. Android Studio avec cmd-line tools installé
7. Au moins un émulateur android disponible (créé via ligne de commandes ou via Android Studio)
    OU un téléphone portable android connecté au PC et connecté en wifi au même sous réseau que le serveur
8. Localisation active sur l'appareil android utilisé

*Pour installer l'application:*
    - Modifier dans le fichier frontend/www/js/constants.js la variable const SERVER_IP
    avec l'adresse IP locale de l'ordinateur
    - Dans un terminal aller dans le répertoire linkproject/frontend et faire:
        -> npm install
        -> cordova platforms add android
        -> cordova build android
    - Dans le répertoire linkproject/backend faire :
        -> npm install

> ***NB:*** Certaines étapes au cours de l'installation peuvent prendre du temps (de l'ordre de 5 min suivant le débit de conenxion)

*Pour lancer l'application:*
    - Dans un terminal aller dans linkproject/backend et faire:
        -> npm start
    - Dans un deuxième terminal aller dans linkproject/frontend et faire:
        -> cordova emulate android (pour lancer l'application dans un émulateur)
        OU cordova run android (pour lancer l'application sur un téléphone android connecté au PC)

> ***ATTENTION:*** Pour pouvoir utiliser l'application il faut autoriser manuellement l'application à
accéder à la position de l'appareil dans les paramètres du téléphone


----------------------------------------------------------------------------------------------------
## 3 - Fonctionnalitées implémentées

Lorsqu'un utilisateur n'est pas connecté à l'application
- Création d'un compte sur l'application. Pour pouvoir créer un compte l'utilisateur doit fournir
    - un pseudo
    - un email
    - un numéro de téléphone
    - un mot de passe
- Connexion d'un utilisateur à l'application

Lorsqu'un utilisateur est connecté à l'application

- Dans la page d'accueil: consultation des messages envoyés par les autres utilisateurs
s'ils sont dans la portée d'émission et de réception de messages. Possibité de naviguer
entre la page d'ajout d'activité, de modification de profil, d'affichage de la carte
et de déconnexion

- Dans la page d'ajout d'activité: l'utilisateur peut écrire son message dans cette
page avant de l'envoyer aux autres utilisateurs. Il a également la possibilité de joindre
une photo à son message.
NB: Tous les messages envoyés et reçus ont une date d'expiration. En théorie les messages
doivent expirer sous 24h.

- Dans Profile: possibilité de modifier le profil de l'utilisateur, i.e. son pseudo,
son numéro de téléphone, son mot de passe. C'est ici qu'on modifie la portée (en km) dans
laquelle l'utilisateur recevoir des messages.

- Dans Map: affichage de la carte sur laquelle est située un marqueur situant la position de
l'utilisateur de l'application, un cercle symbolisant la portée d'émission et de récéption des
messages et des marqueurs situant la position des autres utilisateurs ayant posté au moins un
message n'ayant pas encore expiré.

- Possibilité de déconnexion de l'application

> ***NB:*** Pour les besoins des tests et de la démonstration les messages expirent sous 2 min au lieu de 24h.

> ***NB 2:*** Deux comptes tests sont à disposition du testeur:

*Compte n°1:*
    Nom d'utilisateur/Pseudo: julie@gmail.com
    Mot de passe: testtest

*Compte n°2:*
    Nom d'utilisateur/Pseudo: toto@gmail.com
    Mot de passe: testtest

----------------------------------------------------------------------------------------------------
## 4 - Liste des bugs connus et améliorations à apporter


*Bugs connus:*

1. Lors de l'affichage de la carte, problème lors de l'affichage de la position des autres
utilisateurs


*Améliorations possibles:*

- Affichage des messages ne provenant que d'utilisateurs connus dans le carnet d'adresses
(pour l'instant et par choix de conception un simple
<Nom d'utilisateur> (in contact list) ou <Nom d'utilisateur> (not in contact list)
s'affiche dans l'en-tête du message)

- Vérifications renforcées lors de l'inscription d'un utilisateur de l'application
 (par exemple vérification de l'existence de l'email fourni et/ou vérifications de la force
 du mot de passe plus poussées)

- Possibilité pour l'utilisateur d'envoyer un photo à partir de la galerie tu téléphone et/ou
d'envoyer d'autres fichiers multimédias (vidéos/son/...)

- Possibilté pour l'utilisateur de choisir/modifier une photo de profil

- Possibilité pour l'utilisateur d'accéder au profil des autres utilisateurs

- Création de fils de discussions

- Améliorer l'UI et l'UX