const socket = io();

const welcome = document.getElementById('welcome')
const form = welcome.querySelector('form')
const room = document.getElementById('room')

room.hidden = true
let roomName;

const addMessage = (message) => {
  const ul = room.querySelector('ul')
  const li = document.createElement('li')
  li.innerHTML = message
  ul.appendChild(li)
}

const handleMessageSubmit = (event) => {
  event.preventDefault()
  const input = room.querySelector('input')
  const msg = input.value
  socket.emit('new_message', msg, roomName, () => {
    addMessage(`You : ${msg}`)
  })
  input.value = ''
}

const enterRoomCallback = () => {
  welcome.hidden = true
  room.hidden = false
  const h3 = room.querySelector('h3')
  h3.innerHTML = `Room ${roomName}`
  const form = room.querySelector('form')
  form.addEventListener('submit', handleMessageSubmit)
}

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector('input')
  socket.emit('enter_room', input.value, enterRoomCallback)
  roomName = input.value
  input.value = ''
}

socket.on('enterNewUser', () => {
  addMessage('someone join!')
})

socket.on('bye', () => {
  addMessage('someone leave!')
})

socket.on('new_message', addMessage)
form.addEventListener('submit', handleRoomSubmit);