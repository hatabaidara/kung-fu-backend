// Utiliser le fetch intégré de Node.js (v18+)

const BASE_URL = 'https://kung-fu-backend.onrender.com';

// Test data corrigés pour correspondre au schéma TiDB réel
const testData = {
  members: {
    create: {
      id: 'MEM001',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '+33612345678',
      email: 'jean.dupont@example.com',
      date_of_birth: '1999-01-15',
      membership_type: 'premium',
      membership_status: 'active',
      join_date: '2024-01-15',
      expiry_date: '2024-12-31'
    }
  },
  payments: {
    create: {
      member_id: '1', // ID numérique car member_id est INT dans la DB
      amount: 50.00,
      payment_type: 'membership', // Corrigé: payment_type au lieu de type
      payment_date: '2024-04-07', // Corrigé: payment_date au lieu de date
      status: 'paid', // Corrigé: paid au lieu de payé
      payment_method: 'card',
      description: 'Paiement mensuel Avril 2024' // Corrigé: description au lieu de notes
    }
  },
  attendance: {
    checkin: {
      member_id: '1', // ID numérique
      date: '2024-04-07'
    },
    create: {
      member_id: '1', // ID numérique
      date: '2024-04-07',
      check_in_time: '18:00', // Corrigé: check_in_time au lieu de check_in
      status: 'present' // Corrigé: present au lieu de présent
    }
  },
  announcements: {
    create: {
      title: 'Compétition de Karaté - Samedi 20 Avril',
      content: 'Une compétition interne sera organisée ce samedi. Tous les membres sont invités à participer. Horaires: 9h-17h. Lieu: Dojo principal.',
      type: 'event', // Corrigé: event au lieu de compétition
      priority: 'high', // Corrigé: high au lieu de haute
      date: '2024-04-20',
      author_id: '1', // Corrigé: author_id (INT) au lieu de author (string)
      active: true
    }
  }
};

// Routes POST corrigées
const postRoutes = [
  {
    name: 'Create Member (Fixed)',
    url: `${BASE_URL}/api/members`,
    method: 'POST',
    data: testData.members.create
  },
  {
    name: 'Create Payment (Fixed)',
    url: `${BASE_URL}/api/payments`,
    method: 'POST',
    data: testData.payments.create
  },
  {
    name: 'Check-in Attendance (Fixed)',
    url: `${BASE_URL}/api/attendance/checkin`,
    method: 'POST',
    data: testData.attendance.checkin
  },
  {
    name: 'Create Attendance (Fixed)',
    url: `${BASE_URL}/api/attendance`,
    method: 'POST',
    data: testData.attendance.create
  },
  {
    name: 'Create Announcement (Fixed)',
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
    
    return { success: response.ok, data: responseData, status: response.status };
    
  } catch (error) {
    console.log(`\n❌ Erreur: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllFixedRoutes() {
  console.log('🚀 TEST DES ROUTES POST CORRIGÉES');
  console.log(`🌐 Backend: ${BASE_URL}`);
  console.log(`📋 ${postRoutes.length} routes POST à tester\n`);
  
  let results = [];
  
  for (let i = 0; i < postRoutes.length; i++) {
    const route = postRoutes[i];
    const result = await testRoute(route, i);
    results.push({ ...route, result });
    
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Résumé des résultats
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 RÉSUMÉ DES TESTS CORRIGÉS');
  console.log(`${'='.repeat(80)}`);
  
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  
  console.log(`✅ Routes réussies: ${successful}/${postRoutes.length}`);
  console.log(`❌ Routes échouées: ${failed}/${postRoutes.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Routes échouées:');
    results.filter(r => !r.result.success).forEach((route, index) => {
      console.log(`  ${index + 1}. ${route.name} - Status: ${route.result.status}`);
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
    console.log('📄 Health Check Response:');
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
    await testAllFixedRoutes();
  } else {
    console.log('❌ Le serveur ne répond pas au health check. Arrêt des tests.');
  }
}

runTests().catch(console.error);
