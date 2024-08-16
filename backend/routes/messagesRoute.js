const { Router } = require('express');
const controller = require('../controllers/messagesController');

const messagesRoute = Router();

// Message Routes
app.post('/api/messages', controller.sendMessage);
app.get('/api/conversations/:id/messages', controller.getMessages);

module.exports = messagesRoute;