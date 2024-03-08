import React, { useRef, useState } from "react";
import { io } from "socket.io-client";
import { addMessage } from "../helpers/utils";
import * as superheroes from "superheroes";
import { wss } from "../conifg/socket.config";

function sendMessage(socket, message, room = "") {
  socket.emit("send-message", { ...message }, room);
}

function Socket() {
  const [isSocketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // const socket = io("http://localhost:3001");
  // console.log("socket", socket);
  const userName = useRef(null);

  // socket.on("connect", () => {
  //   console.log("SOCKET", socket);
  //   console.log("Socket connected successfully ", socket?.id);
  //   addMessage({ message: `You have connected to ${socket?.id}`, first: true });
  //   userName.current = superheroes.random();
  //   console.log("userName", userName);
  //   // socket.emit("send-message", { message: `HELLO ${socket.id}` });
  // });

  // socket.on("receive-msg", (msgSentFromServer) => {
  //   console.log(msgSentFromServer);
  //   addMessage({
  //     message: msgSentFromServer.message,
  //     sentBy: msgSentFromServer.sentBy,
  //   });
  // });

  async function handleSendMessage() {
    const input = document.getElementById("message");
    if (!isSocketConnected) {
      userName.current = superheroes.random();
      console.log("wss--->", wss);
      // wss.connectSocket()
      wss
        .createSocket("http://localhost:3001")
        .connectSocket(
          {
            brand: "Samsung",
            sentBy: userName.current,
            userName: userName.current,
            message: input.value,
            first: true,
          },
          () => setSocketConnected(true)
        )
        .then((res) => {
          res.registerUser(
            {
              brand: "Samsung",
              sentBy: userName.current,
              userName: userName.current,
              message: input.value,
              first: true,
            },
            () => {
              console.log("FE: USER REGISTERED SUCCESSFULLY");
              setLoading(true);
            }
          );
        });
    } else {
      const messageElem = document.getElementById("chat-messages");
      const message = JSON.parse(messageElem.data);
      console.log("message FROM AGENT SENDING TO AGENT", message);
      wss.sendMsg(
        {
          ...message,
          message: input.value,
        },
        message.agentSocketId
      );
    }
  }

  return (
    <>
      <div style={{ maxHeight: "50vh", overflow: "auto" }}>
        <ol id="socket-msgs"></ol>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          minWidth: "100%",
        }}
      >
        <input
          id="message"
          type="text"
          placeholder="Send a message"
          style={{ minWidth: "80%", padding: "10px" }}
        />
        <button
          style={{ minHeight: "100%", padding: "10px", marginLeft: "10px" }}
          onClick={handleSendMessage}
        >
          Submit
        </button>
        <br />
        <br />
        {/* <input
          id="room"
          type="text"
          placeholder="Room id"
          style={{ minWidth: "80%", padding: "10px" }}
        />
        <button
          style={{ minHeight: "100%", padding: "10px", marginLeft: "10px" }}
          onClick={() => {
            const input = document.getElementById("message");
            const room = document.getElementById("room");
            sendMessage(
              socket,
              {
                sentBy: userName.current,
                message: input.value,
              },
              room.value
            );
          }}
        >
          Submit
        </button> */}
      </div>
    </>
  );
}

export default Socket;
