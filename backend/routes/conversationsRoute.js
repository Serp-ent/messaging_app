const { Router } = require('express');
const passport = require('../config/passport-config');
const controller = require('../controllers/conversationController');
const messageController = require('../controllers/messagesController');
const { message } = require('../db/prismaClient');

const conversationsRoute = Router();

conversationsRoute.post('/', controller.createNewConversation);

conversationsRoute.get('/',
  passport.authenticate('jwt', { session: false }),
  controller.getConversationsForUser);

conversationsRoute.get('/private/:id',
  passport.authenticate('jwt', { session: false }),
  messageController.getConversationNumber);

conversationsRoute.get('/:id', messageController.getMessages);

conversationsRoute.post('/:id',
  passport.authenticate('jwt', { session: false }),
  messageController.sendMessage);

module.exports = conversationsRoute;
