const prisma = require('../db/prismaClient');
const { body, validationResult } = require('express-validator');

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
    // TODO: should throw ValidationError
    return res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  }

  next();
}

const checkIfCredentialsUnused = async (req, res, next) => {
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
    // TODO: should throw and catch in error handler
    const property = existingUser.email === email ? 'email' : 'username';
    return res.status(409).json({
      status: 'error',
      message: `${property} already in use`,
    });
  }

  next();
}

const createUser = async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    passwordConfirm
  } = req.body;

  // TODO: validation
  // TODO: check if user exists
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
}

const createUserChain = [
  validateUserCreation,
  handleValidationErrors,
  checkIfCredentialsUnused,
  createUser,
  // TODO: add async handler
];


const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username, }
  });
  if (!user) {
    return res.status(401).json({ status: 'Unauthorized', message: 'Incorrect username or password' });
  }

  // TODO: use bcrypt to compare hash
  // TODO: sign jwt token
  const isMatch = user.password === password;
  if (!isMatch) {
    return res.status(401).json({ status: 'Unauthorized', message: 'Incorrect username or password' });
  }

  return res.json({
    status: 'success',
    token: "thisIsToken",
  })
}


const getUser = async (req, res) => {
  // Retrieve user details
}

module.exports = {
  createUserChain,
  login,
  getUser,
}