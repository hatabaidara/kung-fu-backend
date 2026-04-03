# 🚀 Guide Déploiement Backend sur Render avec TiDB Cloud

## 📋 Prérequis

- Compte Render (https://render.com)
- Compte TiDB Cloud (https://tidbcloud.com)
- Repository GitHub avec le code backend

---

## 🔧 Étape 1: Configuration Locale

### 1.1 Créer fichier .env local
```bash
# Copier le template
cp .env.example .env

# Éditer avec vos credentials TiDB
```

### 1.2 Tester la connexion TiDB localement
```bash
# Installer dépendances
npm install

# Tester connexion base de données
node test-db.js

# Démarrer le serveur local
npm start
```

### 1.3 Tester les routes localement
```bash
# Health check
curl http://localhost:3001/api/health

# API endpoints
curl http://localhost:3001/api

# Authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

---

## 🌐 Étape 2: Configuration TiDB Cloud

### 2.1 Créer cluster TiDB Cloud
1. Connectez-vous à TiDB Cloud
2. Créer un nouveau cluster
3. Noter les informations de connexion:
   - Host: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - Port: `4000`
   - User: `votre_username`
   - Password: `votre_password`
   - Database: `sportgym_db`

### 2.2 Créer utilisateur et permissions
```sql
-- Dans TiDB Cloud console
CREATE USER 'sportgym_user'@'%' IDENTIFIED BY 'votre_password';
GRANT ALL PRIVILEGES ON sportgym_db.* TO 'sportgym_user'@'%';
FLUSH PRIVILEGES;
```

---

## 🚀 Étape 3: Déploiement sur Render

### 3.1 Créer Web Service sur Render
1. Connectez-vous à Render Dashboard
2. "New +" → "Web Service"
3. Connecter votre repository GitHub
4. Configuration:

**Build Settings:**
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables:**
```
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=votre_username_tidb
TIDB_PASSWORD=votre_password_tidb
TIDB_DATABASE=sportgym_db
JWT_SECRET=votre_jwt_secret_key_2024_secure_unique
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://kung-fu-frontend.vercel.app
```

### 3.2 Déployer
- Cliquez "Create Web Service"
- Attendre le déploiement (2-5 minutes)

---

## 🧪 Étape 4: Tests Post-Déploiement

### 4.1 Vérifier le statut
```bash
# Health check
curl https://kung-fu-backend.onrender.com/api/health

# API endpoints
curl https://kung-fu-backend.onrender.com/api
```

### 4.2 Tester l'authentification
```bash
# Créer utilisateur admin
curl -X POST https://kung-fu-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@gym.com","password":"admin123","role":"admin"}'

# Se connecter
curl -X POST https://kung-fu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 4.3 Tester CRUD membres
```bash
# Ajouter un membre (avec token JWT)
curl -X POST https://kung-fu-backend.onrender.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{"name":"John Doe","email":"john@email.com","discipline":"Boxe","age":25}'

# Lister les membres
curl https://kung-fu-backend.onrender.com/api/members \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

---

## 🔄 Étape 5: Commandes Redéploiement

### 5.1 Redéploiement automatique
- Push sur GitHub → Redéploiement automatique

### 5.2 Redéploiement manuel
```bash
# Dans Render Dashboard
1. Aller au service
2. Cliquer "Manual Deploy"
3. Choisir "Deploy Latest Commit"
```

### 5.3 Redéploiement avec nouvelles variables
```bash
# Mettre à jour variables d'environnement
1. Dashboard → Service → Environment
2. Ajouter/modifier variables
3. "Save Changes" → Redéploiement automatique
```

---

## 🔍 Étape 6: Debugging et Logs

### 6.1 Vérifier les logs Render
1. Dashboard → Service → Logs
2. Chercher les erreurs:
   - Connexion TiDB échouée
   - Variables manquantes
   - Routes non trouvées

### 6.2 Erreurs communes
```bash
# TiDB connection failed
→ Vérifier TIDB_HOST, TIDB_USER, TIDB_PASSWORD

# JWT invalid
→ Vérifier JWT_SECRET

# CORS errors
→ Vérifier FRONTEND_URL

# Port already in use
→ Render gère automatiquement le PORT
```

---

## 📱 Étape 7: Configuration Frontend

### 7.1 Mettre à jour frontend .env
```env
VITE_API_URL=https://kung-fu-backend.onrender.com/api
```

### 7.2 Tester communication
```javascript
// Dans le frontend
fetch('https://kung-fu-backend.onrender.com/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend OK:', data));
```

---

## ✅ Checklist Validation

- [ ] Backend accessible: `https://kung-fu-backend.onrender.com/api/health`
- [ ] Routes API répondent: `https://kung-fu-backend.onrender.com/api`
- [ ] Connexion TiDB active (logs Render)
- [ ] Authentification fonctionne
- [ ] CRUD membres fonctionne
- [ ] Frontend communique avec backend
- [ ] Aucune erreur dans les logs Render

---

## 🆘 Support

**Render Docs:** https://render.com/docs
**TiDB Cloud Docs:** https://docs.pingcap.com/tidb-cloud

**Problèmes courants:**
- Timeout TiDB: Vérifier firewall TiDB Cloud
- CORS: Ajouter URL frontend dans variables Render
- Build failed: Vérifier package.json et scripts
