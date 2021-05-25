const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const passportHttp = require('passport-http');
const passport = require('passport');
const cors = require('cors');
const app = express()
const port = 3000

app.use(express.json());
app.use(cors());

let users = [
  {
    id: '130ef3c5-2cb6-47c5-8df1-2ba78d8c0d48',
    username: 'lasse',
    password: '$2a$08$SatQY..QLEoc4i1/ttb64.O36/8HO2YtYYa/.lbHgqVM4ofDCqDsi', //123456
    email: '1@2'
  }
];

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
    console.log(req.body);

    const passwordHash = bcrypt.hashSync(req.body.password, 8);

    users.push({
      id: uuidv4(),
      username: req.body.username,
      password: passwordHash,
      email: req.body.email,

    });

    res.sendStatus(200); 
});

app.get('/users', (req, res) => {
  res.json(users);
});

passport.use(new passportHttp.BasicStrategy(function(username, password, done){
  const userResult = users.find(user => user.username === username);
  if(userResult == undefined) {
    return done(null, false);
  }

  if(bcrypt.compareSync(password, userResult.password) == false)
{
  return done(null, false);
}

done(null, userResult);

}));

app.post('/login', passport.authenticate('basic', { session: false }), (req, res) => {
  console.log(req.user);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})