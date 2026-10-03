const supabase = require('./supabase');

/**
 * Checks if a student is an active paid subscriber.
 * Free trial students and students with expired plans are NOT paid subscribers.
 * @param {string} studentId - The student's unique user ID.
 * @returns {Promise<boolean>} True if paid subscriber, false otherwise.
 */
async function isPaidSubscriber(studentId) {
  if (!studentId) return false;
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('subscription_type, plan_name, is_active, end_date, subscribed_subjects')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .limit(1);

    if (error || !data || data.length === 0) return false;
    const sub = data[0];

    // Must not be Free Trial or free type
    if (sub.subscription_type === 'free' || sub.plan_name === 'Free Trial') {
      return false;
    }
    // Must be premium subscription type
    if (sub.subscription_type !== 'premium') {
      return false;
    }
    // Must not be expired
    if (sub.end_date && new Date(sub.end_date) < new Date()) {
      return false;
    }
    // Must have at least 1 subscribed subject
    return Array.isArray(sub.subscribed_subjects) && sub.subscribed_subjects.length > 0;
  } catch (err) {
    console.error('Error in isPaidSubscriber check:', err);
    return false;
  }
}

/**
 * Get all paid subscribed subjects for a student.
 * Returns empty array for Free Trial or unsubscribed students.
 * @param {string} studentId - The student's unique user ID.
 * @returns {Promise<string[]>} An array of canonical subject strings.
 */
async function getPaidSubscribedSubjects(studentId) {
  if (!studentId) return [];
  try {
    const isPaid = await isPaidSubscriber(studentId);
    if (!isPaid) return [];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('subscribed_subjects')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .limit(1);

    if (!error && data && data.length > 0 && Array.isArray(data[0].subscribed_subjects)) {
      return data[0].subscribed_subjects;
    }
    return [];
  } catch (err) {
    console.error('Error in getPaidSubscribedSubjects:', err);
    return [];
  }
}

/**
 * Get all subscribed subjects for a student.
 * Falls back to request headers if not found in the Supabase database.
 * Free trial students return an empty array.
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
      .select('subscribed_subjects, plan_name, subscription_type, is_active, end_date')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .limit(1);

    if (!error && data && data.length > 0) {
      const sub = data[0];
      // Free trial or expired accounts have no subscribed subjects for assessments
      if (sub.plan_name === 'Free Trial' || sub.subscription_type === 'free') {
        return [];
      }
      if (sub.end_date && new Date(sub.end_date) < new Date()) {
        return [];
      }
      if (Array.isArray(sub.subscribed_subjects)) {
        subscribedSubjects = sub.subscribed_subjects;
      }
    }
  } catch (err) {
    console.error('Error reading subscription from Supabase in helper:', err);
  }

  // 2. Fall back to header if database data is missing (only for paid plans)
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
  const subjects = await getPaidSubscribedSubjects(studentId);
  return subjects.some(s => {
    const sNorm = s.toLowerCase();
    const subNorm = subject.toLowerCase();
    return sNorm === subNorm || 
      ((sNorm === 'social' || sNorm === 'social studies') && (subNorm === 'social' || subNorm === 'social studies'));
  });
}

module.exports = {
  isPaidSubscriber,
  getPaidSubscribedSubjects,
  getSubscribedSubjects,
  isSubscribedToSubject
};

