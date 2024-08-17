const request = require('supertest');
const express = require('express');
const app = express();
const prisma = require('../db/prismaClient');

// To check if test correctly works
app.get('/hello', (req, res) => {
  res.status(200).send('Hello World!');
});

describe('GET /hello', () => {
  it("Should response with 'hello world", async () => {
    const response = await request(app).get('/hello');
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello World!");
  })
});
