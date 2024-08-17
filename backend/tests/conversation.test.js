const conversationController = require('../controllers/conversationController');
const express = require('express');
const app = express();

app.post('/conversations', conversationController.createNewConversation);
app.get('/conversations/:id', conversationController.getConversationWithId);
app.get('/conversations/', conversationController.getConversationsForUser);

// TODO:
it('Silent error', () => {
  expect(true).toBeTruthy();
})