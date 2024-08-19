const asyncHandler = require('express-async-handler');
const { BadRequestError, NotFoundError } = require('../error/errors');
const prisma = require('../db/prismaClient');

const getConversationWithUser = asyncHandler(async (req, res) => {
  const otherUserId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    console.log('Searching for private conversation between %d and %d', userId, otherUserId);

    // Fetch all conversations involving the current user
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: 'PRIVATE',
        participants: {
          every: {
            id: {
              in: [userId, otherUserId],
            },
          },
        },
      },
      include: {
        participants: true,
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: 'PRIVATE',
          participants: {
            connect: [{ id: userId }, { id: otherUserId }],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    res.json({ conversationId: conversation.id });
  } catch (error) {
    console.error('Error finding conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const conversationId = parseInt(req.params.id);
  const limit = parseInt(req.query.limit) || 20; // Number of messages per page
  const page = parseInt(req.query.page) || 1; // Page number

  if (isNaN(conversationId) || conversationId < 0) {
    throw new BadRequestError('Invalid conversation ID');
  }

  const cursor = (page - 1) * limit;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: {
          timestamp: 'desc' // Sort messages in descending order to get the latest first
        },
        take: limit,
        skip: cursor,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true
            }
          }
        }
      }
    },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  res.json({
    status: 'success',
    messages: conversation.messages,
    page,
    limit,
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  // Send a new message in a conversation
  const conversationId = parseInt(req.params.id);

  const { content } = req.body;
  // const { from, to, content } = req.body;
  // if (!from || !to || !content) {
  //   throw new BadRequestError('From, to, and content are required');
  // }

  // const [sender, receiver] = await Promise.all([
  //   // TODO: handle parsing int
  //   prisma.user.findUnique({ where: { id: parseInt(from, 10) } }),
  //   prisma.user.findUnique({ where: { id: parseInt(to, 10) } })
  // ]);

  // if (!sender || !receiver) {
  //   const user = (!sender) ? 'Sender' : 'Receiver';
  //   throw new NotFoundError(`${user} not found`);
  // }

  // let conversation = await prisma.conversation.findFirst({
  //   where: {
  //     participants: {
  //       every: {
  //         id: {
  //           in: [parseInt(from, 10), parseInt(to, 10)],
  //         }
  //       }
  //     }
  //   }
  // });

  // if (!conversation) {
  //   // create new conversation if it does not exists
  //   conversation = await prisma.conversation.create({
  //     data: {
  //       participants: {
  //         connect: [
  //           { id: parseInt(from, 10) },
  //           { id: parseInt(to, 10) }
  //         ]
  //       }
  //     }
  //   });
  // }


  // Add the message to the conversation
  const message = await prisma.message.create({
    data: {
      content,
      senderId: req.user.id,
      conversationId: conversationId,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });

  res.status(201).json({ status: 'success', message });
});

module.exports = {
  getMessages,
  sendMessage,
  getConversationWithUser,
}