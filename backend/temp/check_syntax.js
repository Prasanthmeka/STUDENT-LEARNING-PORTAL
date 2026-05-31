require('dotenv').config({ path: '../.env' });
try {
  console.log('Testing import of subscriptionHelper...');
  require('../utils/subscriptionHelper');
  console.log('✅ subscriptionHelper import successful.');

  console.log('Testing import of subscriptions route...');
  require('../routes/subscriptions');
  console.log('✅ subscriptions route import successful.');

  console.log('Testing import of materials route...');
  require('../routes/materials');
  console.log('✅ materials route import successful.');

  console.log('Testing import of videos route...');
  require('../routes/videos');
  console.log('✅ videos route import successful.');

  console.log('Testing import of quizzes route...');
  require('../routes/quizzes');
  console.log('✅ quizzes route import successful.');

  console.log('Testing import of courses route...');
  require('../routes/courses');
  console.log('✅ courses route import successful.');

  console.log('\n🎉 ALL SYNTAX AND IMPORT CHECKS PASSED!');
} catch (err) {
  console.error('❌ Import Failed:', err);
}
