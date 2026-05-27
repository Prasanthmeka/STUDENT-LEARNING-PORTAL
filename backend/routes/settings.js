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
  notif_uploads: true
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

    if (error || !data || data.length === 0) {
      // Graceful fallback to local JSON file
      const settings = readSettings();
      return res.json(settings);
    }

    res.json(data[0]);
  } catch (err) {
    // Graceful fallback to local JSON file
    const settings = readSettings();
    res.json(settings);
  }
});

// PUT /api/admin/settings
router.put('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { theme_accent, notif_registrations, notif_submissions, notif_alerts, notif_uploads } = req.body;

    const settings = {
      theme_accent: theme_accent || 'purple',
      notif_registrations: notif_registrations !== undefined ? notif_registrations : true,
      notif_submissions: notif_submissions !== undefined ? notif_submissions : true,
      notif_alerts: notif_alerts !== undefined ? notif_alerts : true,
      notif_uploads: notif_uploads !== undefined ? notif_uploads : true
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
