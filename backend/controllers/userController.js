const prisma = require('../db/prismaClient');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { ConflictError, BadRequestError, UnauthorizedError } = require('../error/errors');

const validateUserCreation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 72 }).withMessage('First name must be between 2 and 72 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 72 }).withMessage('Last name must be between 2 and 72 characters'),
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('passwordConfirm')
    .trim()
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  }

  const { username, email, password, passwordConfirm } = req.body;
  if (!username || !email || !password || !passwordConfirm) {
    throw new BadRequestError('Request cannot be empty');
  }

  next();
}

const checkIfCredentialsUnused = asyncHandler(async (req, res, next) => {
  const { username, email } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ]
    }
  });

  if (existingUser) {
    const property = existingUser.email === email ? 'email' : 'username';
    throw new ConflictError(`${property} already in use`);
  }

  next();
});;

const createUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    passwordConfirm
  } = req.body;

  // TODO: hash password
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email,
      password,
    }
  });

  res.status(201).json({
    status: 'success',
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    },
  });
});

const createUserChain = [
  validateUserCreation,
  handleValidationErrors,
  checkIfCredentialsUnused,
  createUser,
  // TODO: add async handler
];


const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new BadRequestError('Please provide username and password');
  }

  const user = await prisma.user.findUnique({
    where: { username, }
  });
  if (!user) {
    throw new UnauthorizedError('Incorrect username or password');
  }

  // TODO: use bcrypt to compare hash
  const isMatch = user.password === password;
  if (!isMatch) {
    throw new UnauthorizedError('Incorrect username or password');
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

  res.json({
    status: 'success',
    token,
  })
});


const getUser = async (req, res) => {
  // Retrieve user details
}

module.exports = {
  createUserChain,
  login,
  getUser,
}