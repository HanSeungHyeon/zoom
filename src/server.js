import http from "http";
import SocketIO from "socket.io"
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

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on('connection', socket => {
  socket.on('enter_room', (msg, done) => {
    console.log(msg)
    done()
  })
})


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