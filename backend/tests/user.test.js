const userController = require('../controllers/userController');
const express = require('express');
const app = express();
const request = require('supertest');
const errorHandler = require('../error/errorHandler');
const prisma = require('../db/prismaClient');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/user', userController.createUser);
app.post('/user/login', userController.login);
app.get('/user/:id', userController.getUser);

app.use(errorHandler);

beforeEach(async () => {

})

afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
});

describe('User registration', () => {
  it("Should create a new user successfully", async () => {
    const newUser = {
      firstName: 'testFirstName',
      lastName: 'testLastName',
      username: 'testUsername',
      email: 'test@email.com',
      password: 'password',
      passwordConfirm: 'password',
    }

    const response = await request(app)
      .post('/user')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('user');

    const got = response.body.user;
    const { password, passwordConfirm, ...want } = newUser;

    expect(got).toMatchObject(want);
  })
  it("Should create new another user successfully", async () => {
    const newUser = {
      firstName: 'testFirstName1',
      lastName: 'testLastName1',
      username: 'testUsername1',
      email: 'test1@email.com',
      password: 'password1',
      passwordConfirm: 'password1',
    }

    const response = await request(app)
      .post('/user')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('user');

    const got = response.body.user;
    const { password, passwordConfirm, ...want } = newUser;

    expect(got).toMatchObject(want);
  })

  //  it('should return a 400 status if username or password is missing', async () => {
  //     const incompleteUser = { username: '' };

  //     const response = await request(app)
  //       .post('/user')
  //       .send(incompleteUser);

  //     expect(response.status).toBe(400);
  //     expect(response.body).toHaveProperty('error', 'Username and password are required');
  //   });

  //   it('should return a 409 status if the user already exists', async () => {
  //     const existingUser = { username: 'testuser', password: 'testpass' };

  //     // First registration
  //     await request(app)
  //       .post('/user')
  //       .send(existingUser);

  //     // Attempt to register the same user again
  //     const response = await request(app)
  //       .post('/user')
  //       .send(existingUser);

  //     expect(response.status).toBe(409);
  //     expect(response.body).toHaveProperty('error', 'User already exists');
  //   });
})