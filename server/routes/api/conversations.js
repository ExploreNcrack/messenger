const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
// TODO: for scalability, implement lazy loading
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "user1UnreadMessageCount", "user2UnreadMessageCount"],
      include: [
        { model: Message,  },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
      order: [["updatedAt", "DESC"], [Message, "createdAt", "ASC"]],
    });
    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.unReadMessageCount = convoJSON.user2UnreadMessageCount;
        convoJSON.otherUserUnReadMessageCount = convoJSON.user1UnreadMessageCount;
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.unReadMessageCount = convoJSON.user1UnreadMessageCount;
        convoJSON.otherUserUnReadMessageCount = convoJSON.user2UnreadMessageCount;
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (convoJSON.otherUser.id in onlineUsers) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }
      // set properties for notification count and latest message preview
      convoJSON.latestMessageText = convoJSON.messages[convoJSON.messages.length - 1].text;
      // set properties for rendering other user message read
      const userMessages = convoJSON.messages.filter((message) => message.senderId === userId);
      if (convoJSON.otherUserUnReadMessageCount < userMessages.length) {
        const otherUserLastMessageReadPosition = userMessages.length-1-convoJSON.otherUserUnReadMessageCount;
        userMessages[otherUserLastMessageReadPosition].renderOtherUserMessageRead = true;
      }
      conversations[i] = convoJSON;
    }

    res.cookie("csrfToken", req.csrfToken(), { expires: new Date(Date.now() + 864000), });
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// update a conversation's messages unread count to 0
router.put("/:conversationId", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { conversationId } = req.params;
    const conversation = await Conversation.isPartOfThisConversation(conversationId, req.user.id);
    if (!conversation) {
      return res.sendStatus(403);
    }
    if (conversation.user1Id === req.user.id) {
      await conversation.update({ user1UnreadMessageCount: "0" }, {
        silent: true
      });
    } else {
      await conversation.update({ user2UnreadMessageCount: "0" }, {
        silent: true
      });
    }
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
