import http from "http";
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui";
import express from "express";
// import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);
// const wsServer = SocketIO(httpServer);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(wsServer, {
  auth: false,
  mode: "development",
});

//공개 방
const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined) {
      publicRooms.push(key)
    }
  })

  return publicRooms
}

//방 접속자 수
const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

wsServer.on('connection', socket => {
  socket.on('enter_room', (roomName, callback) => {
    socket.join(roomName)
    callback(countRoom(roomName))
    socket.to(roomName).emit('enterNewUser', socket.nickname, countRoom(roomName))
    wsServer.sockets.emit('room_change', publicRooms())
  })

  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1))
  })
  
  //소켓 연결 종료 시
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms())
  })

  socket.on('new_message', (msg, room, done) => {
    const newMsg = `${socket.nickname} : ${msg}`
    socket.to(room).emit('new_message', newMsg);
    done()
  })

  //소켓 별 닉네임 설정
  socket.on('nickname', nickname => (socket['nickname'] = nickname))
})

//모든 사람에게 message전송 - 공지용
wsServer.sockets.emit('hi', 'everyone')

/*
const wss = new WebSocket.Server({ server });

const makeMessge = (user, message) => {
  const msg = { user, message }
  return JSON.stringify(msg)
}
// 1. 소켓 연결 끊겼을 경우
const onSocketClose = () => {
  console.log('Disconnected from the browser')
  sockets.pop()
}

// 2. 브라우저 -> 서버 -> 브라우저
const onSocketMessage = (message) => {
  const jMsg = JSON.parse(message)

  switch (jMsg.type){
    case 'message':
      sockets.forEach(socket => {
        socket.send(makeMessge(jMsg.message))
      })
    case 'nickname':
      // socket['nickname'] = jMsg.message
      console.log(this)
      // this.socket['nickname'] = jMsg.message

  }
}

//3. 서버 -> 브라우저 메세지
const onServerMessage = (socket, message = 'hello') => {
  socket.send(message)
}

//소켓 리스트
const sockets = [];


// //소켓 연결 시
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket.on('close', onSocketClose) //1
  socket.on('message', onSocketMessage) //2
})

 */

httpServer.listen(3000, handleListen)