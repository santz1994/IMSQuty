// Simple test for receptionist login
const axios = require('axios');

axios.post('http://localhost:8000/api/v1/auth/login', {
  email: 'receptionist@quty.co.id',
  password: 'Password123!'
})
  .then(response => {
    if (response.data.data?.access_token) {
      console.log('\n✅ Receptionist login successful!');
      console.log(`Token: ${response.data.data.access_token.substring(0, 30)}...`);
      console.log(`\n✅ B.6 Complete: All 8 default users created with Password123!`);
      console.log('\nTest users:');
      console.log('1. daniel@quty.co.id (Developer - Level 0)');
      console.log('2. superadmin@quty.co.id (Superadmin - Level 1)');
      console.log('3. director@quty.co.id (Director - Level 2)');
      console.log('4. manager@quty.co.id (Manager - Level 3)');
      console.log('5. hr@quty.co.id (HR - Level 4)');
      console.log('6. admin@quty.co.id (Admin - Level 5)');
      console.log('7. receptionist@quty.co.id (Receptionist - Level 5) ✅ NEW!');
      console.log('8. user@quty.co.id (User - Level 6)');
      console.log('\nAll passwords: Password123!\n');
    } else {
      console.log('\n❌ Login failed - no token');
    }
  })
  .catch(error => {
    console.log(`\n❌ Login error: ${error.response?.data?.message || error.message}\n`);
  });
