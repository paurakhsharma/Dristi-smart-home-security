const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const pg = require('pg')
const app = express()
const config={
  user:'postgres',
  database:'todoApp',
  password:'aasis',
  port:5432
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

const pool = new pg.Pool(config);
// pool.connect();
// const query = pool.query(
//   'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
// pool.end();

app.post('/api/v1/todos', (req, res, next) => {
  
  // Grab data from http request
  //const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  pool.connect((err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    //create a table
    // client.query('CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');

  
    // SQL Query > Insert Data
    client.query('INSERT INTO items(text, complete) values($1, $2)',
    [req.query.text, req.query.complete], function(err, result){
      if(err){
        return console.error("errror occured", err)
      }else{
        console.log(result.rows)
      }

    });
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC', function(err, result){
      if(err){
        return console.error("errror occured", err)
      }else{
        console.log(result.rows)
      }
    });
    // Stream results back one row at a time
    // query.rows.forEach(row=>{
    //   results.push(row);
    // });
    // // After all data is returned, close connection and return results
    // query.rows.forEach(row=> {
    //   done();
    //   return res.json(results);
    });
  });


app.listen(4000, function(){
  console.log("eth is working")

});
