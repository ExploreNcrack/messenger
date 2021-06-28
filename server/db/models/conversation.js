const db = require("../db");
const Message = require("./message");
const Sequelize = require("sequelize");

const Conversation = db.define("conversation", {
  user1UnreadMessageCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  user2UnreadMessageCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Sequelize.Op.or]: [user1Id, user2Id],
      },
      user2Id: {
        [Sequelize.Op.or]: [user1Id, user2Id],
      },
    },
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

// check if this user is actually part of this conversation,  given conversationId and userId
Conversation.getConversationByUserIdAndConversationId = async function (
  conversationId,
  userId
) {
  const conversation = await Conversation.findOne({
    where: {
      id: conversationId,
      [Sequelize.Op.or]: {
        user1Id: userId,
        user2Id: userId,
      },
    },
  });
  return conversation;
};

module.exports = Conversation;
