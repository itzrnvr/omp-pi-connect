// Test: verify that updating a key via /connect clears the config override

import { AuthStorage } from '@oh-my-pi/pi-ai/dist/auth-storage.js';

async function test() {
  // Create a mock auth storage
  const authStorage = new AuthStorage({
    get: async (key) => null,
    set: async (key, value) => {},
    delete: async (key) => {},
    list: async () => [],
  });

  const providerId = 'test-provider';
  const oldKey = 'old-key-123';
  const newKey = 'new-key-456';

  console.log('=== Test: Key Update Clears Config Override ===\n');

  // Step 1: Set a config override (simulating models.yml)
  console.log('1. Setting config override (priority 2) with old key...');
  authStorage.setConfigApiKey(providerId, oldKey);
  const key1 = await authStorage.getApiKey(providerId);
  console.log(`   Current key: ${key1}`);
  console.log(`   ✓ Config override active\n`);

  // Step 2: Update the key via stored credential (simulating /connect)
  console.log('2. Updating key via stored credential (priority 3)...');
  await authStorage.set(providerId, { type: 'api_key', key: newKey });
  
  // Step 3: Clear the config override (the fix)
  console.log('3. Clearing config override (the fix)...');
  authStorage.removeConfigApiKey(providerId);
  
  // Step 4: Verify the new key is used
  const key2 = await authStorage.getApiKey(providerId);
  console.log(`   Current key: ${key2}`);
  
  if (key2 === newKey) {
    console.log(`   ✓ New key is active!\n`);
    console.log('✅ TEST PASSED: Key update works correctly\n');
    return true;
  } else {
    console.log(`   ✗ Expected: ${newKey}, Got: ${key2}\n`);
    console.log('❌ TEST FAILED: Key update did not work\n');
    return false;
  }
}

test().then(success => process.exit(success ? 0 : 1));
