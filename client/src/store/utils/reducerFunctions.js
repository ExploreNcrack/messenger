import io from "socket.io-client";
import store from "../../store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
} from "../../store/conversations";

export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  // find the existing convo
  const existingConvo = state.find((convo) => convo.id === message.conversationId);
  const convoCopy = { ...existingConvo };
  // add new message to the convo
  convoCopy.messages.push(message);
  // update latest message
  convoCopy.latestMessageText = message.text;
  state = state.filter((convo) => convo.id !== message.conversationId);
  // put this convo to the front of the list
  return [convoCopy, ...state];
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
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const newConvo = { ...convo };
      newConvo.id = message.conversationId;
      newConvo.messages.push(message);
      newConvo.latestMessageText = message.text;
      return newConvo;
    } else {
      return convo;
    }
  });
};

export const createSocketConnection = () => {
  const socket = io(window.location.origin, { withCredentials: true, });
  socket.on("connect", () => {
  
    socket.on("add-online-user", (id) => {
      store.dispatch(addOnlineUser(id));
    });
  
    socket.on("remove-offline-user", (id) => {
      store.dispatch(removeOfflineUser(id));
    });
    socket.on("new-message", (data) => {
      store.dispatch(setNewMessage(data.message, data.sender));
    });
  });
  return socket;
}

export const emitGoOnlineEventToServer = (state) => {
  if (!state) {
    state = createSocketConnection();
  }
  state.emit("go-online");
  return state;
}

export const emitLogOutEventToServer = (state) => {
  state.emit("logout");
  return null;
}

export const emitNewMessageToServer = (state, payload) => {
  const { message, sender, recipientId } = payload;
  state.emit("new-message", {
    message,
    recipientId,
    sender,
  });
  return state;
}