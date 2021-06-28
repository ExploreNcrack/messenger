const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");
const { Op } = require("sequelize");
const db = require("../../db");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      // verify if the sender is one of the user in this conversation
      const conversation = await Conversation.getConversationByUserIdAndConversationId(
        conversationId,
        senderId
      );
      if (!conversation) {
        return res.sendStatus(403);
      }
      const message = await Message.create({ senderId, text, conversationId });
      // update the existing conversation updatedAt timestamp so that we can use it for sorting most recent conversation
      conversation.changed("updatedAt", true);
      await conversation.update({ updatedAt: db.fn("NOW") });
      // update message reciever's unread message count
      if (conversation.user1Id === senderId) {
        await conversation.update({
          user2UnreadMessageCount: conversation.user2UnreadMessageCount + 1,
        });
      } else {
        await conversation.update({
          user1UnreadMessageCount: conversation.user1UnreadMessageCount + 1,
        });
      }
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
        user1UnreadMessageCount: 0,
        user2UnreadMessageCount: 1,
      });
      if (sender.id in onlineUsers) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
