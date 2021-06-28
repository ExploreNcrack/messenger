import React from "react";
import { Box, Badge } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { setConversationUnreadMessageCount } from "../../store/conversations";
import { connect } from "react-redux";
import { emitMessageRead } from "../../store/socket";
import { updateConversationMessageRead } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    paddingRight: 21,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
}));

const Chat = (props) => {
  const classes = useStyles();
  const otherUser = props.conversation.otherUser;

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
    if (conversation && conversation.messages.length > 0) {
      await props.setConversationUnreadMessageCount(conversation.id, 0);
      // emit message read event to other user
      props.emitMessageRead(conversation.id, conversation.otherUser.id);
      // tell backend server to update unread message count for this conversation
      await updateConversationMessageRead(conversation.id);
    }
  };

  return (
    <Box
      onClick={() => handleClick(props.conversation)}
      className={classes.root}
    >
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={props.conversation} />
      <Badge
        color="primary"
        badgeContent={props.conversation.unReadMessageCount}
      ></Badge>
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    setConversationUnreadMessageCount: (conversationId, newCount) => {
      dispatch(setConversationUnreadMessageCount(conversationId, newCount));
    },
    emitMessageRead: (conversationId, recipientId) => {
      dispatch(emitMessageRead(conversationId, recipientId));
    },
    updateConversationMessageRead: (conversationId) => {
      dispatch(updateConversationMessageRead(conversationId));
    },
  };
};

export default connect(null, mapDispatchToProps)(Chat);
