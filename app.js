import express from 'express';
import socket from 'socket.io';
import {router} from './controllers/routes.controller';
import bodyParser from 'body-parser';

const app = express();
let userWaitingForGame = null;

const server = app.listen(4000, () => {
    console.log('App running on 4000');
});

app.use(bodyParser.json());
app.use(router);

//Socket setup
const io = socket(server);
let activeGames = new Map();
let gameId = 1;
let pair;

io.on('connection', socket => {

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'connect'){
            if (userWaitingForGame === null) {
                userWaitingForGame = socket;
                io.to(socket.id).emit('message', {type: 'waiting', gameId: gameId});
            } else {
                activeGames.set(gameId, {
                    player1: userWaitingForGame,
                    player2: socket
                });
                io.to(userWaitingForGame.id).emit('message', {type: 'gameStart', data: {gameId: gameId}});
                io.to(socket.id).emit('message', {type: 'gameStart', data: {gameId: gameId}});

                userWaitingForGame = null;
                gameId++;
            }

        } else if (data.type === 'move') {
            console.log(data.payload);
        }
        const game = activeGames.get(data.gameId);
        /*if (socket.id === pair.player1.id) {
            io.to(pair.player2).emit('message', {type: 'move', text: data});
        } else io.to(pair.player1).emit('message', {type: 'move', text: data});*/

    })
});