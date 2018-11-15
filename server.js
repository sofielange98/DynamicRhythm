const express = require('express');
const path = require('path');
const router = express.Router();
const pg=require('pg-promise')()
const connectString = "postgres://postgres:Password@localhost/DynamicRhythm";

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Home Route
app.get('/', function(req, res){
    res.render('index', {
        title:'Music'
    });
});

// Add Route
app.get('/login', function(req, res){
    res.render('login', {
        title:'Login'
    });
});

// Start Server
app.listen(3000, function(){
    console.log('Server Started on Port 3000');
});

// var client = new pg.Client(connectString);

// client.connect(function(err) {
//     if(err) {
//       return console.error('Connection of PostgreSQL Failed', err);
//     }
//     client.query('SELECT * FROM User', function(err, data) {
//       if(err) {
//         return console.error('Query Failed', err);
//       }else{
//         console.log('Success',JSON.stringify(data.rows)); 
//       }
//       client.end();
//     });
// });

// Setting Database
var config = {
   host: 'localhost',
   port: 5433,
   database: 'DynamicRhythm',
   user: 'postgres',
   password: 'Password'
}

// Create Connetion Pool
var db = pg(config)
// Query

db.any('SELECT * FROM User').then(function(result) {
  console.log(result);
}).catch(function(err){
  
    console.error('Error', err);
});
