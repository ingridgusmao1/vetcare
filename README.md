🐾 VetCare

Clinique vétérinaire moderne — Système de gestion interne pour vétérinaires et assistants
Application full-stack TypeScript : React + Node/Express + PostgreSQL, conteneurisée avec Docker.


📋 Table des matières

À propos
Fonctionnalités
Stack technique
Prérequis
Installation rapide (Docker)
Installation manuelle (développement)
Identifiants de démonstration
Structure du projet
API REST — résumé des endpoints
Tests
Scripts npm
Variables d'environnement
Sécurité
Accessibilité
Documentation complète
Auteur


🎯 À propos
VetCare est une application web complète conçue pour digitaliser la gestion d'une clinique vétérinaire. Elle permet aux administrateurs, vétérinaires et assistants de gérer les patients (animaux), leurs propriétaires, les consultations, les dossiers médicaux et les traitements depuis un seul espace sécurisé.
Le projet a été développé dans le cadre du cahier des charges validant la fin de formation : 17 user stories, modélisation MCD complète, contraintes WCAG 2.1 AA, couverture de tests ≥ 80 %, et déploiement Docker à 3 conteneurs.

✨ Fonctionnalités
DomaineFonctionnalitésAuthentificationConnexion / déconnexion, création de comptes (admin uniquement), 3 rôles : administrateur, vétérinaire, assistantPatientsAjout, consultation, modification, recherche en temps réel, désactivation (soft delete)PropriétairesCréation, liste des animaux associés, gestion des coordonnéesConsultationsCréation, mise à jour du statut (prévue / terminée / annulée), filtrage par date et statutDossiers médicauxUn dossier par animal (relation 1:1), édition des allergies, intolérances et condition physiqueTraitementsPrescription, suivi des traitements actifs par patientTableau de bordKPIs en temps réel : animaux suivis, consultations de la semaine, traitements en cours

🛠 Stack technique
Frontend

React 18 + TypeScript 5 — composants typés et réutilisables
Vite 5 — build tool moderne, HMR ultra-rapide
React Router 6 — routing client-side
Axios — client HTTP avec intercepteurs
React Hook Form — formulaires performants
Atomic Design — atoms → molecules → organisms → pages

Backend

Node.js 20 + Express 4 + TypeScript 5
PostgreSQL 15 — base de données relationnelle (ENUMs natifs, triggers)
node-postgres (pg) — driver avec pool de connexions
Zod — validation et inférence de types
Argon2id — hashage des mots de passe (recommandation OWASP)
JWT + cookie httpOnly — authentification sans état
Helmet + CORS — sécurité HTTP

Tests

Jest + Supertest — tests unitaires et d'intégration backend (couverture ≥ 80 %)
Vitest + React Testing Library — tests frontend

Déploiement

Docker + Docker Compose — 3 conteneurs orchestrés (db, backend, frontend)
Nginx — service du SPA et reverse proxy vers l'API


📦 Prérequis
OutilVersionPourquoiNode.js20 LTSBackend + outils frontendnpm10+Installé avec NodePostgreSQL15+Uniquement pour le mode manuelDocker DesktopdernièreMode recommandéGit2.x+Cloner le dépôt

🚀 Installation rapide (Docker)
Méthode recommandée — 3 commandes.
bash# 1. Cloner le dépôt
git clone <repo-url> vetcare
cd vetcare

# 2. Créer le fichier .env à la racine (clé JWT)
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" > .env

# 3. Lancer les 3 conteneurs
docker compose up -d --build
Une fois les conteneurs démarrés (environ 1 minute la première fois) :

🌐 Frontend : http://localhost
🔌 API : http://localhost:4000/api/health
🗄 Base de données : localhost:5432 (postgres / postgres / vetcare)

Commandes utiles :
bashdocker compose logs -f              # Voir les logs de tous les services
docker compose logs -f backend      # Logs d'un service précis
docker compose exec db psql -U postgres -d vetcare   # Accès psql
docker compose down                 # Arrêter (garde les données)
docker compose down -v              # Arrêter et effacer la BD

🔧 Installation manuelle (développement)
Utile si tu veux modifier le code avec rechargement à chaud.
1. Base de données
bash# Créer la base
psql -U postgres -c "CREATE DATABASE vetcare;"

# Appliquer le schéma et les données de démo
psql -U postgres -d vetcare -f database/schema.sql
psql -U postgres -d vetcare -f database/seed.sql
2. Backend
bashcd backend
npm install

# Copier le template d'environnement et générer un JWT_SECRET
cp .env.example .env
# Éditer .env et remplacer JWT_SECRET par une vraie chaîne aléatoire

# Générer les vrais hashes Argon2 pour les comptes de démo
npx tsx scripts/generate-seed-hashes.ts > ../database/seed_passwords.sql
psql -U postgres -d vetcare -f ../database/seed_passwords.sql

# Démarrer en mode développement (rechargement à chaud)
npm run dev
Le backend tourne sur http://localhost:4000.
3. Frontend
bashcd ../frontend
npm install
npm run dev
Le frontend tourne sur http://localhost:5173 (Vite redirige /api/* vers localhost:4000 automatiquement).

🔑 Identifiants de démonstration
Trois comptes pré-créés, un par rôle :
RôleEmailMot de passeAdministrateuradmin@vetcare.frAdmin1234!Vétérinairemarie@vetcare.frVet1234!Assistantsofia@vetcare.frAsst1234!

⚠️ Ces comptes ne sont activés qu'après avoir exécuté le script generate-seed-hashes.ts (ou en mode Docker, ils sont déjà actifs).


📁 Structure du projet
vetcare/
├── docker-compose.yml          # Orchestration des 3 conteneurs
├── README.md                   # Ce fichier
├── VetCare_Dossier_Completo.md # Documentation pédagogique complète
│
├── database/
│   ├── schema.sql              # 8 tables, ENUMs, triggers, index
│   └── seed.sql                # Données de démonstration
│
├── backend/                    # Node + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Env, pool PostgreSQL
│   │   ├── types/              # Types partagés
│   │   ├── models/             # 6 models (couche M de MVC)
│   │   ├── validators/         # Schemas Zod
│   │   ├── controllers/        # 7 controllers (couche C de MVC)
│   │   ├── middlewares/        # auth, validate, errorHandler
│   │   ├── routes/             # 7 routers
│   │   ├── utils/              # password (Argon2), token (JWT)
│   │   ├── app.ts              # Construction de l'app Express
│   │   └── server.ts           # Démarrage HTTP
│   └── tests/
│       ├── unit/               # Tests unitaires
│       └── integration/        # Tests Supertest
│
└── frontend/                   # React + Vite + TypeScript
    ├── src/
    │   ├── styles/             # Tokens CSS, global.css
    │   ├── lib/                # Instance axios
    │   ├── api/                # 7 modules API typés
    │   ├── context/            # AuthContext
    │   ├── components/
    │   │   ├── atoms/          # Button, Input, Badge, Avatar, Spinner
    │   │   ├── molecules/      # FormField, SearchBar, KpiCard
    │   │   └── organisms/      # Header, Sidebar, PatientsTable
    │   ├── layouts/            # PublicLayout, DashboardLayout
    │   ├── pages/              # 9 pages
    │   └── routes/             # PrivateRoute
    └── tests/                  # Tests Vitest

🔌 API REST — résumé des endpoints
MéthodeURLRôle requisDescriptionGET/api/healthpublicHealthcheckPOST/api/auth/loginpublicConnexionPOST/api/auth/logoutpublicDéconnexionPOST/api/auth/registeradminCréation de compteGET/api/auth/meauthentifiéProfil courantGET/api/proprietairesauthentifiéListeGET/api/proprietaires/:idauthentifiéDétailGET/api/proprietaires/:id/animalsauthentifiéAnimaux du propriétairePOST/api/proprietairesauthentifiéCréationPUT/api/proprietaires/:idauthentifiéModificationDELETE/api/proprietaires/:idauthentifiéSuppressionGET/api/patientsauthentifiéListe (filtres : search, espece, actif)GET/api/patients/:idauthentifiéDétailPOST/api/patientsauthentifiéCréation + dossier autoPUT/api/patients/:idauthentifiéModificationDELETE/api/patients/:idvet/adminSoft delete (actif = false)GET/api/dossiersauthentifiéListeGET/api/dossiers/:idauthentifiéDétailGET/api/dossiers/by-patient/:patientIdauthentifiéDossier d'un patientPUT/api/dossiers/:idvet/adminMise à jour médicaleGET/api/consultationsauthentifiéListe (filtres : statut, dates)POST/api/consultationsvet/adminCréationPATCH/api/consultations/:id/statusvet/adminChangement de statut (US-12)GET/api/traitementsauthentifiéListeGET/api/traitements/active-by-patient/:patientIdauthentifiéTraitements actifsPOST/api/traitementsvet/adminPrescriptionGET/api/dashboard/statsauthentifié3 KPIs (US-17)
Exemple : connexion via curl
bashcurl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vetcare.fr","password":"Admin1234!"}' \
  -c cookies.txt

curl http://localhost:4000/api/auth/me -b cookies.txt

🧪 Tests
Backend (Jest + Supertest)
bashcd backend
npm test                  # Tous les tests
npm run test:watch        # Mode watch (TDD)
npm run test:coverage     # Avec rapport de couverture
Le seuil de couverture ≥ 80 % (branches, fonctions, lignes, statements) est imposé par le cahier des charges et fait échouer la CI si non atteint.
Frontend (Vitest)
bashcd frontend
npx vitest run            # Tous les tests
npx vitest                # Mode watch
npx vitest run --coverage # Avec couverture

📜 Scripts npm
Backend (backend/package.json)
CommandeActionnpm run devDémarre avec rechargement à chaud (tsx)npm run buildCompile TypeScript vers dist/npm startLance le JavaScript compilé (production)npm testLance Jest une foisnpm run test:coverageTests + rapport de couverturenpm run lintType-check sans génération
Frontend (frontend/package.json)
CommandeActionnpm run devVite dev server avec proxy /apinpm run buildBuild de production dans dist/npm run previewSert le build localement

🔐 Variables d'environnement
Backend (backend/.env)
VariableExempleDescriptionPORT4000Port HTTP du backendNODE_ENVdevelopment | production | testMode d'exécutionDATABASE_URLpostgres://postgres:postgres@localhost:5432/vetcareChaîne de connexionJWT_SECRET(64+ caractères aléatoires)Clé de signature des tokensJWT_EXPIRES_IN8hDurée de vie d'une sessionCORS_ORIGINhttp://localhost:5173Origines autorisées (CSV)COOKIE_SECUREfalse (dev) | true (prod)Cookie HTTPS-only
Racine (.env pour Docker Compose)
VariableDescriptionJWT_SECRETPassée au conteneur backend

⚠️ Le fichier .env est dans .gitignore et ne doit jamais être versionné.
Utiliser backend/.env.example comme modèle.


🛡 Sécurité
MécanismeImplémentationHash des mots de passeArgon2id (mémoire 64 MB, 3 itérations, 4 threads — recommandation OWASP 2024)Tokens de sessionJWT signé, stocké en cookie httpOnly, sameSite=lax, expiration 8hInjection SQLRequêtes paramétrées uniquement ($1, $2...) — jamais de concaténationHeaders HTTPHelmet (CSP, X-Frame-Options, X-Content-Type-Options, HSTS)CORSWhitelist explicite des origines, credentials: trueValidation des entréesZod sur chaque route POST / PUT / PATCHÉnumération d'utilisateursMessage générique sur erreur de login (Identifiants invalides)Contrôle d'accèsMiddleware requireAuth + requireRole(...) hiérarchique

♿ Accessibilité (WCAG 2.1 niveau AA)
Critère WCAGImplémentation1.4.3 ContrasteRatio ≥ 4.5:1 sur tous les textes2.1.1 ClavierTous les éléments interactifs accessibles au clavier2.4.1 Skip linkLien « Aller au contenu principal » sur chaque page2.4.3 Ordre du focusfocus-visible 2px solid couleur accent2.4.6 Étiquettes<label> lié à chaque <input> via htmlFor3.3.1 Identification des erreursrole="alert" sur messages d'erreur, aria-invalid sur champs3.3.2 Étiquettes ou instructionsAstérisque visible + attribut required sur champs obligatoiresprefers-reduced-motionDésactivation automatique des animations

📖 Documentation complète
Pour le tutoriel pédagogique pas à pas (du zéro au projet livrable) et le dossier de défense, voir :
📄 VetCare_Dossier_Completo.md — 7 000+ lignes couvrant :

Modélisation MCD → MLD → MPD
Construction du backend (6 models, 7 controllers, validators)
Construction du frontend (Atomic Design, 9 pages)
Tests et couverture
Docker Compose détaillé
Scénario de présentation 20 min + 15 questions/réponses pour le jury


👤 Auteur
Ingrid Gusmão — Étudiante développeuse
Période : Mars – Avril 2026

« Les animaux ne parlent pas, mais leurs données oui. »


📄 Licence
Projet pédagogique — usage non commercial.