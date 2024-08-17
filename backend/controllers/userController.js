const prisma = require('../db/prismaClient');

// TODO: add async handler
const createUser = async (req, res) => {
  // Create a new user
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


const login = async (req, res) => {
  // Authenticate a user and return a token
}


const getUser = async (req, res) => {
  // Retrieve user details
}

module.exports = {
  createUser,
  login,
  getUser,
}