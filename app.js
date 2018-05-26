import express from 'express';
import socket from 'socket.io';
import {router} from './controllers/routes.controller';
import bodyParser from 'body-parser';
import {randomNumber} from "./services/shared";
import mongoose from "mongoose";
import cors from 'cors';

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/chess').then(() => console.log('connected'));

const app = express();
let userWaitingForGame = null;

const server = app.listen(4000, () => {
  console.log('App running on 4000');
});

app.use(cors());
app.use(bodyParser.json());
app.use(router);

//Socket setup
const io = socket(server);
let activeGames = new Map();
let activeUsers = [];
let gameId = 1;

io.on('connection', socket => {

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'connect') {
      console.log(data);
      if (userWaitingForGame === null) {
        userWaitingForGame = {socket: socket, user: data.user};
        io.to(socket.id).emit('message', {type: 'waiting', gameId: gameId});
      } else {
        const player1 = {socket: userWaitingForGame.socket, opponent: data.user};
        const player2 = {socket: socket, opponent: userWaitingForGame.user};
        const random = randomNumber(2);
        if (random === 1) {
          player1.color = 'white';
          player2.color = 'black'
        } else {
          player1.color = 'black';
          player2.color = 'white';
        }
        activeGames.set(gameId, {
          player1: player1,
          player2: player2
        });
        io.to(userWaitingForGame.socket.id).emit('message', {
          type: 'gameStart',
          data: {
            gameId: gameId,
            color: player1.color,
            opponent: player1.opponent
          }});
        io.to(socket.id).emit('message', {
          type: 'gameStart',
          data: {
            gameId: gameId,
            color: player2.color,
            opponent: player2.opponent
          }});

        userWaitingForGame = null;
        gameId++;
      }

    } else if (data.type === 'move') {
      const players = activeGames.get(data.payload.id);
      console.log(players);
      if (players.player1.socket.id === socket.id) {
        io.to(players.player2.socket.id).emit('message', {type: 'move', data})
      } else {
        io.to(players.player1.socket.id).emit('message', {type: 'move', data})
      }

    } else if (data.type === 'login') {
      activeUsers.push(data.payload.user);
    }
    const game = activeGames.get(data.gameId);
    /*if (socket.id === pair.player1.id) {
        io.to(pair.player2).emit('message', {type: 'move', text: data});
    } else io.to(pair.player1).emit('message', {type: 'move', text: data});*/

  })
});