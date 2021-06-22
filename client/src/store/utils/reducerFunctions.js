import io from "socket.io-client";
import store from "../../store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  setConversationUnreadMessageCount,
  resetOtherUserConversationUnreadMessageCountToZero,
} from "../../store/conversations";
import { emitMessageRead } from "../../store/socket";
import { updateConversationMessageRead } from "./thunkCreators";

export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
      otherUserUnReadMessageCount: 0,
      unReadMessageCount: 0,
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  // find the existing convo
  const existingConvo = state.find(
    (convo) => convo.id === message.conversationId
  );
  const convoCopy = { ...existingConvo };
  // add new message to the convo
  const messages = [...convoCopy.messages];
  convoCopy.messages = [...messages, message];
  // update latest message
  convoCopy.latestMessageText = message.text;
  state = state.filter((convo) => convo.id !== message.conversationId);
  // put this convo to the front of the list
  return [convoCopy, ...state];
};

export const setConversationUnreadMessageCountToStore = (state, payload) => {
  const { conversationId, newCount } = payload;
  return state.map((convo) => {
    if (convo.id === conversationId) {
      return {
        ...convo,
        unReadMessageCount: newCount,
      };
    }
    return convo;
  });
};

export const resetOtherUserConversationUnreadMessageCountToZeroToStore = (
  state,
  payload
) => {
  const { conversationId, userId } = payload;
  return state.map((convo) => {
    if (convo.id === conversationId) {
      // conversation message has read by the other user
      // delete the old message read render pic property
      // update the new message read render pic message position
      const ownMessages = convo.messages.filter(
        (message) => message.senderId === userId
      );
      let newMessages = convo.messages;
      if (ownMessages.length > 0) {
        const newMessageReadId = ownMessages[ownMessages.length - 1].id;
        newMessages = convo.messages.map((message) => {
          if (message.id === newMessageReadId) {
            return {
              ...message,
              renderOtherUserMessageRead: true,
            };
          }
          const newMessage = { ...message };
          delete newMessage.renderOtherUserMessageRead;
          return newMessage;
        });
      }
      return {
        ...convo,
        otherUserUnReadMessageCount: 0,
        messages: newMessages,
      };
    }
    return convo;
  });
};

export const incrementOtherUserConversationUnreadMessageCountToStore = (
  state,
  payload
) => {
  const { conversationId } = payload;
  return state.map((convo) => {
    if (convo.id === conversationId) {
      const newCount = convo.otherUserUnReadMessageCount + 1;
      return {
        ...convo,
        otherUserUnReadMessageCount: newCount,
      };
    }
    return convo;
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  // find the existing convo
  const existingConvo = state.find(
    (convo) => convo.otherUser.id === recipientId
  );
  const convoCopy = { ...existingConvo };
  convoCopy.id = message.conversationId;
  const messages = [...convoCopy.messages];
  convoCopy.messages = [...messages, message];
  convoCopy.latestMessageText = message.text;
  state = state.filter((convo) => convo.otherUser.id !== recipientId);
  // put this convo to the front of the list
  return [convoCopy, ...state];
};

export const createSocketConnection = () => {
  const socket = io(window.location.origin, { withCredentials: true });
  socket.on("connect", () => {
    console.log("connected to server");

    socket.on("add-online-user", (id) => {
      store.dispatch(addOnlineUser(id));
    });

    socket.on("remove-offline-user", (id) => {
      store.dispatch(removeOfflineUser(id));
    });
    socket.on("new-message", async (data) => {
      store.dispatch(setNewMessage(data.message, data.sender));
      const currentUsertId = store.getState().user.id;
      if (currentUsertId !== data.message.senderId) {
        // this is sent from other user
        const currentActiveConversation = store.getState().activeConversation;
        const conversations = store.getState().conversations;
        const conversation = conversations.find(
          (convo) => convo.id === data.message.conversationId
        );
        if (conversation.otherUser.username === currentActiveConversation) {
          // current user is at this conversation
          store.dispatch(
            setConversationUnreadMessageCount(data.message.conversationId, 0)
          );
          await updateConversationMessageRead(conversation.id);
          // tell other user that message has read by emit message read event
          store.dispatch(
            emitMessageRead(conversation.id, conversation.otherUser.id)
          );
        } else {
          // current user is at other conversation
          store.dispatch(
            setConversationUnreadMessageCount(
              data.message.conversationId,
              conversation.unReadMessageCount + 1
            )
          );
        }
      }
    });
    socket.on("message-read", (data) => {
      const currentUsertId = store.getState().user.id;
      if (currentUsertId === data.senderId) {
        // if this is sent from other device, same account user
        store.dispatch(
          setConversationUnreadMessageCount(data.conversationId, 0)
        );
      } else {
        // this is sent from other user
        // reset the conversation other user unread message count
        store.dispatch(
          resetOtherUserConversationUnreadMessageCountToZero(
            data.conversationId,
            currentUsertId
          )
        );
      }
    });
  });
  return socket;
};

export const emitGoOnlineEventToServer = (state) => {
  if (!state) {
    state = createSocketConnection();
  }
  state.emit("go-online");
  return state;
};

export const emitLogOutEventToServer = (state) => {
  state.emit("logout");
  return null;
};

export const emitNewMessageToServer = (state, payload) => {
  const { message, sender, recipientId } = payload;
  state.emit("new-message", {
    message,
    recipientId,
    sender,
  });
  return state;
};

export const emitMessageReadToServer = (state, payload) => {
  const { conversationId, recipientId } = payload;
  state.emit("message-read", {
    conversationId,
    recipientId,
  });
  return state;
};
