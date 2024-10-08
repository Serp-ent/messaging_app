const userController = require('../controllers/userController');
const express = require('express');
const app = express();
const request = require('supertest');
const errorHandler = require('../error/errorHandler');
const prisma = require('../db/prismaClient');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/user', ...userController.createUserChain);
app.post('/user/login', userController.login);
app.get('/user/:id', userController.getUser);
app.get('/user', userController.getAllUsers);

app.use(errorHandler);

describe('User registration', () => {
  beforeEach(async () => {
    // start clean
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    // const user = {
    //   firstName: 'name',
    //   lastName: 'surname',
    //   username: 'username',
    //   email: 'email',
    //   password: 'password',
    // };

    // prisma.user.create({
    //   data: user,
    // });
  })

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  });

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

  it('should return a 409 status if the user username is in use', async () => {
    const existingUser = {
      firstName: 'testFirstName1',
      lastName: 'testLastName1',
      username: 'testUsername1',
      email: 'test1@email.com',
      password: 'password1',
      passwordConfirm: 'password1',
    }

    // First registration
    await request(app)
      .post('/user')
      .send(existingUser);

    existingUser.email = 'unusedEmail@gmail.com';
    // Attempt to register the same user again
    const response = await request(app)
      .post('/user')
      .send(existingUser)
      .expect(409);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'username already in use');
  });
  it('should return a 409 status if the user email is in use', async () => {
    const existingUser = {
      firstName: 'testFirstName1',
      lastName: 'testLastName1',
      username: 'testUsername1',
      email: 'test1@email.com',
      password: 'password1',
      passwordConfirm: 'password1',
    }

    // First registration
    await request(app)
      .post('/user')
      .send(existingUser);


    existingUser.username = 'unusedUsername';
    // Attempt to register the same user again
    const response = await request(app)
      .post('/user')
      .send(existingUser)
      .expect(409);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'email already in use');
  });

  it('should return a 400 status if firstName is too short', async () => {
    const userWithShortFirstName = {
      firstName: 'A',
      lastName: 'lastName',
      username: 'username',
      email: 'test@example.com',
      password: 'password',
      passwordConfirm: 'password',
    };

    const response = await request(app)
      .post('/user')
      .send(userWithShortFirstName)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'First name must be between 2 and 72 characters',
          path: 'firstName',
        })
      ])
    );
  });

  it('should return a 400 status if firstName is too long', async () => {
    const userWithLongFirstName = {
      firstName: 'A'.repeat(73),
      lastName: 'lastName',
      username: 'username',
      email: 'test@example.com',
      password: 'password',
      passwordConfirm: 'password',
    };

    const response = await request(app)
      .post('/user')
      .send(userWithLongFirstName)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'First name must be between 2 and 72 characters',
          path: 'firstName',
        })
      ])
    );
  });

  it('should return a 400 status if email is invalid', async () => {
    const userWithInvalidEmail = {
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'username',
      email: 'invalid-email',
      password: 'password',
      passwordConfirm: 'password',
    };

    const response = await request(app)
      .post('/user')
      .send(userWithInvalidEmail)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Invalid email format',
          path: 'email',
        })
      ])
    );
  });

  it('should return a 400 status if password is too short', async () => {
    const userWithShortPassword = {
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'username',
      email: 'test@example.com',
      password: 'short',
      passwordConfirm: 'short',
    };

    const response = await request(app)
      .post('/user')
      .send(userWithShortPassword)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Password must be at least 6 characters',
          path: 'password',
        })
      ])
    );
  });

  it('should return a 400 status if passwordConfirm is missing', async () => {
    const incompleteUser = {
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'username',
      email: 'test@example.com',
      password: 'password',
    };

    const response = await request(app)
      .post('/user')
      .send(incompleteUser)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Password confirmation is required',
          path: 'passwordConfirm',
        })
      ])
    );
  });


  it('should return a 400 status if password confirmation does not match', async () => {
    const userWithMismatchedPasswords = {
      firstName: 'firstName',
      lastName: 'lastName',
      username: 'username',
      email: 'test@example.com',
      password: 'password1',
      passwordConfirm: 'password2',
    };

    const response = await request(app)
      .post('/user')
      .send(userWithMismatchedPasswords)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Passwords do not match',
          path: 'passwordConfirm',
        })
      ])
    );
  });

  it('should return a 400 status if username or email is missing', async () => {
    const userWithMissingUsername = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'test@example.com',
      password: 'password',
      passwordConfirm: 'password',
    };

    const response = await request(app)
      .post('/user')
      .send(userWithMissingUsername)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Username is required',
          path: 'username',
        })
      ])
    );
  });
})

describe('Login', () => {
  beforeAll(async () => {
    // add user
    await prisma.user.createMany({
      data: [
        {
          firstName: 'User1',
          lastName: 'Last1',
          username: 'user1',
          email: 'user1@example.com',
          password: 'Pass123', // In a real scenario, this should be hashed
        },
        {
          firstName: 'User2',
          lastName: 'Last2',
          username: 'user2',
          email: 'user2@example.com',
          password: 'Pass456', // In a real scenario, this should be hashed
        },
      ],
    });
  })

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  })

  it('Should return token on successful login for first user', async () => {
    const userCredentials = {
      username: 'user1',
      password: 'Pass123'
    };

    const response = await request(app)
      .post('/user/login')
      .send(userCredentials)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token).not.toBe('');
  })

  it('Should return token on successful login for second user', async () => {
    const userCredentials = {
      username: 'user2',
      password: 'Pass456'
    };

    const response = await request(app)
      .post('/user/login')
      .send(userCredentials)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token).not.toBe('');
  })

  it('Should return 400 on empty body', async () => {
    const response = await request(app)
      .post('/user/login')
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Please provide username and password');

  })

  it('Should return 401 for incorrect username', async () => {
    const userCredentials = {
      username: 'incorrectUserName',
      password: 'Pass456'
    };

    const response = await request(app)
      .post('/user/login')
      .send(userCredentials)
      .expect(401);

    expect(response.body).toHaveProperty("status", 'error');
    expect(response.body).toHaveProperty('message', 'Incorrect username or password');
  })

  it('Should return 401 for incorrect password', async () => {
    const userCredentials = {
      username: 'user1',
      password: 'Pass456'
    };

    const response = await request(app)
      .post('/user/login')
      .send(userCredentials)
      .expect(401);

    expect(response.body).toHaveProperty("status", 'error');
    expect(response.body).toHaveProperty('message', 'Incorrect username or password');
  })
});

describe('GET /users', () => {
  let users = [];
  beforeEach(async () => {
    // Create three users for testing
    users = await Promise.all([
      prisma.user.create({
        data: {
          firstName: 'User',
          lastName: 'One',
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123'
        }
      }),
      prisma.user.create({
        data: {
          firstName: 'User',
          lastName: 'Two',
          username: 'user2',
          email: 'user2@example.com',
          password: 'password456'
        }
      }),
      prisma.user.create({
        data: {
          firstName: 'User',
          lastName: 'Three',
          username: 'user3',
          email: 'user3@example.com',
          password: 'password789'
        }
      })
    ]);
  });

  afterEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  })

  describe('Receive all users', () => {
    it('should retrieve all users', async () => {
      const response = await request(app)
        .get('/user')
        .expect(200);

      // TODO: add pagination
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBeTruthy();
      expect(response.body.users).toHaveLength(3);

      expect(response.body.users).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          firstName: 'User',
          lastName: 'One',
          username: 'user1',
          email: 'user1@example.com'
        }),
        expect.objectContaining({
          id: expect.any(Number),
          firstName: 'User',
          lastName: 'Two',
          username: 'user2',
          email: 'user2@example.com'
        }),
        expect.objectContaining({
          id: expect.any(Number),
          firstName: 'User',
          lastName: 'Three',
          username: 'user3',
          email: 'user3@example.com'
        })
      ]));
    });

    it('should return an empty array if no users exist', async () => {
      // Delete all users to ensure the test runs on an empty database
      await prisma.user.deleteMany({});

      const response = await request(app)
        .get('/user')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBeTruthy();
      expect(response.body.users).toHaveLength(0);
    });
  });

  describe('Receive user with given id', () => {
    it('should retrieve a user by ID', async () => {
      const response = await request(app)
        .get(`/user/${users.at(0).id}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('user');

      const { password, ...want } = users.at(0);
      expect(response.body.user).toMatchObject(want);
    });

    it('should retrieve a another user by ID', async () => {
      const response = await request(app)
        .get(`/user/${users.at(1).id}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('user');

      const { password, ...want } = users.at(1);
      expect(response.body.user).toMatchObject(want);
    });

    it('should return 404 for a non-existent user', async () => {
      const nonExistentId = 999999; // an ID that does not exist

      const response = await request(app)
        .get(`/user/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'abc123'; // non-numeric ID

      const response = await request(app)
        .get(`/user/${invalidId}`)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid user ID format');
    });
  });
}) 