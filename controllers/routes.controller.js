import express from 'express';
import User from '../schema/user_schema';

export const router = express.Router();

router.get('/test', (req, res) => {
  res.send({
    response: 'great',
    item: 'item'
  });
});

router.post('/login', (req, res) => {
  User.findOne({'email': req.body.user.email}).then(user => {
    if (user.password === req.body.user.password) {
      res.send(user);
    }
  }).catch(err => console.log(err));
});

router.post('/register', (req, res) => {
  const user = new User({
    email: req.body.user.email,
    password: req.body.user.password,
    rating: 1200,
    gamesLost: 0,
    gamesWon: 0
  });
  user.save(err => {
    if (err) {
      res.send('An error occurred');
    } else {
      res.send({status: 'registered'})
    }
  });
});
