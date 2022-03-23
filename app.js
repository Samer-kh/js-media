var express = require('express');
app = express();
http = require('http');
server = http.createServer(app);
var fs = require('fs');
const { Server } = require("socket.io");
const io = new Server(server);
path = require('path');
util = require('util');
upload = require('express-fileupload')
const bodyParser = require('body-parser');

var connection = require('mysql').createConnection({
  host: 'localhost',
  user: 'root',
  port: 3306,
  database: 'videos'
});
connection.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});


var sock = io.sockets.on('connection', function (socket) {

  connection.query('select * from video', function (err, results) {
    sock.emit('playlist', results);
    //console.log(results)
    //console.log('emitted')
  });
  socket.on('title', (arg) => {
    console.log('recieved : ' + arg)
    //emetting existing videos
    var name;
    connection.query('select * from video where id=' + arg, function (err, results) {
      name = results[0]['name']
    })

    console.log('/video/' + arg)
    app.get('/video/' + arg, function (req, res) {
      const range = req.headers.range;
      if (!range) {
        res.status(400).send('requires range header');
      }
      const videoPath = "./video/" + name;
      const videoSize = fs.statSync("./video/" + name).size;
      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, headers);
      const videoStream = fs.createReadStream(videoPath, { start, end });
      videoStream.pipe(res);



    });
    return sock;
  });
});




app.use(upload());

//preparer l'id avant l'ajout pour se protéger contre le critére asynchrone
var maxid = 0;
var names = []

connection.query('select * from video', function (err, results) {
  for (i = 0; i < results.length; i++) {
    names.push(results[i]['name'])

    if (Number(results[i]['id']) > maxid) {
      maxid = results[i]['id'];


    }
  }
});
console.log(names)
//ajout de video
app.post('/file', (req, res) => {

  var ok = true
  console.log(maxid)

  let filee = req.files.location;
  let filename = filee.name
  if (!names.includes(filename, 0)) {
    maxid++
    filee.mv('./video/' + filename, function (err) {
      if (err) { res.send(err); }
    });
    var sql = 'insert into video(id,name) values (' + maxid + ',"' + filename + '");'
    connection.query(sql);
    names.push(filename)
  }
  res.redirect('/')
});

app.post('/files', function (req, res) {
  var filedelete = req.body.name
  if (names.includes(filedelete, 0)) {
    names.pop(filedelete);
    connection.query('delete from video where name="' + filedelete + '";')

  }
  res.redirect('/')

});

app.use(express.static(path.join(__dirname, '')));

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
});






server.listen(3000, () => {
  console.log('listening on *:3000');
});
module.exports = app;
