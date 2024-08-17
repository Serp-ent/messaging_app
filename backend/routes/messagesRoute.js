const { Router } = require('express');
const controller = require('../controllers/messagesController');
const { message } = require('../db/prismaClient');

const messagesRoute = Router();

// Message Routes
messagesRoute.post('/api/messages', controller.sendMessage);
messagesRoute.get('/api/conversations/:id/messages', controller.getMessages);

module.exports = messagesRoute;