const nameGenerator = require('fakerator')(); // generate random names for users

const randomstring = require('randomstring'); // generate room ids

const messageCache = {}; // cache room messages in memory

const rooms = {}; // cache game rooms

class EventHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
  }

  handleGameEvents() {
    // create private room handler
    this.socket.on('create private room', this.handleCreatePrivateRoomEvent());

    // join private room handler
    this.socket.on('join private room', this.handleJoinPrivateRoomEvent());

    // disconnect handler
    this.socket.on('disconnect', this.handleDisconnectOrLeaveEvent('disconnect'));

    // leave handler
    this.socket.on('leave a room', this.handleDisconnectOrLeaveEvent('leave'));

    // update story description
    this.socket.on('update story description', this.handleUpdateStoryDescription());

    // update user vote
    this.socket.on('update user vote', this.handleUpdateUserVote());

    // show user votes
    this.socket.on('show user votes', this.handleShowUserVotes());

    // set room next story
    this.socket.on('set room next story', this.handleSetRoomNextStory());
  }

  handleSetRoomNextStory() {
    return () => {
      const roomId = this.socket.roomId;
      const roomInfo = rooms[roomId];

      if (roomInfo) {
        roomInfo.nextStory = true;
        roomInfo.showVotes = false;
        roomInfo.statusMessage = null;
        roomInfo.voters = 0;

        Object.keys(rooms[roomId].users).map((user) => {
          rooms[roomId].users[user].vote = null;
          rooms[roomId].users[user].voted = false;
        });

        this.handleSetGameState(roomId, 'set room next story', {
          users: this.generateUserList(roomId),
          showVotes: false,
          nextStory: true,
          statusMessage: roomInfo.statusMessage,
        });
      }
    };
  }

  handleShowUserVotes() {
    return (showVotes) => {
      const roomId = this.socket.roomId;
      const roomInfo = rooms[roomId];

      if (roomInfo) {
        roomInfo.showVotes = showVotes;
        roomInfo.nextStory = false;
        this.handleSetGameState(roomId, showVotes ? 'show user votes' : 'hide user votes', {
          users: this.generateUserList(roomId),
          showVotes: showVotes,
          nextStory: false,
        });
      }
    };
  }

  handleUpdateUserVote() {
    return (data) => {
      const roomId = this.socket.roomId;
      const roomInfo = rooms[roomId];

      if (roomInfo) {
        const username = this.socket.username;

        rooms[roomId].showVotes = false;
        rooms[roomId].nextStory = false;

        if (!rooms[roomId].users[username].voted) {
          rooms[roomId].voters++;
        }

        rooms[roomId].users[username].voted = true;
        rooms[roomId].users[username].vote = data;

        if (rooms[roomId].voters === rooms[roomId].numUsers) {
          rooms[roomId].statusMessage = 'everyone voted';
          rooms[roomId].showVotes = true;
          rooms[roomId].nextStory = false;

          this.handleSetGameState(roomId, 'show user votes', {
            users: this.generateUserList(roomId),
            showVotes: true,
            nextStory: false,
            statusMessage: rooms[roomId].statusMessage,
          });
        } else {
          rooms[roomId].statusMessage = `${username} voted`;

          this.handleSetGameState(roomId, 'update user vote', {
            users: this.generateUserList(roomId),
            statusMessage: rooms[roomId].statusMessage,
          });
        }
      }
    };
  }

  handleUpdateStoryDescription() {
    return (data) => {
      const roomId = this.socket.roomId;
      const roomInfo = rooms[roomId];

      if (roomInfo) {
        roomInfo.storyDescription = data;
        this.handleSetGameState(roomId, 'updating story description', {
          storyDescription: data,
        });
      }
    };
  }

  handleSetGameState(roomId, state, data) {
    if (rooms[roomId]) {
      rooms[roomId].gameState = state;
    }

    this.io.to(roomId).emit('in game', {
      gameState: state,
      ...data,
    });
  }

  handleCreatePrivateRoomEvent() {
    return (data, callback) => {
      const roomId = randomstring.generate(9);
      this.socket.roomId = roomId;
      this.socket.join(roomId);
      data.username = data.username || nameGenerator.names.firstName();
      this.socket.username = data.username;
      const avatarIndex = data.avatarIndex || 0;
      rooms[roomId] = {
        host: data.username,
        users: {},
        gameStarted: false,
        numUsers: 1,
        statusMessage: null,
        voters: 0,
      };

      rooms[roomId].users[data.username] = {
        avatarIndex,
        id: this.socket.id,
      };

      messageCache[roomId] = [];

      const users = this.generateUserList(roomId);

      const numUsers = rooms[roomId].numUsers;

      const defaultRoomSettings = {
        roomId,
        users,
        numUsers,
        host: data.username,
        statusMessage: null,
      };

      if (callback) {
        callback(defaultRoomSettings);
      }
    };
  }

  handleJoinPrivateRoomEvent() {
    return (data, callback) => {
      const roomId = data.roomId;
      const avatarIndex = data.avatarIndex;

      if (!roomId || !rooms[roomId]) {
        if (callback) {
          return callback({
            type: 'room error',
            message: 'room does not exist',
          });
        } else {
          return this.socket.emit('room does not exist');
        }
      }

      let username = data.username;
      if (!username) {
        username = nameGenerator.names.firstName();
      } else {
        if (rooms[roomId].users.hasOwnProperty(username)) {
          if (callback) {
            return callback({
              type: 'user error',
              message: 'name already exists',
            });
          } else {
            return this.socket.emit('name exists');
          }
        }
      }

      this.socket.roomId = roomId;
      this.socket.username = username;
      this.socket.join(roomId);
      rooms[roomId].users[username] = {
        avatarIndex,
        id: this.socket.id,
      };
      rooms[roomId].numUsers++;
      this.io.to(roomId).emit('private room joined', {
        users: this.generateUserList(roomId),
        roomId,
        host: rooms[roomId].host,
        numUsers: rooms[roomId].numUsers,
        gameState: rooms[roomId].gameState,
        storyDescription: rooms[roomId].storyDescription,
        statusMessage: rooms[roomId].statusMessage,
        showVotes: rooms[roomId].showVotes,
        nextStory: rooms[roomId].nextStory,
      });

      if (callback) {
        callback({
          username,
          isHost: username === rooms[roomId].host,
        });
      }
    };
  }

  handleDisconnectOrLeaveEvent(type) {
    return () => {
      if (type === 'disconnect') {
        console.log(`a client ${this.socket.id} has been disconnected from the server`);
      } else {
        console.log(`a client ${this.socket.id} has left the room ${this.socket.roomId}`);
      }
      const roomId = this.socket.roomId;
      const username = this.socket.username;
      if (roomId) {
        if (rooms[roomId] && rooms[roomId].users) {
          delete rooms[roomId].users[username];
          rooms[roomId].numUsers--;
          if (rooms[roomId] && rooms[roomId].numUsers === 0) {
            delete rooms[roomId];
          } else {
            if (username === rooms[roomId].host) {
              rooms[roomId].host = Object.keys(rooms[roomId].users)[0];
            }
          }
        }

        if (rooms[roomId]) {
          this.socket.to(roomId).emit('user left', {
            host: rooms[roomId].host,
            users: this.generateUserList(roomId),
          });
        }

        this.socket.leave(roomId);
        this.socket.roomId = null;
        this.socket.username = null;
      }
    };
  }

  generateUserList(roomId) {
    const users = Object.keys(rooms[roomId].users).map((user) => {
      return {
        name: user,
        index: rooms[roomId].users[user].avatarIndex,
        vote: rooms[roomId].showVotes ? rooms[roomId].users[user].vote : null,
        voted: rooms[roomId].users[user].voted && !rooms[roomId].nextStory ? true : false,
      };
    });

    return users;
  }
}

module.exports = EventHandler;
