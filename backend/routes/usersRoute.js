const { Router } = require('express');
const passport = require('../config/passport-config');
const controller = require('../controllers/userController');
const { BadRequestError, UnauthorizedError } = require('../error/errors');

const usersRoute = Router();

usersRoute.post('/', ...controller.createUserChain);
usersRoute.post('/login', controller.login);
usersRoute.get('/:id', controller.getUser);
usersRoute.put('/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    req.params.id = parseInt(req.params.id, 10);
    if (isNaN(req.params.id)) {
      throw new BadRequestError('incorrect parameter');
    }
    if (req.params.id !== req.user.id) {
      throw new UnauthorizedError();
    }

    next();
  },
  controller.updateUser);
usersRoute.get('/', controller.getAllUsers);

module.exports = usersRoute;