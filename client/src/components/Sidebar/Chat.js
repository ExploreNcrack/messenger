import React, { Component } from "react";
import { Box, Badge } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { withStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { setConversationUnreadMessageCount } from "../../store/conversations";
import { connect } from "react-redux";
import { emitMessageRead } from "../../store/socket";
import { updateConversationMessageRead } from "../../store/utils/thunkCreators";

const styles = {
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
};

class Chat extends Component {
  handleClick = async (conversation) => {
    await this.props.setActiveChat(conversation.otherUser.username);
    if (conversation && conversation.messages.length > 0) {
      await this.props.setConversationUnreadMessageCount(conversation.id, 0);
      // emit message read event to other user
      this.props.emitMessageRead(conversation.id, conversation.otherUser.id);
      // tell backend server to update unread message count for this conversation
      await updateConversationMessageRead(conversation.id);
    }
  };

  render() {
    const { classes } = this.props;
    const otherUser = this.props.conversation.otherUser;
    return (
      <Box
        onClick={() => this.handleClick(this.props.conversation)}
        className={classes.root}
      >
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
          sidebar={true}
        />
        <ChatContent conversation={this.props.conversation} />
        <Badge
          color="primary"
          badgeContent={this.props.conversation.unReadMessageCount}
        ></Badge>
      </Box>
    );
  }
}

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

export default connect(null, mapDispatchToProps)(withStyles(styles)(Chat));
