const express = require('express')
const { Pool } = require('pg')
const app = express()
const bodyParser = require('body-parser');
cons = require('consolidate');
const request = require('request');
var path    = require("path");
var fs = require('fs');

// DB Connect String

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dristidb',
  password: 'admin',
  port: 5432
});

// Assign Dust Engine To .dust Files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



// Request flask api to access face recogniser 
var detectedUser = null;
var detectedId = null;
var imagePath = null;
var entryTime = null;




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




//adding new person
app.post('/addNewPerson', (req, res, next) => {
  console.log('new person api is called');

	pool.connect();
	
  pool.query("INSERT INTO userlist(name,description,privileges) VALUES($1,$2,$3)", 
                [req.body.name,req.body.description,req.body.privileges], (err, result) => {
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
          res.end()
        
        }
      }); 
      // res.redirect('/')
      // next();           
  });


//editing data


app.post('/edit', function(req, res){
	// PG Connect
		pool.connect()
	  pool.query("UPDATE userlist SET name=$1, description=$2, privileges=$3 WHERE name = $1",
	  	[req.body.name,req.body.description,req.body.privileges]);
	
		
		res.redirect('/');
	
});

//deleting user records

app.get('/delete/:name', function(req, res){
	// PG Connect
		pool.connect()
	
	
	
    name=req.params.name
    console.log(name)
    pool.query('SELECT id FROM userlist WHERE name=$1',[name],function(err, result) {
	    if(err) {
	      return console.error('error running query', err);
      }
      ID=(result.rows[0]).id
      // console.log(ID)

      //delete data from node directory which was printed as avatar in userdata template
      avatarfile="./public/img/avatar."+ID+".jpg"
      //console.log(avatarfile)
      if (fs.existsSync(avatarfile)) {
        // Do something
        //console.log("file exits")
        fs.unlinkSync(avatarfile);
      }
      
      // delete images from dataset
      for(i=1;i<=50;i++){
        dataset="../facialRecognition/dataSet/user."+ID+"."+i+".jpg"
        if (fs.existsSync(dataset)) {
          // Do something
         // console.log("file exits")
          fs.unlinkSync(dataset);
        }
      }

      //after deleting files lets delete the data from database
      pool.query('DELETE FROM userlist WHERE name = $1',[req.params.name], (err, result) => {
        if(err){
            return console.error('error running query', err);
        }
    });
   
    
      
	
		// console.log(ID)
		// res.send(200);
	}); 
});





//data tanne kaam yeha bata hunxa ani page ma dekhaune
app.get('/userdata', function(req, res){
	// PG Connect
		pool.connect()
	  pool.query('SELECT * FROM userlist', function(err, result) {
	    if(err) {
	      return console.error('error running query', err);
	    }
	    res.render('userdata', {usertable: result.rows});
	    res.end
	  });
	
});







  // record of users tarined time from recogniser

  app.get('/records', function(req, res){
    // PG Connect
      pool.connect()
      pool.query('SELECT * FROM dristitb', function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        res.render('records', {usertable: result.rows});
        
      });
    
  });

  


// start local host server  
app.listen(4000, () => {
  console.log("eth is working")

      // pool.connect((err, client, done) => {
      //   // Handle connection errors
      //   if(err) {
      //     done();
      //     console.log(err);
      //   }

      //   pool.query('SELECT * FROM userlist', (err, result) => {
      //     if(err){
      //         return console.error('error running query', err);
      //     }
          
      //     console.log(result.rows)
      //   }); 
      // });
        

});

app.get('/', function(req, res){

  res.render('index', {});
});

