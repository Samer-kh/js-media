const http =require('http');
const fs =require('fs');
const express = require('express');
const app = express();
const path = require('path');
const server =require('http').Server(app)
const io =require('socket.io')(server)
upload = require('express-fileupload')
var number = 0;
var list 
//var img_src ="images/1.jpg";
console.log(number+' image')

io.sockets.on('connection', function (socket) {
    //socket.emit('hello', { 'this': 'is my data' });
    var im =getImagesFromDir(path.join(__dirname,'images'))
    list=im
    //console.log(list)
    socket.emit('firstimage', list[0]);
    var length =list.length
    socket.emit('length',length)
    socket.on('nb', (arg) => {
        console.log('recieved : ' + arg)
        number = arg;
        console.log(number+'a change')

        var img=path.join(__dirname,'images',list[number])
        var img_src =list[number]
        console.log(img_src)
        socket.emit('src',img_src) 

    })

    socket.on('sendlist', (arg) => {
        console.log('recieved : ' + arg)
        socket.emit('list',list) 

    })

    socket.on('save', (arg) => {
        console.log('recieved : ' + arg)      
        saveImageToDisk(arg,"images/"+Date.now()+".png")

    })

    socket.on('delete', (arg) => {
        console.log('src_to_delete_recieved : ' + arg)
        var img_src =list[number]
        fs.unlink(img_src, (err) => {
            if (err) {
                throw err;
            }
         console.log('image deleted')
         socket.emit('deleted',arg)
        })

    })

  });


app.use('/images', express.static('images'));

app.get('/',function(req,res){  
    res.setHeader('content-Type', 'text/html');
    //console.log(img_src)
    fs.readFile('./image_player_essai.html','utf-8',(err, data) => {
        if(err){
            console.log(err);
            res.end();
        }else {
            //console.log(img_src)
            res.end(data);
        }
    })


});

app.use(upload());

app.post('/img', (req, res) => {

    
    let filee = req.files.uploader;
    let filename = filee.name
    filee.mv('./images/' + filename, function (err) {
        if (err) { res.send(err); }
      });
    res.redirect('/')
  });

function getImagesFromDir(dirPath){
    let allImages=[]
    let files =fs.readdirSync(dirPath)
    //console.log(files)
    for(file in files){
        files[file]="images/"+ files[file]
    }
    return files

}

function saveImageToDisk(url,path){
    var fullUrl =url
    console.log("dans la fonction save")
    var localPath = fs.createWriteStream(path)
    var request =http.get(fullUrl, function(response){
        console.log(response)
        response.pipe(localPath)
    })
}





server.listen(3000, 'localhost',() =>{
    console.log('Listening for requests on port 3000');
});
module.exports = app;