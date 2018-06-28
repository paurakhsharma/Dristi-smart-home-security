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
  user: 'postgres',
  host: 'localhost',
  database: 'dristidb',
  password: 'admin',
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

    pool.query("INSERT INTO dristitb(name, lastentry, imagepath) VALUES($1, $2, $3)", 
    [detectedUser,entryTime, imagePath], (err, result) => {
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
      // next();           
  });

  // app.get('/stream', (req, res, next) => {
  //   res.status(200).json({detectedUser,imagePath});
  //   next();
  // });




//data tanne kaam yeha bata hunxa ani page ma dekhaune


app.get('/userdata', (req, res) => {
  console.log('displaying userdata');

  pool.connect();
  pool.query("SELECT name FROM userlist", (err, result) => {
                  // res.send(result.rows)
        if(err){
          return console.error("errror occured while displaying userdata", err);
        }else{
          
          // res.send(JSON.stringify(result.rows));
           console.log(typeof((result.rows)))

           // res.write("<table><tr><td>123</td></tr><tr><td>456</td></tr><tr><td>789</td></tr><tr><td>012</td></tr></table>");
            

            res.write("<style>body{background: #43cea2; background: -webkit-linear-gradient(to right, #185a9d, #43cea2);background: linear-gradient(to right, #185a9d, #43cea2); }  </style>")
            res.write("<style> table {font-family: arial, sans-serif;border-collapse: collapse;width: 80%;}td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}tr:nth-child(even) {background-color: #dddddd;}</style>")
            res.write("<table align=center>")

            //  for(i=0;i<result.columns.length;i++){
            //   res.write(`<tr><td> ${result.[i].name} </tr></td>`)

            // }
            res.write(`<tr><th>Name</th><th>Description</th><th>Privileges</th></td>`)
            for(i=0;i<result.rows.length;i++){
              res.write(`<tr><td> ${result.rows[i].name} </td> <td>${result.rows[i].name} </td><td> ${result.rows[i].name} </td> </tr>`)

            }
            res.write("</table>")

            // console.log(result.rows.length)
          
        }
      }); 

});
  // record of users tarined time from recogniser

  app.get('/record', (req, res) => {
  console.log('displaying userdata');

  pool.connect();
  pool.query("SELECT name,lastentry,imagepath FROM dristitb", (err, result) => {
                  // res.send(result.rows)
        if(err){
          return console.error("errror occured while displaying userdata", err);
        }else{
          
          // res.send(JSON.stringify(result.rows));
           console.log(typeof((result.rows)))

           // res.write("<table><tr><td>123</td></tr><tr><td>456</td></tr><tr><td>789</td></tr><tr><td>012</td></tr></table>");
            

            res.write("<style>body{background: #43cea2; background: -webkit-linear-gradient(to right, #185a9d, #43cea2);background: linear-gradient(to right, #185a9d, #43cea2); }  </style>")
            res.write("<style> table {font-family: arial, sans-serif;border-collapse: collapse;}td, th {border: 1px solid #dddddd;text-align: left;padding: 8px;}tr:nth-child(even) {background-color: #dddddd;}</style>")
            res.write("<table align=center>")

            //  for(i=0;i<result.columns.length;i++){
            //   res.write(`<tr><td> ${result.[i].name} </tr></td>`)

            // }
            res.write(`<tr><th>Name</th><th>LastEntry</th><th>Imagepath</th></td>`)
            for(i=0;i<result.rows.length;i++){
              res.write(`<tr><td> ${result.rows[i].name} </td> <td>${result.rows[i].lastentry} </td><td> ${result.rows[i].imagepath} </td> </tr>`)

            }
            res.write("</table>")

            // console.log(result.rows.length)
          
        }
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
        }

        pool.query('SELECT * FROM userlist', (err, result) => {
          if(err){
              return console.error('error running query', err);
          }
          
        console.log(result.rows)


       }); 
    });
        
  app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/templates/index.html'));
  })

});
