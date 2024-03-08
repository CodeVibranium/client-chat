import { io } from "socket.io-client";
import { addMessage } from "../helpers/utils";

class CustomSocket {
  static instance = null;
  socket = null;
  id = null;

  constructor() {
    if (CustomSocket.instance) {
      throw new Error("Socket instance already created");
    }
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
        addMessage({ ...message, socketId: this.socket.id });
        this.setupContinuousMessageReceiving();
        callback();
        resolve(this);
      });

      this.socket.on("connect_error", (error) => {
        reject(error);
      });
    });
  }

  registerUser(message, callback) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject("Socket not initialized");
        return;
      }

      this.socket.emit(
        "register-user",
        { ...message, userSocketId: this.socket.id },
        () => {
          callback();
          resolve(this.socket.id);
        }
      );
      // () => {
      //   console.log("Connected to server", this.socket.id);
      //   addMessage({ ...message, socketId: this.socket.id });
      //   this.setupContinuousMessageReceiving();
      //   callback();
      //   resolve(this.socket.id);
      // };
      this.socket.on("connect_error", (error) => {
        reject(error);
      });
    });
  }

  sendMsg(message, room = "") {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject("Socket not initialized");
        return;
      } else {
        this.socket.emit("send-message", { ...message }, room);
        resolve(this.socket.id);
      }

      this.socket.on("connect_error", (error) => {
        reject(error);
      });
    });
  }

  setupContinuousMessageReceiving() {
    this.socket.on("receive-msg", (msgSentFromServer) => {
      console.log("msgRECEIVEDFromServer-->", msgSentFromServer);
      addMessage({
        message: msgSentFromServer.message,
        sentBy: msgSentFromServer.agentName,
        fullMessage: msgSentFromServer,
      });
    });
  }

  receiveMsg() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject("Socket not initialized");
        return;
      } else {
        this.socket.on("receive-msg", (msgSentFromServer) => {
          console.log(msgSentFromServer);
          addMessage({
            message: msgSentFromServer.message,
            sentBy: msgSentFromServer.sentBy,
          });
          resolve(this.socket.id);
        });
      }
      this.socket.on("connect_error", (error) => {
        reject(error);
      });
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

  closeSocket(id) {
    console.log(id, ";sljd");
    if (this.socket) {
      this.socket
        .emit("stop", id, () => {
          console.log("Socket stopped");
        })
        .on("error", (error) => {
          console.error("Socket emit error:", error);
        });
      this.disconnectSocket();
    }
  }

  disconnectSocket() {
    if (this.socket) {
      console.log("in disconnect");
      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }
  }
}

export const wss = new CustomSocket();
