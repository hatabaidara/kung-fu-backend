# 📊 Guide Vérification Logs Render

## 🔍 Étape 1: Accéder aux Logs Render

### 1.1 Navigation dans le Dashboard
1. Connectez-vous à https://dashboard.render.com
2. Cliquez sur votre service `sportgym-backend`
3. Cliquez sur l'onglet "Logs"

### 1.2 Options de filtrage
- **Real-time:** Logs en temps réel
- **Build:** Logs de construction
- **Runtime:** Logs d'exécution
- **All:** Tous les logs

---

## ✅ Messages de Succès à Rechercher

### 2.1 Connexion TiDB Réussie
```
Successfully connected to TiDB database
Database connection established
Connected to TiDB Cloud
```

### 2.2 Initialisation Base de Données
```
Database tables initialized successfully
Tables created successfully
Database ready for connections
```

### 2.3 Démarrage Serveur
```
Server running on port 3001
Environment: production
Sport Gym Management API started
```

### 2.4 Health Check
```
GET /api/health 200
Health check endpoint accessed
API is responding correctly
```

---

## ❌ Messages d'Erreur à Surveiller

### 3.1 Erreurs de Connexion TiDB
```
Database connection failed: ECONNREFUSED
Cannot connect to TiDB Cloud
Connection timeout
Access denied for user 'xxx'@'xxx'
```

### 3.2 Erreurs de Configuration
```
TIDB_HOST is not defined
Missing environment variables
JWT_SECRET is required
PORT configuration error
```

### 3.3 Erreurs de Serveur
```
Error: listen EADDRINUSE :::3001
Port already in use
Server failed to start
```

### 3.4 Erreurs CORS
```
CORS policy error
Origin not allowed
Frontend URL mismatch
```

---

## 🛠️ Guide Dépannage par Erreur

### 4.1 ECONNREFUSED
**Cause:** Mauvaise configuration TiDB
**Solution:**
1. Vérifiez `TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
2. Vérifiez `TIDB_PORT=4000`
3. Confirmez que le cluster TiDB est actif

### 4.2 Access Denied
**Cause:** Mauvais credentials TiDB
**Solution:**
1. Vérifiez `TIDB_USER` et `TIDB_PASSWORD`
2. Confirmez que l'utilisateur a les permissions
3. Recréez l'utilisateur TiDB si nécessaire

### 4.3 Database Not Found
**Cause:** Base de données n'existe pas
**Solution:**
1. Vérifiez `TIDB_DATABASE=sportgym_db`
2. Créez la base de données dans TiDB Cloud
3. Donnez les permissions à l'utilisateur

### 4.4 CORS Errors
**Cause:** Frontend non autorisé
**Solution:**
1. Vérifiez `FRONTEND_URL=https://kung-fu-frontend.vercel.app`
2. Ajoutez d'autres URLs si nécessaire
3. Redéployez après modification

### 4.5 JWT Secret Missing
**Cause:** JWT_SECRET non configuré
**Solution:**
1. Ajoutez `JWT_SECRET=votre_jwt_secret_key_2024_secure_unique`
2. Utilisez une chaîne unique et sécurisée
3. Redéployez après modification

---

## 📈 Monitoring en Temps Réel

### 5.1 Commandes de Test
```bash
# Test health check
curl -w "\nHTTP Status: %{http_code}\n" \
  https://kung-fu-backend.onrender.com/api/health

# Test API endpoints
curl -w "\nHTTP Status: %{http_code}\n" \
  https://kung-fu-backend.onrender.com/api

# Monitor response time
time curl https://kung-fu-backend.onrender.com/api/health
```

### 5.2 Surveillance Continue
- **Ouvrir les logs Render** dans un onglet
- **Exécuter les tests** dans un autre onglet
- **Observer les logs** en temps réel

---

## 🎯 Checklist Validation Logs

### 6.1 Logs de Succès ✅
- [ ] "Successfully connected to TiDB database"
- [ ] "Database tables initialized successfully"
- [ ] "Server running on port 3001"
- [ ] "Environment: production"
- [ ] "GET /api/health 200"

### 6.2 Pas d'Erreurs ❌
- [ ] Pas de "ECONNREFUSED"
- [ ] Pas de "Access denied"
- [ ] Pas de "Database not found"
- [ ] Pas de "CORS policy error"
- [ ] Pas de "Internal Server Error 500"

### 6.3 Performance 📊
- [ ] Temps réponse < 2 secondes
- [ ] Pas de timeout
- [ ] Mémoire stable
- [ ] CPU normal

---

## 🚨 Actions d'Urgence

### 7.1 Si le backend ne répond pas
1. **Vérifier les logs** pour erreurs critiques
2. **Redémarrer le service** depuis Render
3. **Vérifier les variables** d'environnement
4. **Tester localement** avec mêmes variables

### 7.2 Si TiDB ne se connecte pas
1. **Vérifier le cluster** TiDB Cloud
2. **Tester la connexion** avec un client MySQL
3. **Recréer l'utilisateur** TiDB
4. **Mettre à jour les credentials**

### 7.3 Si CORS bloque le frontend
1. **Vérifier FRONTEND_URL** exacte
2. **Ajouter l'URL** dans les logs Render
3. **Redéployer** après modification
4. **Tester avec curl** depuis différentes origines

---

## 📞 Support

**Render Support:** support@render.com
**TiDB Cloud Support:** support@pingcap.com

**Informations à fournir au support:**
- URL du service Render
- Logs d'erreur complets
- Variables d'environnement (sans passwords)
- Timestamp exact de l'erreur

---

🎯 **Une fois tous les messages de succès présents et aucune erreur, votre backend est parfaitement fonctionnel !**
