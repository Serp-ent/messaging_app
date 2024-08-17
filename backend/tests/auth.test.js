const express = require('express');
const prisma = require('../db/prismaClient');
const request = require('supertest');
const passport = require('../config/passport-config');
const userController = require('../controllers/userController');

const app = express();

app.use(passport.initialize());
app.use(express.json());

app.get('/public',
  (req, res) => {
    res.json({ message: 'public resource' });
  }
);

app.get('/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    return res.json({
      message: 'Protected resource',
    });
  }
);

app.post('/login', userController.login);

describe('JWT Authentication', () => {
  let token;

  const user = {
    firstName: 'User1',
    lastName: 'Last1',
    username: 'user1',
    email: 'user1@example.com',
    password: 'Pass123', // In a real scenario, this should be hashed
  }

  beforeAll(async () => {
    // create user
    await prisma.user.create({ data: user });
    const response = await request(app)
      .post('/login')
      .send({ username: user.username, password: user.password })
      .expect(200);

    token = response.body.token;
  })

  afterAll(async () => {
    // delete all records from db
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  })

  it("Should access protected route with valid token", async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Protected resource',
    });
  })

  it('should return 401 on protected route without token', async () => {
    const response = await request(app)
      .get('/protected')
      .expect(401);
  });

  it('should return 401 on protected route with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidToken')
      .expect(401);
  });

  it('Should allow everyone for public resource without authorization', async () => {
    const response = await request(app)
      .get('/public')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'public resource');
  });
});