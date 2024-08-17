const { Router } = require('express');
const controller = require('../controllers/userController');

const usersRoute = Router();

usersRoute.post('/api/users', ...controller.createUserChain);
usersRoute.post('/api/auth/login', controller.login);
usersRoute.get('/api/users/:id', controller.getUser);


module.exports = usersRoute;