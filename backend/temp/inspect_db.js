require('dotenv').config({ path: '../.env' });
const supabase = require('../utils/supabase');

async function inspect() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching subscriptions:', error);
    } else {
      console.log('Subscriptions record:', data);
    }
  } catch (err) {
    console.error('Inspection failed:', err);
  }
}

inspect();
