// Script de diagnostic complet pour les erreurs CRUD
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
      member_id: 1, // ID numérique car member_id est INT dans la DB
      amount: 50.00,
      payment_type: 'membership', // Corrigé: payment_type
      payment_date: '2024-04-07', // Corrigé: payment_date
      status: 'paid', // Corrigé: paid
      payment_method: 'card',
      description: 'Paiement mensuel Avril 2024' // Corrigé: description
    }
  },
  attendance: {
    checkin: {
      member_id: 1, // ID numérique
      date: '2024-04-07'
    },
    create: {
      member_id: 1, // ID numérique
      date: '2024-04-07',
      check_in_time: '18:00', // Corrigé: check_in_time
      status: 'present' // Corrigé: present
    }
  },
  announcements: {
    create: {
      title: 'Compétition de Karaté - Samedi 20 Avril',
      content: 'Une compétition interne sera organisée ce samedi. Tous les membres sont invités à participer. Horaires: 9h-17h. Lieu: Dojo principal.',
      type: 'event', // Corrigé: event
      priority: 'high', // Corrigé: high
      date: '2024-04-20',
      author_id: 1, // Corrigé: author_id (INT)
      active: true
    }
  }
};

async function diagnoseRoute(route, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`DIAGNOSTIC ${index + 1}/4: ${route.name}`);
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
    
    // Analyse détaillée de l'erreur
    if (!response.ok) {
      console.log(`\n🔍 ANALYSE D'ERREUR - ${route.name}`);
      
      if (responseData && responseData.details) {
        console.log(`💡 Détails erreur: ${responseData.details}`);
      }
      
      if (responseData && responseData.error) {
        console.log(`💡 Message erreur: ${responseData.error}`);
      }
      
      // Suggestions de correction basées sur le type d'erreur
      if (responseData.details) {
        const details = responseData.details.toLowerCase();
        
        if (details.includes('column') || details.includes('field') || details.includes('unknown')) {
          console.log(`🛠️ SUGGESTION: Erreur de colonne/champ - vérifier le schéma de la table`);
        }
        
        if (details.includes('duplicate') || details.includes('unique') || details.includes('exists')) {
          console.log(`🛠️ SUGGESTION: Erreur de dupliquation - vérifier les contraintes UNIQUE`);
        }
        
        if (details.includes('constraint') || details.includes('foreign key')) {
          console.log(`🛠️ SUGGESTION: Erreur de contrainte - vérifier les clés étrangères`);
        }
        
        if (details.includes('type') || details.includes('enum') || details.includes('value')) {
          console.log(`🛠️ SUGGESTION: Erreur de type - vérifier les valeurs ENUM`);
        }
        
        if (details.includes('null') || details.includes('not null')) {
          console.log(`🛠️ SUGGESTION: Erreur NULL - vérifier les champs obligatoires`);
        }
      }
    }
    
    return { success: response.ok, data: responseData, status: response.status };
    
  } catch (error) {
    console.log(`\n❌ Erreur réseau: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runDiagnosis() {
  console.log('🔧 DÉBUT DU DIAGNOSTIC COMPLET DES ERREURS CRUD');
  console.log(`🌐 Backend: ${BASE_URL}`);
  console.log(`📋 4 routes POST critiques à diagnostiquer\n`);
  
  // Routes prioritaires pour le diagnostic
  const priorityRoutes = [
    {
      name: 'Create Member (Schema Fixed)',
      url: `${BASE_URL}/api/members`,
      method: 'POST',
      data: testData.members.create
    },
    {
      name: 'Create Payment (Schema Fixed)',
      url: `${BASE_URL}/api/payments`,
      method: 'POST',
      data: testData.payments.create
    },
    {
      name: 'Check-in Attendance (Schema Fixed)',
      url: `${BASE_URL}/api/attendance/checkin`,
      method: 'POST',
      data: testData.attendance.checkin
    },
    {
      name: 'Create Announcement (Schema Fixed)',
      url: `${BASE_URL}/api/announcements`,
      method: 'POST',
      data: testData.announcements.create
    }
  ];
  
  let results = [];
  
  for (let i = 0; i < priorityRoutes.length; i++) {
    const route = priorityRoutes[i];
    const result = await diagnoseRoute(route, i);
    results.push({ ...route, result });
    
    // Pause plus longue entre les requêtes pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Résumé du diagnostic
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 RÉSUMÉ DU DIAGNOSTIC');
  console.log(`${'='.repeat(80)}`);
  
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  
  console.log(`✅ Routes réussies: ${successful}/${priorityRoutes.length}`);
  console.log(`❌ Routes échouées: ${failed}/${priorityRoutes.length}`);
  
  if (failed > 0) {
    console.log('\n🎯 PLAN D\'ACTION CORRECTIF:');
    console.log('1. Attendre le déploiement complet sur Render');
    console.log('2. Consulter les logs Render pour les erreurs détaillées');
    console.log('3. Appliquer les corrections suggérées par le diagnostic');
    console.log('4. Tester à nouveau avec les données corrigées');
  }
  
  console.log(`\n🎯 Diagnostic terminé à ${new Date().toISOString()}`);
  
  return {
    total: priorityRoutes.length,
    successful,
    failed,
    results
  };
}

// Fonction pour vérifier le statut du déploiement
async function checkDeploymentStatus() {
  console.log('🔄 Vérification du statut de déploiement...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/deployment-test`);
    const data = await response.json();
    
    console.log(`📦 Version déployée: ${data.version}`);
    console.log(`📅 Timestamp: ${data.timestamp}`);
    console.log(`🔗 Routes auth disponibles: ${data.authRoutesAvailable}`);
    
    return data;
  } catch (error) {
    console.log(`❌ Erreur vérification déploiement: ${error.message}`);
    return null;
  }
}

// Exécuter le diagnostic complet
async function runCompleteDiagnosis() {
  console.log('🚀 DÉMARRAGE DU DIAGNOSTIC COMPLET\n');
  
  // D'abord vérifier le statut du déploiement
  const deploymentStatus = await checkDeploymentStatus();
  
  if (deploymentStatus) {
    console.log(`\n✅ Déploiement actif: version ${deploymentStatus.version}`);
    
    // Si la version est la plus récente, lancer le diagnostic
    const latestVersion = '41775f4'; // Notre dernière version avec corrections
    
    if (deploymentStatus.version !== latestVersion) {
      console.log(`⏳ Ancienne version détectée (${deploymentStatus.version}), attente de la nouvelle version (${latestVersion})...`);
      
      // Attendre un peu et revérifier
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      const newStatus = await checkDeploymentStatus();
      if (newStatus && newStatus.version === latestVersion) {
        console.log('🎉 Nouvelle version déployée! Lancement du diagnostic...\n');
        await runDiagnosis();
      } else {
        console.log(`⏳ Toujours l'ancienne version: ${newStatus ? newStatus.version : 'inconnue'}`);
      }
    } else {
      console.log('🎉 Version à jour! Lancement du diagnostic...\n');
      await runDiagnosis();
    }
  } else {
    console.log('❌ Impossible de vérifier le statut du déploiement');
  }
}

runCompleteDiagnosis().catch(console.error);
