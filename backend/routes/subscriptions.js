const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const localSubscriptionsPath = path.join(__dirname, '../../student_subscriptions.json');

// Local storage helper functions
const readLocalSubscriptions = () => {
  try {
    if (!fs.existsSync(localSubscriptionsPath)) {
      return {};
    }
    const data = fs.readFileSync(localSubscriptionsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read local subscriptions:', err);
    return {};
  }
};

const writeLocalSubscriptions = (subs) => {
  try {
    const dir = path.dirname(localSubscriptionsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localSubscriptionsPath, JSON.stringify(subs, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write local subscriptions:', err);
    return false;
  }
};

// Create or Update Subscription (Student)
router.post('/', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const { subscription_type = 'free', plan_name = 'Free Trial', subjects = [] } = req.body;

    // 1. Persist to local JSON file securely under req.user.id
    const subs = readLocalSubscriptions();
    subs[req.user.id] = {
      active_plan: plan_name,
      subscribed_subjects: subjects
    };
    writeLocalSubscriptions(subs);

    // 2. Insert/Update active subscription in Supabase for tracking
    let subscriptionResult;
    const start = new Date();
    const end = new Date(start);
    if (plan_name === 'Yearly Premium') {
      end.setFullYear(start.getFullYear() + 1);
    } else if (plan_name === 'Monthly Premium') {
      end.setMonth(start.getMonth() + 1);
    } else {
      end.setDate(start.getDate() + 14); // 14 days for Free Trial
    }

    try {
      const { data: existing, error: existError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('student_id', req.user.id)
        .eq('is_active', true)
        .limit(1);

      if (!existError && existing && existing.length > 0) {
        // Update existing active subscription
        const { data: updateData, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            subscription_type,
            end_date: end,
            created_at: new Date() // Treat as refreshed/updated start
          })
          .eq('id', existing[0].id)
          .select();

        if (!updateError && updateData) {
          subscriptionResult = updateData[0];
        }
      }

      if (!subscriptionResult) {
        // Create new active subscription
        const { data: insertData, error: insertError } = await supabase
          .from('subscriptions')
          .insert([
            {
              id: uuidv4(),
              student_id: req.user.id,
              subscription_type,
              is_active: true,
              start_date: start,
              end_date: end
            }
          ])
          .select();

        if (!insertError && insertData) {
          subscriptionResult = insertData[0];
        }
      }
    } catch (dbErr) {
      console.warn('Supabase subscription sync failed, relying on local JSON:', dbErr.message);
    }

    // Standardize result structure
    const finalSubscription = {
      id: subscriptionResult?.id || uuidv4(),
      student_id: req.user.id,
      subscription_type,
      is_active: true,
      start_date: subscriptionResult?.start_date || start,
      end_date: subscriptionResult?.end_date || end,
      active_plan: plan_name,
      subscribed_subjects: subjects
    };

    res.status(201).json({ 
      message: 'Subscription created successfully', 
      subscription: finalSubscription 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student's Subscription
router.get('/my-subscription', authenticateToken, async (req, res) => {
  try {
    // 1. Fetch details from local JSON
    const subs = readLocalSubscriptions();
    const localData = subs[req.user.id];

    // 2. Fetch from Supabase
    let dbData = null;
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('student_id', req.user.id)
        .eq('is_active', true)
        .limit(1);

      if (!error && data && data.length > 0) {
        dbData = data[0];
      }
    } catch (dbErr) {
      console.warn('Failed to query Supabase for subscription, using local data');
    }

    if (!localData && !dbData) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Merge and return
    const merged = {
      id: dbData?.id || uuidv4(),
      student_id: req.user.id,
      subscription_type: dbData?.subscription_type || (localData?.active_plan !== 'Free Trial' ? 'premium' : 'free'),
      is_active: true,
      start_date: dbData?.start_date || new Date(),
      end_date: dbData?.end_date || null,
      active_plan: localData?.active_plan || 'Free Trial',
      subscribed_subjects: localData?.subscribed_subjects || []
    };

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upgrade Subscription (Legacy support)
router.put('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { subscription_type, plan_name = 'Monthly Premium', subjects = [] } = req.body;

    const subs = readLocalSubscriptions();
    subs[req.user.id] = {
      active_plan: plan_name,
      subscribed_subjects: subjects
    };
    writeLocalSubscriptions(subs);

    const start = new Date();
    const end = new Date(start);
    if (plan_name === 'Yearly Premium') {
      end.setFullYear(start.getFullYear() + 1);
    } else if (plan_name === 'Monthly Premium') {
      end.setMonth(start.getMonth() + 1);
    } else {
      end.setDate(start.getDate() + 14);
    }

    let dbData = [];
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          subscription_type,
          end_date: end,
          created_at: new Date()
        })
        .eq('id', req.params.subscriptionId)
        .eq('student_id', req.user.id)
        .select();
      
      if (!error && data) {
        dbData = data;
      }
    } catch (dbErr) {}

    res.json({ 
      message: 'Subscription upgraded successfully', 
      subscription: {
        id: req.params.subscriptionId,
        student_id: req.user.id,
        subscription_type,
        is_active: true,
        active_plan: plan_name,
        subscribed_subjects: subjects
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
