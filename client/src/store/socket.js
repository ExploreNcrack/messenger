import {
  createSocketConnection,
  emitGoOnlineEventToServer,
  emitLogOutEventToServer,
  emitNewMessageToServer,
  emitMessageReadToServer,
} from "./utils/reducerFunctions";

// ACTIONS

const OPEN_SOCKET_CONNECTION = "OPEN_SOCKET_CONNECTION";
const EMIT_GO_ONLINE = "EMIT_GO_ONLINE";
const EMIT_LOG_OUT = "EMIT_LOG_OUT";
const EMIT_NEW_MESSAGE = "EMIT_NEW_MESSAGE";
const EMIT_MESSAGE_READ = "EMIT_MESSAGE_READ";

// ACTION CREATORS

export const openSocketConnection = () => {
  return {
    type: OPEN_SOCKET_CONNECTION,
  };
};

export const emitGoOnline = () => {
  return {
    type: EMIT_GO_ONLINE,
  };
};

export const emitLogOut = () => {
  return {
    type: EMIT_LOG_OUT,
  };
};

export const emitNewMessage = (message, recipientId, sender) => {
  return {
    type: EMIT_NEW_MESSAGE,
    payload: { message, recipientId, sender },
  };
};

export const emitMessageRead = (conversationId, recipientId) => {
  return {
    type: EMIT_MESSAGE_READ,
    payload: { conversationId, recipientId },
  };
};

// REDUCER

const reducer = (state = null, action) => {
  switch (action.type) {
    case OPEN_SOCKET_CONNECTION:
      return createSocketConnection();
    case EMIT_GO_ONLINE:
      return emitGoOnlineEventToServer(state);
    case EMIT_LOG_OUT:
      return emitLogOutEventToServer(state);
    case EMIT_NEW_MESSAGE:
      return emitNewMessageToServer(state, action.payload);
    case EMIT_MESSAGE_READ:
      return emitMessageReadToServer(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
