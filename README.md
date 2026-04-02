# 🚀 Sport Gym Management - Backend API

## 📋 Description

Backend API de l'application de gestion de gym Sport Gym Management, développé avec Node.js, Express et TiDB Cloud.

## 🚀 Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimaliste
- **TypeScript** - Typage statique
- **TiDB Cloud** - Base de données distribuée (MySQL compatible)
- **JWT** - Authentification sécurisée
- **Bcrypt** - Hashage des mots de passe
- **Helmet** - Sécurité HTTP
- **Rate Limiting** - Protection contre les attaques

## 📱 Fonctionnalités

- 🔐 **Authentification** sécurisée avec JWT
- 👥 **Gestion des membres** (CRUD complet)
- 💳 **Système de paiements** et transactions
- 📅 **Suivi des présences** et pointages
- 📢 **Annonces** et communications
- 🛡️ **Sécurité** avancée (CORS, Helmet, Rate limiting)
- 📊 **API REST** complète et documentée
- 🗄️ **Base de données** scalable avec TiDB

## 🛠️ Installation

```bash
# Cloner le repository
git clone git@github.com:hatabaidara/kung-fu-backend.git
cd kung-fu-backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Démarrer le serveur
npm run dev
```

## 🌐 Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
# Configuration TiDB Cloud
TIDB_CLOUD_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_CLOUD_PORT=4000
TIDB_CLOUD_USER=votre_username
TIDB_CLOUD_PASSWORD=votre_password
TIDB_CLOUD_DATABASE=sportgym_db

# Configuration JWT
JWT_SECRET=votre_jwt_secret_key
JWT_EXPIRES_IN=7d

# Configuration serveur
PORT=3001
NODE_ENV=development

# Configuration CORS
FRONTEND_URL=http://localhost:5173
```

## 📦 Scripts Disponibles

```bash
npm start      # Démarrer le serveur en production
npm run dev    # Démarrer le serveur en développement
npm test       # Exécuter les tests
npm run lint   # Vérifier le code avec ESLint
```

## 🏗️ Structure du Projet

```
backend/
├── src/
│   ├── server.js           # Point d'entrée du serveur
│   ├── config/             # Configuration de la base de données
│   │   └── database.js     # Connexion TiDB Cloud
│   ├── routes/             # Routes API
│   │   ├── auth.js         # Authentification
│   │   ├── members.js      # Gestion des membres
│   │   ├── payments.js     # Paiements
│   │   ├── attendance.js   # Présences
│   │   └── announcements.js # Annonces
│   ├── middleware/         # Middlewares personnalisés
│   ├── models/             # Modèles de données
│   └── utils/              # Utilitaires
├── tests/                  # Tests unitaires
├── package.json            # Dépendances et scripts
└── README.md               # Documentation
```

## 🔗 API Endpoints

### **Authentification**
```
POST /api/auth/login      - Connexion utilisateur
POST /api/auth/register   - Inscription utilisateur
GET  /api/auth/profile    - Profil utilisateur
```

### **Membres**
```
GET    /api/members       - Lister tous les membres
GET    /api/members/:id   - Détails d'un membre
POST   /api/members       - Créer un membre
PUT    /api/members/:id   - Mettre à jour un membre
DELETE /api/members/:id   - Supprimer un membre
```

### **Paiements**
```
GET    /api/payments      - Lister tous les paiements
GET    /api/payments/:id  - Détails d'un paiement
POST   /api/payments      - Créer un paiement
PUT    /api/payments/:id  - Mettre à jour un paiement
```

### **Présences**
```
GET    /api/attendance    - Lister les présences
GET    /api/attendance/:id - Détails d'une présence
POST   /api/attendance    - Enregistrer une présence
PUT    /api/attendance/:id - Mettre à jour une présence
```

### **Annonces**
```
GET    /api/announcements - Lister les annonces
GET    /api/announcements/:id - Détails d'une annonce
POST   /api/announcements - Créer une annonce
PUT    /api/announcements/:id - Mettre à jour une annonce
DELETE /api/announcements/:id - Supprimer une annonce
```

### **Health Check**
```
GET /api/health           - Vérifier l'état de l'API
```

## 🛡️ Sécurité

### **Authentification JWT**
- Tokens JWT avec expiration configurable
- Validation des tokens sur les routes protégées
- Gestion des tokens expirés

### **Sécurité HTTP**
- **Helmet** : Protection contre les vulnérabilités web
- **CORS** : Configuration cross-origin
- **Rate Limiting** : Protection contre les abus
- **Input Validation** : Validation des données entrantes

### **Base de données**
- **Connexions sécurisées** avec SSL/TLS
- **Requêtes paramétrées** contre les injections SQL
- **Hashage des mots de passe** avec Bcrypt

## 📊 Base de Données (TiDB Cloud)

### **Structure des Tables**
```sql
-- Utilisateurs
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membres
CREATE TABLE members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  membership_type ENUM('basic', 'premium', 'vip'),
  status ENUM('active', 'inactive', 'expired'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paiements
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status ENUM('pending', 'completed', 'failed'),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Présences
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT,
  check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  check_out TIMESTAMP NULL,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Annonces
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Déploiement

### **Railway (Recommandé)**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter et déployer
railway login
railway up
```

### **Autres plateformes**
- Heroku
- AWS EC2
- DigitalOcean
- Google Cloud Platform

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

## 📝 Logs et Monitoring

- **Logs structurés** avec Winston
- **Health checks** automatiques
- **Monitoring des performances**
- **Alertes** sur les erreurs critiques

## 🤝 Contribuer

1. Fork le repository
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Committer les changements (`git commit -m 'Add amazing feature'`)
4. Pusher la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Express.js** pour le framework web
- **TiDB Cloud** pour la base de données scalable
- **JWT** pour l'authentification sécurisée
- **Bcrypt** pour le hashage des mots de passe

---

## 🎯 Projet Complet

Ce backend fait partie du projet complet **Sport Gym Management** :

- **Frontend** : [kung-fu-frontend](https://github.com/hatabaidara/kung-fu-frontend)
- **Backend** : Ce repository
- **Database** : TiDB Cloud

---

**🎊 Développé avec ❤️ pour les passionnés de fitness !**
