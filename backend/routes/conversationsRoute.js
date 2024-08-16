const { Router } = require('express');
const controller = require('../controllers/conversationController');

const conversationsRoute = Router();

app.post('/api/conversations', controller.createNewConversation);
app.get('/api/conversations', controller.getConversationsForUser);
app.get('/api/conversations/:id', controller.getConversationWithId);

module.exports = conversationsRoute;