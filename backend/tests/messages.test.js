const prisma = require('../db/prismaClient');
const request = require('supertest');
const express = require('express');
const messageController = require('../controllers/messagesController');
const errorHandler = require('../error/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/messages', messageController.sendMessage);
// app.get('/conversations/:id/messages', controller.getMessages);

app.use(errorHandler);

let user1, user2;

beforeAll(async () => {
  // Create two users for testing
  user1 = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'One',
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123'
    }
  });

  user2 = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'Two',
      username: 'user2',
      email: 'user2@example.com',
      password: 'password456'
    }
  });
});

afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Message" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Conversation" RESTART IDENTITY CASCADE`;
});

describe('POST /messages', () => {
  it('should send a first message between two users', async () => {
    // Create a conversation between user1 and user2
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: user1.id }, { id: user2.id }]
        }
      }
    });
    const conversationId = conversation.id;

    // Send a message
    const response = await request(app)
      .post('/messages')
      .send({
        from: user1.id,
        to: user2.id,
        content: 'Hello from user1'
      })
      .expect(201);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatchObject({
      content: 'Hello from user1',
      senderId: user1.id,
      conversationId: conversationId // Check that the conversation ID matches the created conversation
    });

    // Check if the message is saved in the database
    const message = await prisma.message.findFirst({
      where: {
        content: 'Hello from user1',
        senderId: user1.id,
        conversationId: conversationId
      }
    });

    expect(message).not.toBeNull();
    expect(message.content).toBe('Hello from user1');
    expect(message.senderId).toBe(user1.id);
    expect(message.conversationId).toBe(conversationId);

    // Cleanup: Remove the created conversation and messages
    await prisma.message.deleteMany({
      where: {
        conversationId: conversationId
      }
    });

    await prisma.conversation.delete({
      where: {
        id: conversationId
      }
    });
  });

  it('should create a new conversation if one does not exist', async () => {
    const newUser = await prisma.user.create({
      data: {
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password789'
      }
    });

    const response = await request(app)
      .post('/messages')
      .send({
        from: user1.id,
        to: newUser.id,
        content: 'Hello to new user'
      })
      .expect(201);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatchObject({
      content: 'Hello to new user',
      senderId: user1.id,
      conversationId: expect.any(Number) // Ensure conversationId is present and is a number
    });
  });

  describe('should return 400 if required fields are missing', () => {
    it('If no receiver specified', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          from: user1.id,
          content: 'Missing recipient'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'From, to, and content are required');
    });

    it('if no sender specified', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          to: user1.id,
          content: 'Missing recipient'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'From, to, and content are required');
    });


    it('if no content specified', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          to: user2.id,
          from: user1.id,
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'From, to, and content are required');
    });
  });

  describe('Should return error when user not found', () => {
    it('should return 404 if sender is not found', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          from: 99999, // Non-existent user ID
          to: user2.id,
          content: 'Hello'
        })
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Sender not found');
    });

    it('should return 404 if receiver is not found', async () => {
      const response = await request(app)
        .post('/messages')
        .send({
          from: user1.id,
          to: 99999, // Non-existent user ID
          content: 'Hello'
        })
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Receiver not found');
    });

  });
});