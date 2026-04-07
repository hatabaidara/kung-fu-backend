// Utiliser le fetch intégré de Node.js (v18+)

const BASE_URL = 'https://kung-fu-backend.onrender.com';

// Test data for realistic scenarios
const testData = {
  auth: {
    register: {
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'Test1234!',
      role: 'member'
    },
    login: {
      username: 'testuser123',
      password: 'Test1234!'
    }
  },
  members: {
    create: {
      id: 'MEM001',
      name: 'Jean Dupont',
      phone: '+33612345678',
      email: 'jean.dupont@example.com',
      discipline: 'Karaté',
      age: 25,
      address: '123 Rue de la République, Paris',
      license_number: 'LIC2024001',
      license_status: 'Actif',
      license_expiry: '2024-12-31',
      join_date: '2024-01-15',
      parent: 'Marie Dupont',
      active: true
    }
  },
  payments: {
    create: {
      member_id: 'MEM001',
      amount: 50.00,
      type: 'mensualité',
      date: '2024-04-07',
      status: 'payé',
      payment_method: 'carte',
      notes: 'Paiement mensuel Avril 2024'
    }
  },
  attendance: {
    checkin: {
      member_id: 'MEM001',
      date: '2024-04-07'
    },
    create: {
      member_id: 'MEM001',
      date: '2024-04-07',
      check_in: '18:00',
      check_out: '19:30',
      status: 'présent',
      notes: 'Bon entraînement'
    }
  },
  announcements: {
    create: {
      title: 'Compétition de Karaté - Samedi 20 Avril',
      content: 'Une compétition interne sera organisée ce samedi. Tous les membres sont invités à participer. Horaires: 9h-17h. Lieu: Dojo principal.',
      type: 'compétition',
      priority: 'haute',
      date: '2024-04-20',
      author: 'Sensei Yamamoto',
      active: true
    }
  }
};

// Routes POST identifiées
const postRoutes = [
  // Routes directes dans server.js
  {
    name: 'Auth Register (Direct)',
    url: `${BASE_URL}/api/auth/register`,
    method: 'POST',
    data: testData.auth.register
  },
  {
    name: 'Auth Login (Direct)',
    url: `${BASE_URL}/api/auth/login`,
    method: 'POST',
    data: testData.auth.login
  },
  {
    name: 'Test Register (Temporary)',
    url: `${BASE_URL}/api/test-register`,
    method: 'POST',
    data: testData.auth.register
  },
  {
    name: 'Test Login (Temporary)',
    url: `${BASE_URL}/api/test-login`,
    method: 'POST',
    data: testData.auth.login
  },
  
  // Routes dans les fichiers de routes
  {
    name: 'Auth Register (Route)',
    url: `${BASE_URL}/api/auth/register`,
    method: 'POST',
    data: testData.auth.register
  },
  {
    name: 'Auth Login (Route)',
    url: `${BASE_URL}/api/auth/login`,
    method: 'POST',
    data: testData.auth.login
  },
  {
    name: 'Create Member',
    url: `${BASE_URL}/api/members`,
    method: 'POST',
    data: testData.members.create
  },
  {
    name: 'Create Payment',
    url: `${BASE_URL}/api/payments`,
    method: 'POST',
    data: testData.payments.create
  },
  {
    name: 'Check-in Attendance',
    url: `${BASE_URL}/api/attendance/checkin`,
    method: 'POST',
    data: testData.attendance.checkin
  },
  {
    name: 'Create Attendance',
    url: `${BASE_URL}/api/attendance`,
    method: 'POST',
    data: testData.attendance.create
  },
  {
    name: 'Create Announcement',
    url: `${BASE_URL}/api/announcements`,
    method: 'POST',
    data: testData.announcements.create
  }
];

async function testRoute(route, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${index + 1}/${postRoutes.length}: ${route.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`📍 URL: ${route.url}`);
  console.log(`📋 Method: ${route.method}`);
  console.log(`📦 Body envoyé:`);
  console.log(JSON.stringify(route.data, null, 2));
  
  try {
    const response = await fetch(route.url, {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(route.data)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    console.log(`\n📊 Status Code: ${response.status} ${response.statusText}`);
    console.log(`📄 Réponse JSON:`);
    console.log(JSON.stringify(responseData, null, 2));
    
    // Extraire le token si disponible
    if (responseData && responseData.token) {
      console.log(`🔑 Token obtenu: ${responseData.token.substring(0, 50)}...`);
      return { success: true, token: responseData.token, data: responseData };
    }
    
    return { success: response.ok, data: responseData };
    
  } catch (error) {
    console.log(`\n❌ Erreur: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllRoutes() {
  console.log('🚀 DÉBUT DES TESTS DES ROUTES POST');
  console.log(`🌐 Backend: ${BASE_URL}`);
  console.log(`📋 ${postRoutes.length} routes POST à tester\n`);
  
  let authToken = null;
  let results = [];
  
  for (let i = 0; i < postRoutes.length; i++) {
    const route = postRoutes[i];
    
    // Créer une copie modifiable pour les routes qui nécessitent une authentification
    let modifiedRoute = { ...route };
    
    if (authToken && (modifiedRoute.url.includes('/members') || modifiedRoute.url.includes('/payments') || modifiedRoute.url.includes('/attendance') || modifiedRoute.url.includes('/announcements'))) {
      modifiedRoute.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
    }
    
    const result = await testRoute(modifiedRoute, i);
    results.push({ ...route, result });
    
    // Extraire le token des routes d'authentification
    if (result.token) {
      authToken = result.token;
    }
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Résumé des résultats
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log(`${'='.repeat(80)}`);
  
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  
  console.log(`✅ Routes réussies: ${successful}/${postRoutes.length}`);
  console.log(`❌ Routes échouées: ${failed}/${postRoutes.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Routes échouées:');
    results.filter(r => !r.result.success).forEach((route, index) => {
      console.log(`  ${index + 1}. ${route.name} - ${route.result.error || 'Status: ' + route.result.status}`);
    });
  }
  
  if (successful > 0) {
    console.log('\n✅ Routes réussies:');
    results.filter(r => r.result.success).forEach((route, index) => {
      console.log(`  ${index + 1}. ${route.name}`);
    });
  }
  
  console.log(`\n🎯 Tests terminés à ${new Date().toISOString()}`);
}

// D'abord tester le health check
async function testHealthCheck() {
  console.log('🏥 Test du Health Check...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log(`✅ Health Check Status: ${response.status}`);
    console.log(`📄 Health Check Response:`);
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Health Check Error: ${error.message}\n`);
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  const healthOk = await testHealthCheck();
  
  if (healthOk) {
    await testAllRoutes();
  } else {
    console.log('❌ Le serveur ne répond pas au health check. Arrêt des tests.');
  }
}

runTests().catch(console.error);
