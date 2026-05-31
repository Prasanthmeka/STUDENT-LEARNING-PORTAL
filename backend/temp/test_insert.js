require('dotenv').config({ path: '../.env' });
const supabase = require('../utils/supabase');

async function testInsert() {
  const testSubscribedSubjects = ['Maths', 'Physics'];
  // Let's first try inserting with 'subscribed_subjects'
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([
      {
        student_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        subscription_type: 'premium',
        subscribed_subjects: testSubscribedSubjects
      }
    ]);
  console.log('Insert with subscribed_subjects result:', { data, error });

  // Let's also try 'subjects'
  const { data: data2, error: error2 } = await supabase
    .from('subscriptions')
    .insert([
      {
        student_id: '00000000-0000-0000-0000-000000000000',
        subscription_type: 'premium',
        subjects: testSubscribedSubjects
      }
    ]);
  console.log('Insert with subjects result:', { data2, error2 });
}

testInsert();
