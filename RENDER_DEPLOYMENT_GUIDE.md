# 🚀 Guide Déploiement Backend sur Render avec TiDB Cloud

## 📋 Prérequis
- Compte Render (https://render.com)
- Compte TiDB Cloud (https://tidbcloud.com)
- Repository GitHub avec le code backend

---

## 🔧 Étape 1: Configuration Variables d'Environnement sur Render

### 1.1 Connectez-vous à Render Dashboard
1. Allez sur https://render.com
2. Connectez-vous avec votre compte
3. Cliquez "New" → "Web Service"

### 1.2 Connecter Repository GitHub
1. "Connect a repository" ou choisissez votre repo
2. Sélectionnez `kung-fu-frontend` ou votre repo backend
3. Cliquez "Connect"

### 1.3 Configuration du Service
**Name:** `sportgym-backend`
**Region:** Choisissez la région la plus proche
**Branch:** `main`

**Build Settings:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Runtime:** `Node` (sélectionné automatiquement)

---

## 🔐 Étape 2: Variables d'Environnement TiDB

Dans la section "Environment" du service Render, ajoutez ces variables :

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
PORT=3001
```

**⚠️ Important:**
- Remplacez `votre_username_tidb` par votre vrai utilisateur TiDB
- Remplacez `votre_password_tidb` par votre vrai mot de passe TiDB
- Remplacez `votre_jwt_secret_key_2024_secure_unique` par une clé secrète unique

---

## 🚀 Étape 3: Déploiement

### 3.1 Lancer le déploiement
1. Cliquez "Create Web Service"
2. Render va automatiquement :
   - Cloner votre repository
   - Exécuter `npm install`
   - Démarrer avec `npm start`

### 3.2 Attendre le déploiement
- **Temps estimé:** 2-5 minutes
- **Statut:** "In Progress" → "Live"

### 3.3 URL du service
Une fois déployé, votre backend sera accessible :
```
https://kung-fu-backend.onrender.com
```

---

## 🧪 Étape 4: Tests Post-Déploiement

### 4.1 Test Health Check
```bash
curl https://kung-fu-backend.onrender.com/api/health
```

**Réponse attendue:**
```json
{"status":"OK","timestamp":"2024-01-01T12:00:00.000Z"}
```

### 4.2 Test API Endpoints
```bash
curl https://kung-fu-backend.onrender.com/api
```

**Réponse attendue:**
```json
{
  "message": "Sport Gym Management API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "members": "/api/members",
    "payments": "/api/payments",
    "attendance": "/api/attendance",
    "announcements": "/api/announcements",
    "health": "/api/health"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4.3 Test Authentification
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

---

## 📊 Étape 5: Vérification Logs Render

### 5.1 Accéder aux logs
1. Dashboard → Service → Logs
2. Cherchez ces messages :

**✅ Messages de succès:**
```
Successfully connected to TiDB database
Database tables initialized successfully
Server running on port 3001
Environment: production
```

**❌ Messages d'erreur à surveiller:**
```
Database connection failed: ECONNREFUSED
Access denied for user
Cannot connect to TiDB
Error: listen EADDRINUSE
```

### 5.2 Dépannage commun
- **ECONNREFUSED:** Vérifiez TIDB_HOST et TIDB_PORT
- **Access denied:** Vérifiez TIDB_USER et TIDB_PASSWORD
- **Database not found:** Vérifiez TIDB_DATABASE
- **CORS errors:** Vérifiez FRONTEND_URL

---

## 🔄 Étape 6: Redéploiement et Mises à Jour

### 6.1 Redéploiement automatique
- Push sur GitHub → Redéploiement automatique

### 6.2 Redéploiement manuel
1. Dashboard → Service
2. Cliquez "Manual Deploy"
3. "Deploy Latest Commit"

### 6.3 Mise à jour variables
1. Service → Environment
2. Ajouter/modifier variables
3. "Save Changes" → Redéploiement automatique

---

## 📱 Étape 7: Configuration Frontend

### 7.1 Mettre à jour .env.production
Dans le frontend, créez/modifiez `.env.production`:
```env
VITE_API_URL=https://kung-fu-backend.onrender.com/api
```

### 7.2 Déployer le frontend
- Push sur GitHub → Déploiement Vercel automatique
- Le frontend utilisera automatiquement l'URL de production

---

## ✅ Étape 8: Validation Finale

### 8.1 Checklist Backend
- [ ] `https://kung-fu-backend.onrender.com/api/health` retourne `{"status":"OK"}`
- [ ] `https://kung-fu-backend.onrender.com/api` liste les endpoints
- [ ] Logs Render montrent "Successfully connected to TiDB database"
- [ ] Aucune erreur 500 dans les logs
- [ ] Authentification fonctionne

### 8.2 Checklist Frontend
- [ ] `VITE_API_URL=https://kung-fu-backend.onrender.com/api` configuré
- [ ] Les appels API depuis le frontend fonctionnent
- [ ] Pas d'erreurs CORS dans la console navigateur
- [ ] Les données s'affichent correctement

### 8.3 Test Intégration Complète
```javascript
// Test depuis le frontend
fetch('https://kung-fu-backend.onrender.com/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend OK:', data))
  .catch(err => console.error('❌ Backend Error:', err));
```

---

## 🆘 Support et Dépannage

**Render Dashboard:** https://dashboard.render.com
**Documentation:** https://render.com/docs

**Problèmes courants et solutions:**

| Problème | Solution |
|----------|----------|
| Build failed | Vérifiez package.json et scripts |
| Database connection failed | Vérifiez credentials TiDB |
| CORS errors | Vérifiez FRONTEND_URL |
| 500 Internal Server | Consultez les logs Render |
| Timeout | Augmentez les timeouts dans database.js |

**Contact support si nécessaire:**
- Render: support@render.com
- TiDB Cloud: support@pingcap.com

---

🎉 **Votre backend est maintenant déployé et fonctionnel sur Render avec TiDB Cloud !**
