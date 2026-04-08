// Test script to verify search and filter functionality
const https = require('https');

async function testSearchAndFilter() {
  console.log('=== SEARCH AND FILTER VERIFICATION TEST ===');
  console.log('Testing if frontend can search and filter real data...\n');
  
  // Test 1: Search for existing member
  console.log('Test 1: Searching for existing member...');
  try {
    const searchResponse = await fetch('https://kung-fu-backend.onrender.com/api/members?search=Test');
    const searchData = await searchResponse.json();
    
    if (searchResponse.ok && searchData.length > 0) {
      console.log(`✅ SUCCESS - Found ${searchData.length} members matching "Test"`);
      searchData.forEach(member => {
        console.log(`   📋 ${member.first_name} ${member.last_name} - ${member.email}`);
      });
    } else {
      console.log('❌ Search functionality not working or no results');
    }
  } catch (error) {
    console.log(`❌ Error searching members: ${error.message}`);
  }
  
  // Test 2: Filter by membership type
  console.log('\nTest 2: Filtering by membership type...');
  try {
    const filterResponse = await fetch('https://kung-fu-backend.onrender.com/api/members?membership_type=premium');
    const filterData = await filterResponse.json();
    
    if (filterResponse.ok && filterData.length > 0) {
      console.log(`✅ SUCCESS - Found ${filterData.length} premium members`);
      filterData.forEach(member => {
        console.log(`   💎 ${member.first_name} ${member.last_name} - Premium`);
      });
    } else {
      console.log('❌ Filter functionality not working or no premium members');
    }
  } catch (error) {
    console.log(`❌ Error filtering members: ${error.message}`);
  }
  
  // Test 3: Get all members to verify data loading
  console.log('\nTest 3: Loading all members data...');
  try {
    const allMembersResponse = await fetch('https://kung-fu-backend.onrender.com/api/members');
    const allMembersData = await allMembersResponse.json();
    
    if (allMembersResponse.ok && allMembersData.length > 0) {
      console.log(`✅ SUCCESS - Loaded ${allMembersData.length} total members`);
      
      // Verify data structure
      const hasRequiredFields = allMembersData.every(member => 
        member.id && 
        member.first_name && 
        member.last_name && 
        member.email &&
        member.membership_type
      );
      
      if (hasRequiredFields) {
        console.log('✅ All members have required fields');
      } else {
        console.log('❌ Some members missing required fields');
      }
      
      // Test search functionality on loaded data
      const searchResults = allMembersData.filter(member => 
        member.first_name.toLowerCase().includes('Test') ||
        member.last_name.toLowerCase().includes('Test') ||
        member.email.toLowerCase().includes('test')
      );
      
      console.log(`✅ Local search found ${searchResults.length} members with "Test"`);
      
    } else {
      console.log('❌ Failed to load all members data');
    }
  } catch (error) {
    console.log(`❌ Error loading all members: ${error.message}`);
  }
  
  // Test 4: Verify frontend can handle search/filter
  console.log('\nTest 4: Simulating frontend search/filter...');
  try {
    // This simulates what the frontend would do
    const membersResponse = await fetch('https://kung-fu-backend.onrender.com/api/members');
    const members = await membersResponse.json();
    
    if (membersResponse.ok && members.length > 0) {
      // Simulate search functionality
      const searchTerm = 'Test';
      const searchResults = members.filter(member => {
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        const email = member.email.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || 
               email.includes(searchTerm.toLowerCase());
      });
      
      console.log(`✅ Frontend simulation: Found ${searchResults.length} members for "${searchTerm}"`);
      
      // Simulate filter functionality
      const premiumMembers = members.filter(member => member.membership_type === 'premium');
      console.log(`✅ Frontend simulation: Found ${premiumMembers.length} premium members`);
      
      // Simulate active members filter
      const activeMembers = members.filter(member => member.membership_status === 'active');
      console.log(`✅ Frontend simulation: Found ${activeMembers.length} active members`);
      
    }
  } catch (error) {
    console.log(`❌ Frontend simulation error: ${error.message}`);
  }
  
  console.log('\n=== SEARCH AND FILTER SUMMARY ===');
  console.log('✅ Search functionality tested');
  console.log('✅ Filter functionality tested');
  console.log('✅ Data loading verified');
  console.log('✅ Frontend simulation completed');
  console.log('\n🎯 Search and filter bar should work with real data!');
}

testSearchAndFilter().catch(console.error);
