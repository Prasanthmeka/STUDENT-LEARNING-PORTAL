const fs = require('fs');
const path = require('path');
require('dotenv').config();
const supabase = require('../utils/supabase');

async function migrate() {
  const jsonPath = path.join(__dirname, '../../student_subscriptions.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('No local student_subscriptions.json found.');
    return;
  }
  
  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error('Failed to parse student_subscriptions.json:', err.message);
    return;
  }

  console.log(`Found ${Object.keys(data).length} subscriptions to migrate...`);

  for (const [studentId, info] of Object.entries(data)) {
    console.log(`Migrating subscription for student: ${studentId}`);
    
    // Check if subscription exists in Supabase
    const { data: existing, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error(`Error querying Supabase for student ${studentId}:`, error.message);
      continue;
    }

    if (existing && existing.length > 0) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_name: info.active_plan || 'Free Trial',
          subscribed_subjects: info.subscribed_subjects || []
        })
        .eq('id', existing[0].id);
      
      if (updateError) {
        console.error(`Error updating Supabase for student ${studentId}:`, updateError.message);
      } else {
        console.log(`Successfully updated student ${studentId} subscription in Supabase.`);
      }
    } else {
      // Insert a new subscription
      const start = new Date();
      const end = new Date();
      if (info.active_plan === 'Yearly Premium') {
        end.setFullYear(start.getFullYear() + 1);
      } else if (info.active_plan === 'Monthly Premium') {
        end.setMonth(start.getMonth() + 1);
      } else {
        end.setDate(start.getDate() + 14);
      }

      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([
          {
            student_id: studentId,
            subscription_type: info.active_plan !== 'Free Trial' ? 'premium' : 'free',
            plan_name: info.active_plan || 'Free Trial',
            subscribed_subjects: info.subscribed_subjects || [],
            is_active: true,
            start_date: start,
            end_date: end
          }
        ]);
      
      if (insertError) {
        console.error(`Error inserting Supabase for student ${studentId}:`, insertError.message);
      } else {
        console.log(`Successfully created student ${studentId} subscription in Supabase.`);
      }
    }
  }
  console.log('Migration completed successfully.');
}

migrate().catch(err => {
  console.error('Migration crashed:', err);
});
