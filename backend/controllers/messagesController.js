const asyncHandler = require('express-async-handler');
const { BadRequestError, NotFoundError } = require('../error/errors');
const prisma = require('../db/prismaClient');

const getMessages = asyncHandler(async (req, res) => {
  const conversationId = parseInt(req.params.id);
  if (isNaN(conversationId) || conversationId < 0) {
    throw new BadRequestError('Invalid conversation ID');
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: true }
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  res.json({
    status: 'success',
    messages: conversation.messages,
  });
})


const sendMessage = asyncHandler(async (req, res) => {
  // Send a new message in a conversation
  const { from, to, content } = req.body;
  if (!from || !to || !content) {
    throw new BadRequestError('From, to, and content are required');
  }

  const [sender, receiver] = await Promise.all([
    // TODO: handle parsing int
    prisma.user.findUnique({ where: { id: parseInt(from, 10) } }),
    prisma.user.findUnique({ where: { id: parseInt(to, 10) } })
  ]);

  if (!sender || !receiver) {
    const user = (!sender) ? 'Sender' : 'Receiver';
    throw new NotFoundError(`${user} not found`);
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          id: {
            in: [parseInt(from, 10), parseInt(to, 10)],
          }
        }
      }
    }
  });

  if (!conversation) {
    // create new conversation if it does not exists
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [
            { id: parseInt(from, 10) },
            { id: parseInt(to, 10) }
          ]
        }
      }
    });
  }


  // Add the message to the conversation
  const message = await prisma.message.create({
    data: {
      content,
      senderId: parseInt(from, 10),
      conversationId: conversation.id,
    }
  });


  res.status(201).json({ status: 'success', message });
});

module.exports = {
  getMessages,
  sendMessage,
}