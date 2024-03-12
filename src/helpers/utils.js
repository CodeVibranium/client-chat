export function addMessage({
  message,
  sentBy = null,
  first = false,
  socketId = null,
  fullMessage = null,
}) {
  // Assuming you have a div with an id of 'myDiv'
  const myDiv = document.getElementById("socket-msgs");
  console.log("myDiv", myDiv);
  let newElem;
  // Create a new paragraph element
  if (first) {
    newElem = document.createElement("h3");
    newElem.textContent = `You are connected to ${socketId} as ${message}`;
  } else {
    newElem = document.createElement("li");
    newElem.id = "chat-messages";
    newElem.data = JSON.stringify(fullMessage || message);
    newElem.textContent = `${sentBy} says: ${message}`;
  }

  // Append it as a child of the div
  myDiv.appendChild(newElem);
}
