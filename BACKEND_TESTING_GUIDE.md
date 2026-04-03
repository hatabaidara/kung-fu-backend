# 🧪 Guide Tests Backend Complet

## 🎯 Objectifs des Tests

- ✅ `/api/health` retourne `{"status":"OK"}`
- ✅ `/api` liste les endpoints disponibles
- ✅ Frontend fonctionne avec `VITE_API_URL=https://kung-fu-backend.onrender.com/api`
- ✅ Pas d'erreurs CORS
- ✅ Connexion TiDB fonctionnelle

---

## 🚀 Test 1: Health Check

### 1.1 Commande Test
```bash
curl https://kung-fu-backend.onrender.com/api/health
```

### 1.2 Réponse Attendue ✅
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 1.3 Réponses d'Erreur ❌
```json
{"error": "Internal Server Error"}
{"error": "Database connection failed"}
{"error": "Service unavailable"}
```

### 1.4 Test Avancé
```bash
# Test avec headers détaillés
curl -v -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  https://kung-fu-backend.onrender.com/api/health

# Test de charge
for i in {1..10}; do
  curl -s https://kung-fu-backend.onrender.com/api/health | jq .
  sleep 0.5
done
```

---

## 📋 Test 2: API Endpoints Listing

### 2.1 Commande Test
```bash
curl https://kung-fu-backend.onrender.com/api
```

### 2.2 Réponse Attendue ✅
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

### 2.3 Validation
- [ ] Message contient "Sport Gym Management API"
- [ ] Version "1.0.0"
- [ ] Tous les endpoints listés
- [ ] Timestamp présent

---

## 🔐 Test 3: Authentification

### 3.1 Création Utilisateur Admin
```bash
curl -X POST https://kung-fu-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@gym.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 3.2 Réponse Attendue ✅
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gym.com",
    "role": "admin"
  }
}
```

### 3.3 Test Login
```bash
curl -X POST https://kung-fu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 3.4 Réponse Attendue ✅
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@gym.com",
    "role": "admin"
  }
}
```

### 3.5 Sauvegarder le Token
```bash
# Extraire et sauvegarder le token
TOKEN=$(curl -s -X POST https://kung-fu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.token')

echo "Token: $TOKEN"
```

---

## 👥 Test 4: CRUD Membres

### 4.1 Créer un Membre
```bash
curl -X POST https://kung-fu-backend.onrender.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "77 123 45 67",
    "discipline": "Boxe",
    "age": 25,
    "address": "Dakar, Plateau",
    "license_number": "BOX2024001",
    "license_status": "Actif",
    "license_expiry": "2025-01-15",
    "join_date": "2024-01-15"
  }'
```

### 4.2 Lister les Membres
```bash
curl https://kung-fu-backend.onrender.com/api/members \
  -H "Authorization: Bearer $TOKEN"
```

### 4.3 Réponse Attendue ✅
```json
[
  {
    "id": "M001",
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "77 123 45 67",
    "discipline": "Boxe",
    "age": 25,
    "active": true,
    "created_at": "2024-01-01T12:00:00.000Z"
  }
]
```

---

## 💳 Test 5: CRUD Paiements

### 5.1 Créer un Paiement
```bash
curl -X POST https://kung-fu-backend.onrender.com/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "member_id": "M001",
    "amount": 25000,
    "type": "mensualité",
    "date": "2024-01-15",
    "status": "payé",
    "payment_method": "Orange Money",
    "notes": "Mensualité Janvier 2024"
  }'
```

### 5.2 Lister les Paiements
```bash
curl https://kung-fu-backend.onrender.com/api/payments \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Test 6: Base de Données TiDB

### 6.1 Test Connexion Directe
```bash
# Script de test Node.js
node -e "
const mysql = require('mysql2/promise');
const config = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'votre_username_tidb',
  password: 'votre_password_tidb',
  database: 'sportgym_db',
  ssl: { rejectUnauthorized: false }
};

mysql.createConnection(config)
  .then(conn => {
    console.log('✅ TiDB connection successful');
    return conn.query('SELECT COUNT(*) as count FROM members');
  })
  .then(([rows]) => {
    console.log('✅ Members count:', rows[0].count);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ TiDB connection failed:', err.message);
    process.exit(1);
  });
"
```

### 6.2 Validation Tables
```bash
# Vérifier que les tables existent
curl -X POST https://kung-fu-backend.onrender.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test User","email":"test@email.com"}' \
  && echo "✅ Tables existent"
```

---

## 🌐 Test 7: Frontend Integration

### 7.1 Configuration Frontend
```env
# Dans frontend/.env.production
VITE_API_URL=https://kung-fu-backend.onrender.com/api
```

### 7.2 Test JavaScript Frontend
```javascript
// test-backend.js - Exécuter dans le navigateur ou Node.js
const API_URL = 'https://kung-fu-backend.onrender.com/api';

async function testBackendIntegration() {
  console.log('🔍 Testing backend integration...');
  
  try {
    // Test health
    const health = await fetch(`${API_URL}/health`);
    const healthData = await health.json();
    console.log('✅ Health check:', healthData);
    
    // Test API endpoints
    const api = await fetch(API_URL);
    const apiData = await api.json();
    console.log('✅ API endpoints:', apiData);
    
    // Test CORS
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Origin': 'https://kung-fu-frontend.vercel.app' }
    });
    
    if (response.ok) {
      console.log('✅ CORS configured correctly');
    } else {
      console.log('❌ CORS issue detected');
    }
    
  } catch (error) {
    console.error('❌ Backend integration failed:', error.message);
  }
}

testBackendIntegration();
```

### 7.3 Test depuis le Frontend
```bash
# Déployer le frontend et tester
cd ../frontend
npm run build
npm run preview

# Ouvrir http://localhost:4173 et vérifier la console
```

---

## 🔍 Test 8: CORS Validation

### 8.1 Test CORS Headers
```bash
curl -H "Origin: https://kung-fu-frontend.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  https://kung-fu-backend.onrender.com/api/health
```

### 8.2 Headers Attendus ✅
```
Access-Control-Allow-Origin: https://kung-fu-frontend.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📈 Test 9: Performance et Charge

### 9.1 Test de Charge
```bash
# Test 10 requêtes simultanées
for i in {1..10}; do
  curl -s https://kung-fu-backend.onrender.com/api/health &
done
wait

# Test avec mesure de temps
time curl https://kung-fu-backend.onrender.com/api/health
```

### 9.2 Monitoring Temps Réel
```bash
# Surveillance continue
watch -n 2 'curl -s https://kung-fu-backend.onrender.com/api/health | jq .'
```

---

## ✅ Checklist Validation Finale

### Backend Status ✅
- [ ] `/api/health` retourne `{"status":"OK"}`
- [ ] `/api` liste tous les endpoints
- [ ] Authentification fonctionne (register/login)
- [ ] CRUD membres fonctionne
- [ ] CRUD paiements fonctionne
- [ ] Logs Render montrent connexion TiDB réussie
- [ ] Aucune erreur 500 dans les logs

### Frontend Integration ✅
- [ ] `VITE_API_URL` configuré correctement
- [ ] Appels API depuis frontend fonctionnent
- [ ] Pas d'erreurs CORS dans console navigateur
- [ ] Données s'affichent correctement
- [ ] Authentification frontend-backend fonctionne

### Performance ✅
- [ ] Temps réponse < 2 secondes
- [ ] Pas de timeout
- [ ] Charge supportée (10+ requêtes simultanées)
- [ ] Mémoire stable sur Render

---

## 🚨 Actions si Tests Échouent

### Health Check Échoue
1. Vérifier les logs Render
2. Confirmer variables d'environnement
3. Redémarrer le service

### Authentification Échoue
1. Vérifier JWT_SECRET
2. Créer utilisateur admin manuellement
3. Tester avec curl d'abord

### CORS Errors
1. Vérifier FRONTEND_URL exacte
2. Ajouter l'URL dans les variables Render
3. Redéployer après modification

### TiDB Connection Échoue
1. Vérifier credentials TiDB
2. Tester connexion avec client MySQL
3. Recréer utilisateur TiDB

---

🎯 **Une fois tous les tests passés avec succès, votre backend est parfaitement opérationnel !**
