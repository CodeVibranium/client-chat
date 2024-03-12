import { io } from "socket.io-client";
import { addMessage } from "../helpers/utils";
import EventEmitter from "events";

class CustomSocket {
  id = null;
  socket = null;
  emitter = null;
  static instance = null;

  constructor() {
    if (CustomSocket.instance) {
      throw new Error("Socket instance already created");
    }
    this.socket = null;
    this.emitter = new EventEmitter();
    CustomSocket.instance = this;
  }

  createSocket(connectionURI) {
    if (this.socket) {
      console.log("Socket already created");
      return;
    }
    try {
      this.socket = io(connectionURI, {
        cors: { origin: "*" },
      });
      return this;
    } catch (error) {
      console.error("Failed to create socket:", error);
    }
  }

  connectSocket(message, callback) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject("Socket not initialized");
        return;
      }

      this.socket.on("connect", () => {
        console.log("Connected to server", this.socket.id);
        this.emitter.emit("connectionChanged", true);
        addMessage({
          ...message,
          socketId: this.socket.id,
          first: true,
          message: message.userName,
        });
        // this.setupContinuousMessageReceiving();
        // this.closeSocket(); // when agents closes chat
        callback();
        resolve(this);
      });

      this.socket.on("connect_error", (error) => {
        reject(error);
      });
    });
  }

  onConnectionChange(callback) {
    this.emitter.on("connectionChanged", callback);
  }

  registerUser(message, callback) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject("Socket not initialized");
        return;
      }
      let data = { ...message, userSocketId: this.socket.id };
      // responsible to connect this user to server that is
      // irrespective of whether agent is availability
      this.socket.emit("register-user", data, () => {
        callback(data);
        resolve(this.socket.id);
      });

      this.socket.on("connect_error", (error) => {
        reject(error);
      });
    });
  }

  sendMsg(message, room = "") {
    this.socket.emit("send-message", { ...message }, room);
  }

  // setupContinuousMessageReceiving() {
  //   this.socket.on("receive-msg", (msgSentFromServer) => {
  //     console.log("msgRECEIVEDFromServer-->", msgSentFromServer);
  //     addMessage({
  //       message: msgSentFromServer.message,
  //       sentBy: msgSentFromServer.agentName,
  //       fullMessage: msgSentFromServer,
  //     });
  //   });
  // }

  receiveMsg(updateSocketData) {
    // this will setSocketData with agent name & agent details
    this.socket.on("receive-msg", (msgSentFromServer) => {
      console.log(msgSentFromServer);
      addMessage({
        message: msgSentFromServer.message,
        sentBy: msgSentFromServer.agentName,
      });
      updateSocketData(msgSentFromServer);
    });
  }

  listenEvent(eventName, id, callback) {
    return new Promise((resolve, reject) => {
      this.socket.emit("start", id, () => {
        console.log("Started to server", id);
      });

      console.log(eventName);
      this.socket.on(eventName, (data) => {
        console.log(data, "dksnfls");
        callback(data);
        resolve();
      });
    });
  }

  closeSocket(callback) {
    if (this.socket) {
      this.socket.on("forward-disconnect", (data) => {
        console.log(data);
        this.socket.disconnect();
        // agent ended the chat // use some state to represent it
        callback(data);
      });
    }
  }

  disconnectSocket(data) {
    if (this.socket) {
      this.socket.emit(
        "end-connection",
        { ...data, disconnectedBy: "user" },
        data.agentSocketId
      );
      this.socket.disconnect();
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  getEmitter() {
    return this.emitter;
  }

  static getInstance(onMessageCallback) {
    if (!CustomSocket.instance) {
      CustomSocket.instance = new CustomSocket();
      return this;
      // CustomSocket.instance.connect(onMessageCallback).catch(console.error);
    }
    return CustomSocket.instance;
  }
}

export const wss = new CustomSocket();
