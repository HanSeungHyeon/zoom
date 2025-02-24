import http from "http";
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

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

//public room list
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
  //방 참여 시
  socket.on('enter_room', (roomName, callback) => {
    socket.join(roomName)
    callback(countRoom(roomName))
    socket.to(roomName).emit('enterNewUser', socket.nickname, countRoom(roomName))
    wsServer.sockets.emit('room_change', publicRooms())
  })

  //브라우저 종료 시
  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1))
  })
  
  //소켓 연결 종료 시
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms())
  })

  //메세지 전송
  socket.on('new_message', (msg, room, done) => {
    const newMsg = `${socket.nickname} : ${msg}`
    socket.to(room).emit('new_message', newMsg);
    done()
  })

  //소켓 별 닉네임 설정
  socket.on('nickname', nickname => (socket['nickname'] = nickname))
})

httpServer.listen(3000, handleListen)