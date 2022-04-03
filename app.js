//importation des differentes bibliothéques 

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
const serveStatic = require('serve-static');
var ok = false;
var number = 0;
var list
//var img_src ="images/1.jpg";
console.log(number + ' image')

//etablissement de la connection avec la base de données sql 

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

//etablissement de la connection avec socket.io
console.log(__dirname)
var sock = io.sockets.on('connection', function (socket) {
  //socket.emit('hello', { 'this': 'is my data' });
  var im = getImagesFromDir(path.join(__dirname, 'images'))
  list = im
  //console.log(list)
  socket.emit('firstimage', list[0]);
  var length = list.length
  socket.emit('length', length)
  socket.on('nb', (arg) => {
    console.log('recieved : ' + arg)
    number = arg;
    console.log(number + 'a change')

    var img = path.join(__dirname, 'images', list[number])
    var img_src = list[number]
    console.log(img_src)
    socket.emit('src', img_src)
  });

  socket.on('sendlist', (arg) => {
    console.log('recieved : ' + arg)
    socket.emit('list', list)

  })
  //enregistrement de l'image 
  socket.on('save', (arg) => {
    console.log('recieved : ' + arg)
    saveImageToDisk(arg, "images/" + Date.now() + ".png")

  })

  //supression de l'image 


  socket.on('delete', (arg) => {
    console.log('src_to_delete_recieved : ' + arg)
    var img_src = list[number]
    fs.unlink(img_src, (err) => {
      if (err) {
        throw err;
      }
      console.log('image deleted')
      socket.emit('deleted', arg)
    })

  })
  //chargement du playlist des videos de la base de données 

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

    //affichage des video 


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

//app.use(express.static('images'));

app.use('/', express.static(path.join(__dirname, '')));
app.use('/imagee', express.static(path.join(__dirname, 'images')));
//app.use('/', express.static('images'));

//chargement de l'image viewer 

app.get('/imagee', function (req, res) {
  res.setHeader('content-Type', 'text/html');
  ok = true
  //console.log(img_src)
  console.log("seeeeeent")
  console.log('sent')

  fs.readFile('./image_player_essai.html', 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      //console.log(img_src)
      res.end(data);
    }
  })


});

app.use(express.static(path.join(__dirname, '')));

app.use(upload());

//transfert le l'image 

app.post('/img', (req, res) => {


  let filee = req.files.uploader;
  let filename = filee.name
  filee.mv('./images/' + filename, function (err) {
    if (err) { res.send(err); }
  });
  filee.mv('./imagee/images/' + filename, function (err) {
    if (err) { res.send(err); }
  });
  res.redirect('/imagee')
});
//chargement des images de dossiers

function getImagesFromDir(dirPath) {
  let allImages = []
  let files = fs.readdirSync(dirPath)
  //console.log(files)
  for (file in files) {
    files[file] = "images/" + files[file]
  }
  return files

}

//sauvgardage des images 

function saveImageToDisk(url, path) {
  var fullUrl = url
  console.log("dans la fonction save")
  var localPath = fs.createWriteStream(path)
  var request = http.get(fullUrl, function (response) {
    console.log(response)
    response.pipe(localPath)
  })
}



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
  var check = []
  let filee = req.files.location;
  let filename = filee.name
  console.log("entre")
  console.log(names)

  maxid++
  console.log("entre2")
  filee.mv('./video/' + filename, function (err) {
    if (err) { res.send(err); }
  });
  var sql = 'insert into video(id,name) values (' + maxid + ',"' + filename + '");'
  connection.query(sql);
  names.push(filename)
  check.push(filename)

  res.redirect('/')
});

//suppression des video du playlist des videos

app.post('/files', function (req, res) {
  var filedelete = req.body.name

  names.pop(filedelete);
  connection.query('delete from video where name="' + filedelete + '";')


  res.redirect('/')

});

//chargement du front de video player
app.get('/', function (req, res) {
  if (ok == false) {
    res.sendFile(__dirname + "/index.html");
  }
});

//retour au video player

app.get('/vidPlay', function (req, res) {
  ok = false;
  res.redirect('/')
})



console.log(ok)

server.listen(3000, () => {
  console.log('listening on *:3000');
});
module.exports = app;
