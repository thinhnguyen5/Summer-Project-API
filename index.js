const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Strategy = require('passport-http').BasicStrategy;
const passport = require('passport');
const cors = require('cors');
const menuComponent = require('./components/menu')
const db = require('./db');
const app = express();
const port = 4000;

const saltRounds = 4;

app.use(express.json());
app.use(cors())
app.use('/menu', menuComponent);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

passport.use(new Strategy((username, password, cb) => {
  db.query('SELECT id, username, password FROM users WHERE username = ?', [username]).then(dbResults => {
    
    if (dbResults.length == 0)
    {
      return cb(null, false);
    }
    
    bcrypt.compare(password, dbResults[0].password).then(bcryptResult => {
      if(bcryptResult == true)
      {
        cb(null, dbResults[0]);
      }else{
        return cb(null, false);
      }
    })

  }).catch(dbError => cb(err))
}));


app.get('/users', (req, res) => {
  db.query('SELECT id, username FROM users').then(results => {
    res.json(results);
  })
})

app.get('/users/:id', 
       passport.authenticate('basic', { session: false }),
       (req, res) => {
         db.query('SELECT id, username FROM users WHERE id = ?', [req.params.id]).then(results => {
           res.json(results)
         })
});

app.post('/users', (req, res) => {
  let username = req.body.username.trim();
  let password = req.body.password.trim();

  if((typeof username === "string") &&
     (typeof password === "string") &&
     (password.length >= 6))
  {
    bcrypt.hash(password, saltRounds).then(hash => 
      db.query('INSERT INTO users (username, password) VALUES (?,?)', [username, hash])
    )
    .then(dbResults => {
        console.log(dbResults);
        res.sendStatus(201);
      })
      .catch(error => res.sendStatus(500));
  }
  else {
    console.log("Wrong type, Username and Password do not have space character and password must more then 6 characters. Try again! " );
    res.sendStatus(404);
  }
})

Promise.all(
  [
      db.query(`CREATE TABLE IF NOT EXISTS users(
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(32),
          password VARCHAR(256)
      )`)

    //   db.query(`CREATE TABLE IF NOT EXISTS menu(
    //       id INT AUTO_INCREMENT PRIMARY KEY,
    //       name VARCHAR(255), 
    //       description VARCHAR(255), 
    //       nutritioninformation VARCHAR(255), 
    //       size VARCHAR(255), 
    //       calories VARCHAR(255), 
    //       fat VARCHAR(255), 
    //       cholesterol VARCHAR(255),
    //       carbohydrates VARCHAR(255),
    //       protein VARCHAR(255),
    //       caffeine VARCHAR(255),
    //       ingredients VARCHAR(255),
    //       price VARCHAR(255),
    //       img VARCHAR(255)) Engine=InnoDB;
    // )`)
  ]
).then(() => {
  console.log('database initialized');
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})
.catch(error => console.log(error));


