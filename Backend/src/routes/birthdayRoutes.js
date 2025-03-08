const express = require('express');
const router = express.Router();
const Birthday = require('../models/birthday');
const { Op } = require('sequelize');

// POST /api/birthdays - Add a new birthday
router.post('/', async (req, res) => {
    try {
      const { date, wish, location, repeatYearly, userId, fcm_token } = req.body;
  
      if (!date || !userId) {
        console.error('Date and User ID are required.');
        return res.status(400).json({ error: 'Date and User ID are required.' });
      }
  
      // Create the birthday entry
      const newBirthday = await Birthday.create({
        date,
        wish,
        location,
        repeatYearly,
        userId,
        fcm_token, // Store the FCM token
      });
  
      console.log('Birthday added successfully:', newBirthday); // Log success
      res.status(201).json({ message: 'Birthday added successfully!', birthday: newBirthday });
    } catch (error) {
      console.error('Error adding birthday:', error); // Log error
      res.status(500).json({ error: 'Failed to add birthday.' });
    }
  });

// GET /api/birthdays/:userId - Get birthdays for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const birthdays = await Birthday.findAll({
      where: { userId },
      order: [['date', 'ASC']], // Sort by date ascending
    });

    res.status(200).json(birthdays);
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({ error: 'Failed to fetch birthdays.' });
  }
});

// PUT /api/birthdays/:userId - Update a birthday
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, wish, location, repeatYearly } = req.body;

    const birthday = await Birthday.findOne({ where: { userId } });

    if (!birthday) {
      return res.status(404).json({ error: 'Birthday not found.' });
    }

    // Update the birthday
    birthday.date = date || birthday.date;
    birthday.wish = wish || birthday.wish;
    birthday.location = location || birthday.location;
    birthday.repeatYearly = repeatYearly !== undefined ? repeatYearly : birthday.repeatYearly;

    await birthday.save();

    res.status(200).json({ message: 'Birthday updated successfully!', birthday });
  } catch (error) {
    console.error('Error updating birthday:', error);
    res.status(500).json({ error: 'Failed to update birthday.' });
  }
});

// DELETE /api/birthdays/:id - Delete a birthday
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const birthday = await Birthday.findByPk(id);

    if (!birthday) {
      return res.status(404).json({ error: 'Birthday not found.' });
    }

    await birthday.destroy();

    res.status(200).json({ message: 'Birthday deleted successfully!' });
  } catch (error) {
    console.error('Error deleting birthday:', error);
    res.status(500).json({ error: 'Failed to delete birthday.' });
  }
});

module.exports = router;