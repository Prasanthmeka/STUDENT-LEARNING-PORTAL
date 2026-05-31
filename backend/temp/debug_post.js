require('dotenv').config({ path: '../.env' });
const express = require('express');
const subscriptionsRouter = require('../routes/subscriptions');

// Mock req and res
const req = {
  user: { id: 'd75de7cf-a099-4ca6-8d03-fad1430ad4a8', role: 'student' },
  body: {
    subscription_type: 'premium',
    plan_name: 'Monthly Premium',
    subjects: ['Telugu', 'English']
  }
};

const res = {
  status: function(code) {
    console.log('Mock res.status called with:', code);
    return this;
  },
  json: function(data) {
    console.log('Mock res.json called with:', data);
    return this;
  }
};

// Extract the route handler for POST '/'
// subscriptionsRouter is an express Router. We can find the handler from stack.
const route = subscriptionsRouter.stack.find(s => s.route && s.route.path === '/');
const handler = route.route.stack[route.route.stack.length - 1].handle;

console.log('Running POST / handler directly...');
handler(req, res, (err) => {
  if (err) {
    console.error('Next called with error:', err);
  } else {
    console.log('Handler finished.');
  }
}).catch(err => {
  console.error('Unhandled Rejection/Error inside handler:', err);
});
