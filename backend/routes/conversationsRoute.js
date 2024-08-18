const { Router } = require('express');
const passport = require('../config/passport-config');
const controller = require('../controllers/conversationController');
const messageController = require('../controllers/messagesController');

const conversationsRoute = Router();

conversationsRoute.post('/', controller.createNewConversation);

conversationsRoute.get('/',
  passport.authenticate('jwt', { session: false }),
  controller.getConversationsForUser);

conversationsRoute.get('/:id', messageController.getMessages);

module.exports = conversationsRoute;
