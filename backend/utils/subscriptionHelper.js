const fs = require('fs');
const path = require('path');

const localSubscriptionsPath = path.join(__dirname, '../../student_subscriptions.json');

/**
 * Get all subscribed subjects for a student.
 * Falls back to request headers if not found in the local JSON database.
 * @param {string} studentId - The student's unique user ID.
 * @param {object} headers - The incoming request headers.
 * @returns {string[]} An array of capitalized/canonical subject strings.
 */
function getSubscribedSubjects(studentId, headers = {}) {
  let subscribedSubjects = [];

  // 1. Try to read from local persistent JSON store
  try {
    if (fs.existsSync(localSubscriptionsPath)) {
      const data = fs.readFileSync(localSubscriptionsPath, 'utf8');
      const subs = JSON.parse(data);
      if (subs[studentId] && Array.isArray(subs[studentId].subscribed_subjects)) {
        subscribedSubjects = subs[studentId].subscribed_subjects;
      }
    }
  } catch (err) {
    console.error('Error reading student_subscriptions.json in helper:', err);
  }

  // 2. Fall back to header if local data is missing
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
 * @returns {boolean} True if subscribed, false otherwise.
 */
function isSubscribedToSubject(studentId, subject, headers = {}) {
  if (!subject) return false;
  const subjects = getSubscribedSubjects(studentId, headers);
  return subjects.some(s => s.toLowerCase() === subject.toLowerCase());
}

module.exports = {
  getSubscribedSubjects,
  isSubscribedToSubject
};
