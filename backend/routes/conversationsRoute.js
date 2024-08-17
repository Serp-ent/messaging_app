const { Router } = require('express');
const controller = require('../controllers/conversationController');

const conversationsRoute = Router();

conversationsRoute.post('/api/conversations', controller.createNewConversation);
conversationsRoute.get('/api/conversations', controller.getConversationsForUser);
conversationsRoute.get('/api/conversations/:id', controller.getConversationWithId);

module.exports = conversationsRoute;