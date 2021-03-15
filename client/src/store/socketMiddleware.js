import openSocket from 'socket.io-client';
import {
  OPEN_SOCKET,
  CREATE_PRIVATE_ROOM,
  JOIN_ROOM,
  LEAVE_A_ROOM,
  UPDATE_ROOM_STORY_DESCRIPTION,
  UPDATE_USER_VOTE,
  SHOW_USER_VOTES,
  SET_ROOM_NEXT_STORY,
} from './actions/types';
import {
  setRoom,
  setRoomLoading,
  setRoomOnPrivateJoin,
  setError as setRoomError,
  setRoomOnUserLeft,
  updateGameState,
} from './actions/room';
import {
  setCurrentUser,
  setUserLoading,
  setError as setUserError,
  setUserOnUserLeft,
  resetCurrentPlayer,
  resetUserVote,
} from './actions/user';

let URL = process.env.SERVER_URL || 'http://localhost:5001';
let socket = null;

const socketMiddleware = (store) => (next) => async (action) => {
  switch (action.type) {
    case OPEN_SOCKET:
      if (socket === null) {
        socket = openSocket(URL, {
          transports: ['websocket'],
          upgrade: false,
        });
        socket.on('private room joined', (data) => {
          store.dispatch(setRoomOnPrivateJoin(data));
        });
        socket.on('user left', (data) => {
          store.dispatch(setRoomOnUserLeft(data));
          store.dispatch(
            setUserOnUserLeft({
              newHost: data.host,
            })
          );
        });
        socket.on('clear current player', () => {
          store.dispatch(resetCurrentPlayer());
        });
        socket.on('in game', (data) => {
          store.dispatch(updateGameState(data));
          if (data && data.gameState === 'set room next story') {
            store.dispatch(resetUserVote());
          }
        });
      }
      break;
    case CREATE_PRIVATE_ROOM:
      if (socket) {
        store.dispatch(setRoomLoading());
        store.dispatch(setUserLoading());
        socket.emit(
          'create private room',
          {
            username: action.payload.username,
            avatarIndex: action.payload.avatarIndex,
          },
          (data) => {
            store.dispatch(setRoom(data));
            store.dispatch(
              setCurrentUser({
                name: data.host,
                isHost: true,
              })
            );
          }
        );
      }
      break;
    case JOIN_ROOM:
      if (socket) {
        store.dispatch(setRoomLoading());
        store.dispatch(setUserLoading());
        socket.emit(
          'join private room',
          {
            username: action.payload.username,
            roomId: action.payload.roomId,
            avatarIndex: action.payload.avatarIndex,
          },
          (data) => {
            if (data.type === 'room error') {
              store.dispatch(
                setRoomError({
                  message: data.message,
                })
              );
            } else if (data.type === 'user error') {
              store.dispatch(
                setUserError({
                  message: data.message,
                })
              );
            } else {
              store.dispatch(
                setCurrentUser({
                  name: data.username,
                  isHost: data.isHost,
                })
              );
            }
          }
        );
      }
      break;
    case LEAVE_A_ROOM:
      if (socket) {
        socket.emit('leave a room');
      }
      break;
    case UPDATE_ROOM_STORY_DESCRIPTION:
      if (socket) {
        socket.emit('update story description', action.payload);
      }
      break;
    case UPDATE_USER_VOTE:
      if (socket) {
        socket.emit('update user vote', action.payload);
      }
      break;
    case SET_ROOM_NEXT_STORY:
      if (socket) {
        socket.emit('set room next story');
      }
      break;
    case SHOW_USER_VOTES:
      if (socket) {
        socket.emit('show user votes', action.payload);
      }
      break;
    default:
      break;
  }

  return next(action);
};

export default socketMiddleware;
