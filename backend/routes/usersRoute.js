const { Router } = require('express');
const controller = require('../controllers/userController');

const usersRoute = Router();

usersRoute.post('/', ...controller.createUserChain);
usersRoute.post('/login', controller.login);
usersRoute.get('/:id', controller.getUser);
usersRoute.get('/', controller.getAllUsers);

module.exports = usersRoute;