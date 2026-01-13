/**
 * SESSION 33 - Web-App Login Verification Test
 * 
 * Tests the full login flow:
 * 1. Backend API login
 * 2. Frontend login page accessibility
 * 3. Authentication service response
 */

const http = require('http');
const https = require('https');

console.log('\n🧪 SESSION 33 - WEB-APP LOGIN VERIFICATION TEST\n');
console.log('=' .repeat(60));

// Test 1: Backend API Login
async function testBackendLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'daniel@quty.co.id',
      password: 'Password123!'
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('\n📍 TEST 1: Backend API Login');
    console.log(`   URL: http://localhost:8000/api/v1/auth/login`);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.success) {
            console.log(`   ✅ PASS - Status: ${res.statusCode}`);
            console.log(`   ✅ User: ${response.data.user.full_name}`);
            console.log(`   ✅ Role: ${response.data.user.roles[0].name}`);
            console.log(`   ✅ Token: ${response.data.access_token.substring(0, 30)}...`);
            resolve({ success: true, token: response.data.access_token });
          } else {
            console.log(`   ❌ FAIL - Status: ${res.statusCode}`);
            console.log(`   ❌ Message: ${response.message || 'Unknown error'}`);
            resolve({ success: false, error: response.message });
          }
        } catch (err) {
          console.log(`   ❌ FAIL - Invalid JSON response`);
          console.log(`   ❌ Error: ${err.message}`);
          resolve({ success: false, error: err.message });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ FAIL - Connection error`);
      console.log(`   ❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

// Test 2: Web-App Frontend Accessibility
async function testFrontendAccessibility() {
  return new Promise((resolve) => {
    console.log('\n📍 TEST 2: Web-App Frontend Accessibility');
    console.log(`   URL: http://localhost:5173/login`);

    const req = http.request({
      hostname: 'localhost',
      port: 5173,
      path: '/login',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ✅ PASS - Login page accessible (Status: ${res.statusCode})`);
        resolve({ success: true });
      } else {
        console.log(`   ❌ FAIL - Unexpected status: ${res.statusCode}`);
        resolve({ success: false });
      }
    });

    req.on('error', (err) => {
      console.log(`   ❌ FAIL - Cannot reach frontend server`);
      console.log(`   ❌ Error: ${err.message}`);
      console.log(`   💡 Hint: Is Vite dev server running on port 5173?`);
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

// Test 3: Health Check API Gateway
async function testAPIGateway() {
  return new Promise((resolve) => {
    console.log('\n📍 TEST 3: API Gateway Health');
    console.log(`   URL: http://localhost:8000/health`);

    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ PASS - API Gateway healthy (Status: ${res.statusCode})`);
          resolve({ success: true });
        } else {
          console.log(`   ❌ FAIL - Unhealthy status: ${res.statusCode}`);
          resolve({ success: false });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ FAIL - API Gateway unreachable`);
      console.log(`   ❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.end();
  });
}

// Run all tests
(async () => {
  const results = {
    backend: await testBackendLogin(),
    frontend: await testFrontendAccessibility(),
    gateway: await testAPIGateway()
  };

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');

  const totalTests = 3;
  const passedTests = [results.backend, results.frontend, results.gateway]
    .filter(r => r.success).length;

  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Backend API:  ${results.backend.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Frontend:     ${results.frontend.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   API Gateway:  ${results.gateway.success ? '✅ PASS' : '❌ FAIL'}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Web-app login is ready to use.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open browser: http://localhost:5173/login');
    console.log('   2. Login with: daniel@quty.co.id / Password123!');
    console.log('   3. Check browser console for [WEB-APP-LOGIN-V2] logs');
    console.log('   4. Verify successful redirect to dashboard');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Check errors above');
    
    if (!results.backend.success) {
      console.log('\n🔧 Backend Fix:');
      console.log('   - Check if auth-service container is running');
      console.log('   - Verify database has daniel@quty.co.id user');
      console.log('   - Check auth-service logs: docker-compose logs auth-service');
    }
    
    if (!results.frontend.success) {
      console.log('\n🔧 Frontend Fix:');
      console.log('   - Start Vite dev server: npx vite --port 5173');
      console.log('   - Check if port 5173 is available');
      console.log('   - Look for compile errors in terminal');
    }
    
    if (!results.gateway.success) {
      console.log('\n🔧 Gateway Fix:');
      console.log('   - Check if api-gateway container is running');
      console.log('   - Verify docker-compose is up: docker-compose ps');
      console.log('   - Restart gateway: docker-compose restart api-gateway');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(passedTests === totalTests ? 0 : 1);
})();
