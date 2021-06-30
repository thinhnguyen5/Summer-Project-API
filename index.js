const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Strategy = require('passport-http').BasicStrategy;
const passport = require('passport');
const cors = require('cors');
// const menuComponent = require('./components/menu')
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


let menu = [{
  id : uuidv4(),
  name : "Caffè Americano",  
  description: "Espresso shots topped with hot water create a light layer of crema culminating in this wonderfully rich cup with depth and nuance. Pro Tip: For an additional boost, ask your barista to try this with an extra shot.",
  nutritioninformation : "Nutrition information is calculated based on our standard recipes. Only changing drink size will update this information. Other customizations will not.", 
  size : "16", 
  calories : "15",  
  fat : "0",   
  cholesterol : "0",
  carbohydrates : "2", 
  protein : "1", 
  caffeine  : "225",
  ingredients : "Water, Brewed Espresso", 
  price : "2", 
  img : "img37.jpg" 
}];

app.get('/menu', (req, res) => {
  res.json(menu);
})

// Read info on single drink
app.get('/menu/:id', (req, res) => {
  const results = menu.find(d => d.id === req.params.id)

  res.json(results);
})

//Create a new drink
app.post('/menu', (req, res) => {
  console.log('New drink');
  console.log(req.body);
  menu.push({ 
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description,
    nutritioninformation: req.body.nutritioninformation,
    size: req.body.size,
    calories: req.body.calories,
    fat: req.body.fat,
    cholesterol: req.body.cholesterol,
    carbohydrates: req.body.carbohydrates,
    protein: req.body.protein,
    caffeine: req.body.caffeine,
    ingredients: req.body.ingredients,
    price: req.body.price,
    img: req.body.img
  })
  console.log('Drink name ' + req.body.name);
  res.send('CREATING new drink');
})

//Delete a drink
app.delete('/menu/:id', (req, res) => {

  const result = menu.findIndex(d => d.id === req.params.id);
  if(result !== -1) {
    menu.splice(result, 1);
    res.send('Delete succeeded');
  } else {
    res.send('no such drink found');
  }
  res.send('DELETE drink with id' + req.params.id);
})

//Delete all drinks
app.delete('/menu', (req, res) => {
  res.send('DELETE all drinks');
})

//Modify a drink
app.put('/menu/:id', (req, res) => {
  res.send('Modifying drink')
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


