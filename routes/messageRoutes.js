const express = require('express');
const router = express.Router();
const {
  sendMessage,
  allMessage,
} = require('../controllers/messageControllers');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessage);

module.exports = router;
