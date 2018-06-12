const express = require('express')
const { Pool } = require('pg')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const pool = new Pool({
  user: 'dristi',
  host: 'localhost',
  database: 'dristidb',
  password: 'apple123',
  port: 5432,
});

// Request flask api to access face recogniser 
var usersInfo = null;

// pool.connect();
// const query = pool.query(
//   'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
// pool.end();



app.get('/node/api/v1/recognise', (req, res, next) => {
  console.log('api has been called');

  var socket = require('socket.io-client')('http://localhost:5000/');

  // After getting response from the server
  socket.on('recognise', function(data){
    detectedUser = data.detectedUser;

    // Check if the detected person is in the database
    Object.keys(usersInfo).map( (key) =>{
      if(usersInfo[key]['name'].trim() === detectedUser){
        console.log('The person is: '+ detectedUser);
        console.log('Last entry of the user is: ' + usersInfo[key]['lastentry']);
        console.log('The image path is: '+ usersInfo[key['name']])
      }
    });
  });
  // Establish socket connection
  socket.emit('send_message');
});

app.post('/node/api/v1/add', (req, res, next) => {
  console.log('api has been called');

  pool.connect();
  pool.query("INSERT INTO dristitb(name, lastentry, imagepath) VALUES($1, $2, $3)", 
                [req.body.name, req.body.lastentry, req.body.imagepath], (err, result) => {
                  res.send(result.rows);
                });  
  });


// start local host server  
app.listen(4000, () => {
  console.log("eth is working")

  pool.connect((err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
  
    pool.query('SELECT * FROM dristitb', (err, result) => {
      if(err){
          return console.error('error running query', err);
      }
      usersInfo = result.rows; 
    }); 
  });

});
