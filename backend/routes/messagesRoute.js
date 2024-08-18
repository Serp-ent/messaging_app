const { Router } = require('express');
const controller = require('../controllers/messagesController');
const { message } = require('../db/prismaClient');

const messagesRoute = Router();

// Message Routes
messagesRoute.post('/', controller.sendMessage);

module.exports = messagesRoute;