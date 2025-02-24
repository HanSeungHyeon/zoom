const socket = io();

const welcome = document.getElementById('welcome')
const room = document.getElementById('room')
const roomNameForm = welcome.querySelector('#roomName')
const userNameForm = welcome.querySelector('#userName')

room.hidden = true
let roomName;

//메세지 추가이벤트
const addMessage = (message) => {
  const ul = room.querySelector('ul')
  const li = document.createElement('li')
  li.innerHTML = message
  ul.appendChild(li)
}

//메세지 전송 콜백
const handleMessageSubmit = (event) => {
  event.preventDefault()
  const input = room.querySelector('#msg input')
  const msg = input.value
  socket.emit('new_message', msg, roomName, () => {
    addMessage(`You : ${msg}`)
  })
  input.value = ''
}

//방 접속이벤트
const enterRoomCallback = (newCount) => {
  welcome.hidden = true
  room.hidden = false
  const h3 = room.querySelector('h3')
  h3.innerHTML = `Room ${roomName} (${newCount})`
  const msgForm = room.querySelector('#msg')
  msgForm.addEventListener('submit', handleMessageSubmit)
}

//닉네임 설정 이벤트
const handleUserNameSubmit = (event) => {
  event.preventDefault()
  const input = welcome.querySelector('#userName input')
  socket.emit('nickname', input.value)
  input.value = ''
}

//방 참가 이벤트
const handleRoomNameSubmit = (event) => {
  event.preventDefault();
  const input = welcome.querySelector('#roomName input')
  socket.emit('enter_room', input.value, enterRoomCallback)
  roomName = input.value
  input.value = ''
}

/** 서버 > 사용자 */

//룸에 새로운 사용자가 접속할 경우
socket.on('enterNewUser', (userNickname, newCount) => {
  console.log('hi')
  const h3 = room.querySelector('h3')
  h3.innerHTML = `Room ${roomName} (${newCount})`
  addMessage(`${userNickname} alive!`)
})

//룸에 사용자가 떠날 경우
socket.on('bye', (userNickname, newCount) => {
  const h3 = room.querySelector('h3')
  h3.innerHTML = `Room ${roomName} (${newCount})`
  addMessage(`${userNickname} leave!`)
})

//새로운 메시지
socket.on('new_message', addMessage)

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul')
  roomList.innerHTML = ''
  if(rooms.length === 0) {
    return
  }

  rooms.forEach(room => {
    const li = document.createElement('li')
    li.innerHTML = room;
    roomList.append(li)
  })
})
/** */

roomNameForm.addEventListener('submit', handleRoomNameSubmit)
userNameForm.addEventListener('submit', handleUserNameSubmit)