const prisma = require('../db/prismaClient');

const createNewConversation = async (req, res) => {
  // Create a new conversation
}


const getConversationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch conversations with their latest messages
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'desc', // Ensure messages are sorted by timestamp
          },
          take: 1, // Only need the latest message
        },
        participants: true, // Include participants if needed
      },
    });

    // Sort conversations based on the latest message timestamp
    conversations.sort((a, b) => {
      const latestMessageA = a.messages[0]?.timestamp || new Date(0); // Default to epoch if no messages
      const latestMessageB = b.messages[0]?.timestamp || new Date(0); // Default to epoch if no messages
      return latestMessageB - latestMessageA; // Newest messages first
    });

    // Send the response
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = {
  createNewConversation,
  getConversationsForUser,
}