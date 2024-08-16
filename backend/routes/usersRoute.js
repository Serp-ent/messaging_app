const { Router } = require('express');
const controller = require('../controllers/userController');

const usersRoute = Router();

app.post('/api/users', controller.createUser);
app.post('/api/auth/login', controller.login);
app.get('/api/users/:id', controller.getUser);


module.exports = usersRoute;