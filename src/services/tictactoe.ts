import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

async function startTicTacToeService(app: express.Application) {
  const io = new Server(http.createServer(app));

  //--------Token Validation
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
  
    //https://stackoverflow.com/a/73366040/8370216
    // jwt.verify(token, secretKey, (err, decoded) => {
    //   if (err) {
    //     return next(new Error('Authentication error'));
    //   }
    //   // Attach the decoded token payload to the socket object for further use
    //   socket.decoded = decoded;
    //   next();
    // });
  });
  


  io.on("connection", (client:Socket) => {
    io.on("disconnect", (client:Socket) => {
        client.id
    });
  });
}
