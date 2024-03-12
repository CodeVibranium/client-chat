import React, { useRef, useState } from "react";
import { addMessage } from "../helpers/utils";
import * as superheroes from "superheroes";
import { wss } from "../conifg/socket.config";

// function sendMessage(socket, message, room = "") {
//   socket.emit("send-message", { ...message }, room);
// }

function Socket() {
  const userName = useRef(superheroes.random());
  const [loading, setLoading] = useState(false);
  const [chatConnected, setChatConnected] = useState({
    connected: true,
    disconnectedBy: null,
  });
  const [socketData, setSocketData] = useState({
    brand: "Samsung",
    sentBy: userName.current,
    userName: userName.current,
  });
  const [isSocketConnected, setSocketConnected] = useState(false);

  const emitter = wss.getEmitter();
  emitter.on("connectionChanged", (connection) => {
    if (connection) {
      wss.receiveMsg((data) => {
        setSocketData(data);
      });
      wss.closeSocket((data) => {
        setChatConnected({ connected: false, disconnectedBy: data.agentName });
      });
    }
  });

  async function handleSendMessage() {
    const input = document.getElementById("message");
    if (!isSocketConnected) {
      wss
        .createSocket("http://localhost:3001")
        .connectSocket({ ...socketData, message: input.value }, () =>
          setSocketConnected(true)
        )
        .then((res) => {
          res.registerUser({ ...socketData, message: input.value }, (data) => {
            setLoading(true);
            // it has user socketId
            setSocketData(data);
          });
        });
      // user will send a message & wait and he will receive a message first from agent to get
      // agent socket id, very important
    } else {
      // const messageElem = document.getElementById("chat-messages");
      // const message = JSON.parse(messageElem.data);
      const inputVal = input.value;
      input.value = "";
      wss.sendMsg(
        {
          ...socketData,
          message: inputVal,
        },
        socketData.agentSocketId
      );
    }
  }
  function handleEndConnection() {
    wss.disconnectSocket(socketData);
    setChatConnected({ connected: false, disconnectedBy: socketData.userName });
  }
  return (
    <>
      <div style={{ maxHeight: "50vh", overflow: "auto" }}>
        <ol id="socket-msgs"></ol>
      </div>
      {chatConnected.connected ? (
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
            style={{
              minHeight: "100%",
              padding: "10px",
              marginLeft: "10px",
              background: "#0066b2",
            }}
            onClick={handleSendMessage}
          >
            Submit
          </button>
          {isSocketConnected && (
            <button
              style={{
                minHeight: "100%",
                padding: "10px",
                marginLeft: "30px",
                background: "#BA0021",
              }}
              onClick={handleEndConnection}
            >
              End
            </button>
          )}
          <br />
          <br />
        </div>
      ) : (
        <>
          <h3>{socketData.userName} has disconnected</h3>
        </>
      )}
    </>
  );
}

export default Socket;
