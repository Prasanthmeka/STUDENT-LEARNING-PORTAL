const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
// Create or Update Subscription (Student)
router.post('/', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const { subscription_type = 'free', plan_name = 'Free Trial', subjects = [] } = req.body;

    // 1. Insert/Update active subscription in Supabase for tracking
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
            created_at: new Date(), // Treat as refreshed/updated start
            plan_name,
            subscribed_subjects: subjects
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
              end_date: end,
              plan_name,
              subscribed_subjects: subjects
            }
          ])
          .select();

        if (!insertError && insertData) {
          subscriptionResult = insertData[0];
        }
      }
    } catch (dbErr) {
      console.warn('Supabase subscription sync failed:', dbErr.message);
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
    // Fetch active subscription from Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = data[0];
    const result = {
      id: subscription.id,
      student_id: subscription.student_id,
      subscription_type: subscription.subscription_type,
      is_active: subscription.is_active,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      active_plan: subscription.plan_name || 'Free Trial',
      subscribed_subjects: subscription.subscribed_subjects || []
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upgrade Subscription (Legacy support)
router.put('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { subscription_type, plan_name = 'Monthly Premium', subjects = [] } = req.body;

    const start = new Date();
    const end = new Date(start);
    if (plan_name === 'Yearly Premium') {
      end.setFullYear(start.getFullYear() + 1);
    } else if (plan_name === 'Monthly Premium') {
      end.setMonth(start.getMonth() + 1);
    } else {
      end.setDate(start.getDate() + 14);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        subscription_type,
        end_date: end,
        created_at: new Date(),
        plan_name,
        subscribed_subjects: subjects
      })
      .eq('id', req.params.subscriptionId)
      .eq('student_id', req.user.id)
      .select();
      
    if (error) {
      return res.status(400).json({ error: error.message });
    }

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
