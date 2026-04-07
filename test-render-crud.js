// Test Render CRUD routes after fixes
const BASE_URL = 'https://kung-fu-backend.onrender.com';

// Test data corrigés pour correspondre au schéma TiDB réel
const testData = {
  members: {
    create: {
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
      member_id: 1,
      amount: 50.00,
      payment_type: 'membership',
      payment_date: '2024-04-07',
      status: 'paid',
      payment_method: 'card',
      description: 'Paiement mensuel Avril 2024'
    }
  },
  attendance: {
    checkin: {
      member_id: 1,
      date: '2024-04-07'
    },
    create: {
      member_id: 1,
      date: '2024-04-07',
      check_in_time: '18:00',
      status: 'present'
    }
  },
  announcements: {
    create: {
      title: 'Compétition de Karaté - Samedi 20 Avril',
      content: 'Une compétition interne sera organisée ce samedi. Tous les membres sont invités à participer. Horaires: 9h-17h. Lieu: Dojo principal.',
      type: 'event',
      date: '2024-04-20',
      author_id: 1,
      active: true
    }
  }
};

// Routes POST à tester
const crudRoutes = [
  {
    name: 'Create Member (Final Fix)',
    url: `${BASE_URL}/api/members`,
    method: 'POST',
    data: testData.members.create
  },
  {
    name: 'Create Payment (Final Fix)',
    url: `${BASE_URL}/api/payments`,
    method: 'POST',
    data: testData.payments.create
  },
  {
    name: 'Check-in Attendance (Final Fix)',
    url: `${BASE_URL}/api/attendance/checkin`,
    method: 'POST',
    data: testData.attendance.checkin
  },
  {
    name: 'Create Attendance (Final Fix)',
    url: `${BASE_URL}/api/attendance`,
    method: 'POST',
    data: testData.attendance.create
  },
  {
    name: 'Create Announcement (Final Fix)',
    url: `${BASE_URL}/api/announcements`,
    method: 'POST',
    data: testData.announcements.create
  }
];

async function testRenderCRUDRoute(route, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST RENDER CRUD ROUTE ${index + 1}/5: ${route.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`URL: ${route.url}`);
  console.log(`Method: ${route.method}`);
  console.log('Body envoyé:');
  console.log(JSON.stringify(route.data, null, 2));
  
  const startTime = Date.now();
  
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
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`\nStatus Code: ${response.status} ${response.statusText}`);
    console.log(`Response Time: ${responseTime}ms`);
    console.log('Response JSON:');
    console.log(JSON.stringify(responseData, null, 2));
    
    // Analyse détaillée du résultat
    if (response.ok) {
      console.log('\n✅ SUCCESS - Route fonctionne correctement!');
    } else {
      console.log('\n❌ ERROR - Route échoue');
      if (responseData.details) {
        console.log(`Détails erreur: ${responseData.details}`);
      }
      if (responseData.error) {
        console.log(`Message erreur: ${responseData.error}`);
      }
    }
    
    return {
      success: response.ok,
      status: response.status,
      responseTime,
      data: responseData,
      routeName: route.name
    };
    
  } catch (error) {
    console.log(`\n❌ Erreur réseau: ${error.message}`);
    return {
      success: false,
      error: error.message,
      routeName: route.name
    };
  }
}

async function testAllRenderCRUDRoutes() {
  console.log('DÉMARRAGE DES TESTS CRUD SUR RENDER (VERSION CORRIGÉE)');
  console.log(`Backend: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  // D'abord tester le health check
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health Check Status:', healthResponse.status);
    console.log('Health Check Response:', JSON.stringify(healthData, null, 2));
    
    // Vérifier la version déployée
    if (healthData.message && healthData.message.includes('CRUD fixes loaded')) {
      console.log('✅ Version corrigée déployée sur Render!');
    } else {
      console.log('⏳ Ancienne version encore sur Render...');
    }
  } catch (error) {
    console.log('Health Check Error:', error.message);
    return;
  }
  
  // Tester toutes les routes CRUD
  let results = [];
  
  for (let i = 0; i < crudRoutes.length; i++) {
    const route = crudRoutes[i];
    const result = await testRenderCRUDRoute(route, i);
    results.push(result);
    
    // Pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Résumé final
  console.log('\n' + '='.repeat(80));
  console.log('RÉSUMÉ COMPLET DES TESTS CRUD SUR RENDER');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Routes réussies: ${successful}/${results.length}`);
  console.log(`❌ Routes échouées: ${failed}/${results.length}`);
  
  console.log('\nDétail par route:');
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.routeName}`);
    console.log(`   Status: ${result.status || 'ERROR'}`);
    console.log(`   Response Time: ${result.responseTime || 'N/A'}ms`);
    console.log(`   Success: ${result.success ? 'YES' : 'NO'}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\nTests terminés à ${new Date().toISOString()}`);
  
  return {
    crudResults: results,
    summary: {
      total: results.length,
      successful,
      failed
    }
  };
}

// Démarrer les tests
testAllRenderCRUDRoutes().catch(console.error);
