var express = require('express');
var pg = require('pg'); //postgres
var parser = require('body-parser');
const app = express();

app.use(express.static( "public" )); //access pictures and suchs
app.use(parser.json());

app.set('view engine', 'ejs')
var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletinboard';
var pgClient = new pg.Client(connectionString);
pgClient.connect();

pgClient.query("CREATE TABLE IF NOT EXISTS messages(id SERIAL UNIQUE PRIMARY KEY, title text, body text)")

app.get('/', (req, res) => {
  var query = pgClient.query("SELECT * FROM messages ORDER BY id DESC");
  query.on("row", function(row, result){
    result.addRow(row);
  })
  query.on("end", function(result){
    res.render('home',{data:result.rows, active:"home"});
  })
})

app.post('/newmessage',function(req,res){
  pgClient.query("INSERT INTO messages(id, title, body) values(DEFAULT, $1, $2)",[req.body.title, req.body.body])
  res.end('{success : "Updated Successfully", "status" : 200}');
})

app.post('/deletemessage/:id', function(req, res){
  pgClient.query("DELETE FROM messages WHERE id="+req.params.id);
  res.end('{success : "Updated Successfully", "status" : 200}');
})

app.get('/message/:id', (req, res) => {
  var query = pgClient.query("SELECT * FROM messages WHERE id=" + req.params.id);
  query.on("row", function(row, result){
    result.addRow(row);
  })
  query.on("end", function(result){
    res.render('message',{data:result.rows[0], active:"message"});
  })
})

app.get('/*', (req, res) =>{
  res.redirect('/');
})


app.listen(8080);
console.log('listening on port 8080')
