const supabase = require('./supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Creates notifications for all students subscribed to a given subject when a new resource is uploaded.
 * @param {object} params
 * @param {string} params.subject - The subject of the resource (Telugu, Hindi, English, Maths, Physics, Chemistry, Biology, Social).
 * @param {string} params.title - The title of the resource.
 * @param {string} params.resourceType - 'quiz' | 'video' | 'study_material'
 * @param {string} params.resourceId - The ID of the uploaded resource.
 */
async function createUploadNotification({ subject, title, resourceType, resourceId }) {
  if (!subject) {
    console.warn('Cannot create notification: subject is missing');
    return;
  }

  try {
    // 1. Normalize subject capitalization to match the DB
    const subLower = subject.toLowerCase();
    let normSubject = subject;
    if (subLower === 'telugu') normSubject = 'Telugu';
    else if (subLower === 'hindi') normSubject = 'Hindi';
    else if (subLower === 'english') normSubject = 'English';
    else if (subLower === 'maths') normSubject = 'Maths';
    else if (subLower === 'physics') normSubject = 'Physics';
    else if (subLower === 'chemistry') normSubject = 'Chemistry';
    else if (subLower === 'biology') normSubject = 'Biology';
    else if (subLower === 'social' || subLower === 'social studies') normSubject = 'Social';

    // 2. Fetch all active subscriptions containing this subject
    // In PostgREST, we can filter using .contains() on arrays
    const { data: activeSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('student_id')
      .eq('is_active', true)
      .contains('subscribed_subjects', [normSubject]);

    if (error) {
      console.error('Error fetching subscriptions for notifications:', error.message);
      return;
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      console.log(`No active subscriptions found for subject: ${normSubject}`);
      return;
    }

    // Prepare notifications text
    let typeName = 'resource';
    if (resourceType === 'quiz') typeName = 'quiz';
    else if (resourceType === 'video') typeName = 'video';
    else if (resourceType === 'study_material') typeName = 'study material';

    const text = `New ${typeName} uploaded in ${normSubject}: "${title}"`;

    // 3. Build notification records
    const notificationsToInsert = activeSubscriptions.map(sub => ({
      id: uuidv4(),
      student_id: sub.student_id,
      text,
      type: 'info',
      subject: normSubject,
      resource_type: resourceType,
      resource_id: resourceId,
      is_read: false
    }));

    // 4. Insert notifications in bulk
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notificationsToInsert);

    if (insertError) {
      console.error('Error bulk inserting notifications in Supabase:', insertError.message);
    } else {
      console.log(`Created ${notificationsToInsert.length} notifications for new ${resourceType} in ${normSubject}.`);
    }
  } catch (err) {
    console.error('Failed to create upload notifications:', err.message);
  }
}

module.exports = {
  createUploadNotification
};
