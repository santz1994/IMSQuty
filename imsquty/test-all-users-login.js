/**
 * Test Login for All 8 Default Users
 * Tests login authentication for all users created by TestUsersSeeder
 * All users should have Password123! password
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Test users from B.6 requirement
const TEST_USERS = [
  { email: 'daniel@quty.co.id', role: 'Developer (Level 0)' },
  { email: 'superadmin@quty.co.id', role: 'Superadmin (Level 1)' },
  { email: 'director@quty.co.id', role: 'Director (Level 2)' },
  { email: 'manager@quty.co.id', role: 'Manager (Level 3)' },
  { email: 'hr@quty.co.id', role: 'HR (Level 4)' },
  { email: 'admin@quty.co.id', role: 'Admin (Level 5)' },
  { email: 'receptionist@quty.co.id', role: 'Receptionist (Level 5)' },
  { email: 'user@quty.co.id', role: 'User (Level 6)' },
];

const PASSWORD = 'Password123!';

async function testLogin(email, role) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password: PASSWORD,
    });

    // Check various possible token locations
    const token = response.data.data?.access_token || response.data.token || response.data.access_token;

    if (token) {
      console.log(`✅ ${role.padEnd(30)} | ${email.padEnd(30)} | Login successful`);
      return true;
    } else {
      console.log(`❌ ${role.padEnd(30)} | ${email.padEnd(30)} | No token found`);
      return false;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.log(`❌ ${role.padEnd(30)} | ${email.padEnd(30)} | Error: ${errorMsg}`);
    return false;
  }
}

async function testAllUsers() {
  console.log('\n🔐 Testing Login for All 8 Default Users');
  console.log('=========================================================\n');
  console.log('Password for all users: Password123!\n');
  console.log('Role'.padEnd(30) + ' | ' + 'Email'.padEnd(30) + ' | Result');
  console.log('-'.repeat(95));

  let successCount = 0;
  let failCount = 0;

  for (const user of TEST_USERS) {
    const success = await testLogin(user.email, user.role);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(95));
  console.log(`\n📊 Test Results: ${successCount}/${TEST_USERS.length} successful`);

  if (failCount === 0) {
    console.log('\n🎉 All users can login successfully! B.6 requirement complete!\n');
  } else {
    console.log(`\n⚠️  ${failCount} user(s) failed to login. Check the errors above.\n`);
  }
}

// Run the tests
testAllUsers().catch(console.error);
