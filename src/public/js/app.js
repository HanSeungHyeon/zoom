const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#message');
const nicknameForm = document.querySelector('#nickname');
var nickname = '';
const socket = new WebSocket(`ws://${window.location.host}`);


socket.addEventListener('open', () => {
  console.log('Connected to browser');
})

socket.addEventListener('message', (message) => {
  const li = document.createElement('li')
  const msg = JSON.parse(message.data)
  li.innerHTML = msg.message
  console.log(msg)
  messageList.append(li)
})

socket.addEventListener('close', () => {
  console.log('Disconnected to server')
})

// setTimeout(() => {
//   socket.send("hello from the browser")
// }, 3000)
const makeMessage = (type, user, message) => {
  const msg = { type, user, message }
  return JSON.stringify(msg)
}

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector('input');
  if(!!!nickname) return
  socket.send(makeMessage('message', nickname, input.value))
  input.value = ''
}

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  const input = nicknameForm.querySelector('input')
  socket.send(makeMessage('nickname', nickname, input.value))
  nickname = input.value
  input.disabled = true
}

messageForm.addEventListener('submit', handleMessageSubmit);
nicknameForm.addEventListener('submit', handleNicknameSubmit);