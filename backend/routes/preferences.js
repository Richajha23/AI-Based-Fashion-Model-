import express from 'express';
import databaseService from '../services/databaseService.js';

const router = express.Router();

// Save preferences
router.post('/', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    const result = await databaseService.savePreferences(userId, preferences);
    res.json(result);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// Get preferences
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = await databaseService.getPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

export default router; 