const express = require('express')
const { Pool } = require('pg')
const app = express()
const bodyParser = require('body-parser');
cons = require('consolidate');
const request = require('request');
var path    = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const pool = new Pool({
  user: 'dristi',
  host: 'localhost',
  database: 'dristidb',
  password: 'apple123',
  port: 5432
});

// Request flask api to access face recogniser 
var detectedUser = null;
var detectedId = null;
var imagePath = null;
var entryTime = null;
// Assign dust engine to .dust Files
// app.engine('dust', cons.dust);

// // Set default Ext .dust
// app.set('view engine', 'dust');
// app.set('views', __dirname + '/templates');

// Set public folder
app.use(express.static(path.join(__dirname, '/templates/static')));

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
    detectedId = data.detectedId;
    imagePath = data.imagePath;
    entryTime = data.entryTime;
    console.log(detectedUser);
    
    //to add the emitted data from recogniser.py and adding to database
    pool.connect();

    pool.query("INSERT INTO dristitb(name, lastentry, imagepath, nameid) VALUES($1, $2, $3, $4)", 
    [detectedUser,entryTime, imagePath, detectedId], (err, result) => {
      //res.send(result.rows)
      if(err){
        return console.error("errror occured", err);
      }else{
        console.log(result.rows);
      }
    });
  });
    

  // Establish socket connection
  socket.emit('send_message');
});

app.post('/addNewPerson', (req, res, next) => {
  console.log('new person api is called');

  pool.connect();
  pool.query("INSERT INTO userlist(name) VALUES($1)", 
                [req.body.name], (err, result) => {
                  //res.send(result.rows)
        if(err){
          return console.error("errror occured", err);
        }else{
          request({
            url: `http://localhost:5000/flask/api/v1.0/create/`,
            json: true,
            method: "POST"
          }, (error, response, body) => {
            if(error){
              console.log(error);
            }
          });  

          res.send(`New user ${req.body.name} has been added  in the database`);
        
        }
      }); 
      next();           
  });

  app.get('/stream', (req, res, next) => {
    res.status(200).json({detectedUser,imagePath});
    next();
  });


// start local host server  
app.listen(4000, () => {
  console.log("eth is working")

  pool.connect((err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
    }
  
    pool.query('SELECT * FROM userlist', (err, result) => {
      if(err){
          return console.error('error running query', err);
      }
      

    }); 
  });
    
  app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/templates/index.html'));
  })

});
