require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('🚀 Starting Student Subscription Isolation Flow Verification...\n');

  try {
    // 1. Generate unique emails for Student A and Student B
    const emailA = `student_a_${Date.now()}@example.com`;
    const emailB = `student_b_${Date.now()}@example.com`;
    const password = 'Password123';

    // 2. Register Student A
    console.log(`[Student A] Registering with: ${emailA}...`);
    const regRespA = await axios.post(`${BASE_URL}/auth/register`, {
      email: emailA,
      password,
      full_name: 'Student Alpha'
    });
    const tokenA = regRespA.data.token;
    const idA = regRespA.data.user.id;
    console.log(`[Student A] Successfully registered. ID: ${idA}\n`);

    // 3. Register Student B
    console.log(`[Student B] Registering with: ${emailB}...`);
    const regRespB = await axios.post(`${BASE_URL}/auth/register`, {
      email: emailB,
      password,
      full_name: 'Student Beta'
    });
    const tokenB = regRespB.data.token;
    const idB = regRespB.data.user.id;
    console.log(`[Student B] Successfully registered. ID: ${idB}\n`);

    // 4. Student A subscribes to Telugu and English
    console.log(`[Student A] Subscribing to: ['Telugu', 'English']...`);
    const checkoutRespA = await axios.post(
      `${BASE_URL}/subscriptions`,
      {
        subscription_type: 'premium',
        plan_name: 'Monthly Premium',
        subjects: ['Telugu', 'English']
      },
      {
        headers: { Authorization: `Bearer ${tokenA}` }
      }
    );
    console.log('[Student A] Checkout response:', checkoutRespA.data.message);
    console.log('[Student A] Saved subscription plan:', checkoutRespA.data.subscription.active_plan);
    console.log('[Student A] Saved subscription subjects:', checkoutRespA.data.subscription.subscribed_subjects, '\n');

    // 5. Student B subscribes to Chemistry and Biology
    console.log(`[Student B] Subscribing to: ['Chemistry', 'Biology']...`);
    const checkoutRespB = await axios.post(
      `${BASE_URL}/subscriptions`,
      {
        subscription_type: 'premium',
        plan_name: 'Yearly Premium',
        subjects: ['Chemistry', 'Biology']
      },
      {
        headers: { Authorization: `Bearer ${tokenB}` }
      }
    );
    console.log('[Student B] Checkout response:', checkoutRespB.data.message);
    console.log('[Student B] Saved subscription plan:', checkoutRespB.data.subscription.active_plan);
    console.log('[Student B] Saved subscription subjects:', checkoutRespB.data.subscription.subscribed_subjects, '\n');

    // 6. Fetch Student A's subscription and verify it is STILL Telugu and English
    console.log(`[Student A] Fetching own active subscription...`);
    const subRespA = await axios.get(
      `${BASE_URL}/subscriptions/my-subscription`,
      {
        headers: { Authorization: `Bearer ${tokenA}` }
      }
    );
    console.log('[Student A] Returned subjects:', subRespA.data.subscribed_subjects);
    console.log('[Student A] Returned plan:', subRespA.data.active_plan);
    
    // Assert Student A has Telugu and English
    const subjectsA = subRespA.data.subscribed_subjects;
    const isAValid = subjectsA.includes('Telugu') && subjectsA.includes('English') && subjectsA.length === 2;
    if (isAValid) {
      console.log('✅ Success! Student A has the correct, isolated subjects.\n');
    } else {
      console.error('❌ Failure! Student A has incorrect subjects:', subjectsA, '\n');
    }

    // 7. Fetch Student B's subscription and verify it is STILL Chemistry and Biology
    console.log(`[Student B] Fetching own active subscription...`);
    const subRespB = await axios.get(
      `${BASE_URL}/subscriptions/my-subscription`,
      {
        headers: { Authorization: `Bearer ${tokenB}` }
      }
    );
    console.log('[Student B] Returned subjects:', subRespB.data.subscribed_subjects);
    console.log('[Student B] Returned plan:', subRespB.data.active_plan);

    // Assert Student B has Chemistry and Biology
    const subjectsB = subRespB.data.subscribed_subjects;
    const isBValid = subjectsB.includes('Chemistry') && subjectsB.includes('Biology') && subjectsB.length === 2;
    if (isBValid) {
      console.log('✅ Success! Student B has the correct, isolated subjects.\n');
    } else {
      console.error('❌ Failure! Student B has incorrect subjects:', subjectsB, '\n');
    }

    // 8. Overall test result
    if (isAValid && isBValid) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED! Student subscription isolation is 100% successful.');
    } else {
      console.error('⚠️ Integration tests failed due to incorrect subscription mapping.');
    }

  } catch (err) {
    console.error('❌ Verification Flow Error:', err.response?.data || err.message);
  }
}

runTest();
