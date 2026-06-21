const express = require('express');
const fs = require('fs');
const path = require('path');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const localSettingsPath = path.join(__dirname, '../utils/admin_settings.json');

const getDefaultSettings = () => ({
  theme_accent: 'purple',
  notif_registrations: true,
  notif_submissions: true,
  notif_alerts: true,
  notif_uploads: true,
  subscription_monthly: 299,
  subscription_yearly: 2499,
  subject_prices_monthly: {
    Telugu: 30,
    Hindi: 30,
    English: 30,
    Maths: 50,
    Physics: 40,
    Chemistry: 40,
    Biology: 40,
    Social: 39
  },
  subject_prices_yearly: {
    Telugu: 250,
    Hindi: 250,
    English: 250,
    Maths: 450,
    Physics: 350,
    Chemistry: 350,
    Biology: 350,
    Social: 199
  }
});

const readSettings = () => {
  try {
    if (!fs.existsSync(localSettingsPath)) {
      const defaultSettings = getDefaultSettings();
      fs.writeFileSync(localSettingsPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = fs.readFileSync(localSettingsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read local settings, falling back to defaults:', err);
    return getDefaultSettings();
  }
};

const writeSettings = (settings) => {
  try {
    // Ensure the parent directory exists
    const dir = path.dirname(localSettingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localSettingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write local settings:', err);
    return false;
  }
};

// GET /api/admin/settings
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // 1. Attempt to fetch from Supabase 'admin_settings' table
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1);

    const localSettings = readSettings();
    if (error || !data || data.length === 0) {
      return res.json(localSettings);
    }

    // Merge Supabase values with local/default structures to support subject_prices
    const mergedSettings = {
      ...getDefaultSettings(),
      ...localSettings,
      ...data[0],
      subject_prices_monthly: data[0].subject_prices_monthly ?? localSettings.subject_prices_monthly ?? getDefaultSettings().subject_prices_monthly,
      subject_prices_yearly: data[0].subject_prices_yearly ?? localSettings.subject_prices_yearly ?? getDefaultSettings().subject_prices_yearly
    };
    res.json(mergedSettings);
  } catch (err) {
    const settings = readSettings();
    res.json(settings);
  }
});

// PUT /api/admin/settings
router.put('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { 
      theme_accent, 
      notif_registrations, 
      notif_submissions, 
      notif_alerts, 
      notif_uploads,
      subscription_monthly,
      subscription_yearly,
      subject_prices_monthly,
      subject_prices_yearly
    } = req.body;

    const settings = {
      theme_accent: theme_accent || 'purple',
      notif_registrations: notif_registrations !== undefined ? notif_registrations : true,
      notif_submissions: notif_submissions !== undefined ? notif_submissions : true,
      notif_alerts: notif_alerts !== undefined ? notif_alerts : true,
      notif_uploads: notif_uploads !== undefined ? notif_uploads : true,
      subscription_monthly: subscription_monthly !== undefined ? Number(subscription_monthly) : 299,
      subscription_yearly: subscription_yearly !== undefined ? Number(subscription_yearly) : 2499,
      subject_prices_monthly: subject_prices_monthly || getDefaultSettings().subject_prices_monthly,
      subject_prices_yearly: subject_prices_yearly || getDefaultSettings().subject_prices_yearly
    };

    // 1. Update the local JSON file first (guarantees local sync)
    writeSettings(settings);

    // 2. Attempt to save to Supabase 'admin_settings' table if it exists
    try {
      const { data: existing, error: existError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1);

      if (!existError) {
        if (existing && existing.length > 0) {
          const { error: updateError } = await supabase
            .from('admin_settings')
            .update(settings)
            .eq('id', existing[0].id);
            
          if (updateError) console.warn('Supabase settings update failed:', updateError.message);
        } else {
          const { error: insertError } = await supabase
            .from('admin_settings')
            .insert([settings]);
            
          if (insertError) console.warn('Supabase settings insert failed:', insertError.message);
        }
      } else {
        console.warn('Supabase admin_settings table not found or inaccessible, relying on local sync fallback.');
      }
    } catch (dbErr) {
      console.warn('Supabase database operation failed, relying on local sync fallback:', dbErr.message);
    }

    res.json({ message: 'Settings saved successfully', settings });
  } catch (err) {
    res.status(550).json({ error: err.message });
  }
});

module.exports = router;
