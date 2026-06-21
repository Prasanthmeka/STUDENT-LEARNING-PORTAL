const supabase = require('./supabase');

/**
 * Get all subscribed subjects for a student.
 * Falls back to request headers if not found in the Supabase database.
 * @param {string} studentId - The student's unique user ID.
 * @param {object} headers - The incoming request headers.
 * @returns {Promise<string[]>} An array of capitalized/canonical subject strings.
 */
async function getSubscribedSubjects(studentId, headers = {}) {
  let subscribedSubjects = [];

  // 1. Try to read from Supabase
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('subscribed_subjects')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .limit(1);

    if (!error && data && data.length > 0 && Array.isArray(data[0].subscribed_subjects)) {
      subscribedSubjects = data[0].subscribed_subjects;
    }
  } catch (err) {
    console.error('Error reading subscription from Supabase in helper:', err);
  }

  // 2. Fall back to header if database data is missing
  if (subscribedSubjects.length === 0 && headers && headers['x-subscribed-subjects']) {
    try {
      const parsed = JSON.parse(headers['x-subscribed-subjects']);
      if (Array.isArray(parsed)) {
        subscribedSubjects = parsed;
      }
    } catch (e) {
      console.error('Failed to parse X-Subscribed-Subjects fallback header:', e);
    }
  }

  return subscribedSubjects;
}

/**
 * Check if a student is subscribed to a particular subject.
 * @param {string} studentId - The student's unique user ID.
 * @param {string} subject - The subject name to check.
 * @param {object} headers - The incoming request headers.
 * @returns {Promise<boolean>} True if subscribed, false otherwise.
 */
async function isSubscribedToSubject(studentId, subject, headers = {}) {
  if (!subject) return false;
  const subjects = await getSubscribedSubjects(studentId, headers);
  return subjects.some(s => {
    const sNorm = s.toLowerCase();
    const subNorm = subject.toLowerCase();
    return sNorm === subNorm || 
      ((sNorm === 'social' || sNorm === 'social studies') && (subNorm === 'social' || subNorm === 'social studies'));
  });
}

module.exports = {
  getSubscribedSubjects,
  isSubscribedToSubject
};
