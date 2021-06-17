const express = require('express');
const db = require('../db');
const router = express.Router();

// Return all coffee in the menu information for
router.get('/', (req, res) => {
    db.query('SELECT *FROM menu').then(results => {
        res.json({ menu: results})
    })
    .catch(() => {
        res.sendStatus(500);
    });
});

// Return information of a single drink in
router.get('/:id', (req, res) => {
    db.query('SELECT *FROM menu where id = ?', [req.params.id])
    .then(results => { 
        res.json(results);
    })
    .catch(error => {
        console.error(error);
        res.sendStatus(500);
    });
});

// Post details of the drinks
router.post('/', (req, res) => {
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

router.delete('/:id', (req, res) => {
    db.query('DELETE FROM menu where id = ?', [req.params.id])
    .then(results => {
        res.sendStatus(200);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});


module.exports = router;