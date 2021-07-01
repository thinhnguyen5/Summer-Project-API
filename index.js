const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Strategy = require('passport-http').BasicStrategy;
const passport = require('passport');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = 4000;

const saltRounds = 4;

app.use(express.json());
app.use(cors())
// app.use('/menu', menuComponent);



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

app.get('/menu', (req, res) => {
  db.query('SELECT * FROM menu').then(results => {
    res.json({ drink: results})
  })
  .catch(() => {
    res.sendStatus(500);
  })
})

// Read info on single drink
app.get('/menu/:id', (req, res) => {
  db.query('SELECT *FROM menu where id = ?', [req.params.id])
  .then(results => {
    res.json(results);
  })
  .catch(error => {
    console.error(error);
    res.sendStatus(500);
  })
})

//Create a new drink
app.post('/menu', (req, res) => {
  db.query('INSERT INTO menu (name, description, nutritioninformation, size, calories, fat, cholesterol, carbohydrates, protein, caffeine, ingredients, price, img) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
  [req.body.name, req.body.description, req.body.nutritioninformation, req.body.size, req.body.calories, req.body.fat, req.body.cholesterol, req.body.carbohydrates, req.body.protein, req.body.caffeine, req.body.ingredients, req.body.price, req.body.img])
  .then(results => {
      console.log(results);
      res.sendStatus(201);
  })
  .catch(() => {
      res.sendStatus(500);
  });
});

//Delete a drink
app.delete('/menu/:id', (req, res) => {
  db.query('DELETE FROM menu where id = ?', [req.params.id])
  .then(results => {
      res.sendStatus(200);
  })
  .catch(error => {
      console.log(error);
      res.sendStatus(500);
  });
});



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


