
var express = require('express');
app = express();
http = require('http');
var fs = require('fs');
path = require('path');



var fs = require('fs');
const server = http.createServer(function(req,res){
    const fs = require('fs').promises;
      fs.readFile( "image_player.html").then(contents => {
       res.setHeader("Content-Type", "text/html");
       res.writeHead(200);
       res.end(contents);
    })
})    
app.get('/', function (req, res) {
    var im =getImagesFromDir(path.join(__dirname,'images'))
    var img=path.join(__dirname,'images',im[2])
    var img_src ="images/"+im[2]
    console.log(img_src)


    var readStream = fs.createReadStream(img_src);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(response);
    })

/*
var im =getImagesFromDir(path.join(__dirname,'images'))
var img=path.join(__dirname,'images',im[2])
console.log(img) 
//console.log(path.join(__dirname,'images'))
fs.readFile('image_player.html','utf8', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var img_src ="images/"+im[2]
    console.log(img_src)
    data=data.replace('{{image_url}}',img_src)
    res.end(data); // Send the file data to the browser.

  });*/
//})





function getImagesFromDir(dirPath){
    let allImages=[]
    let files =fs.readdirSync(dirPath)
    //console.log(files)
    /*for(file in files){
        let fileLocation =path.join(dirPath,file)
        console.log("avant stat")
        const stat = fs.statSync(fileLocation)
        if(stat && stat.isDirectory()){
            getImagesFromDir(fileLocation)
        }
        else if(stat && stat.isFile() && ['.jpg','png'].indexOf(path.extname(fileLocation)) !== -1)
        {allImages.push('static/'+file)}

    }*/
    //for(file in files)
    //{console.log(files[file])}

    return files

}
/*
const server = http.createServer(function(req, res) {
    //A partie d'un fichier HTML
    const fs = require('fs').promises;
     fs.readFile(  "image_player.html").then(contents => {
        console.log("dans la readfile")
        images =getImagesFromDir(path.join(__dirname,'images'))

        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(contents);
      })
         
  })



//app.use('/static',express.static(path.join(__dirname,'images')))

/*
function getImagesFromDir(dirPath){
    let allImages=[]
    let files =fs.readdirSync(dirPath)
    for(file in files){
        let fileLocation =path.join(dirPath,file)
        var stat = fs.statSync(fileLocation)
        if(stat && stat.isDirectory()){
            getImagesFromDir(fileLocation)
        }
        else if(stat && stat.isFile() && ['.jpg','png'].indexOf(path.extname(fileLocation)) !== -1)
        {allImages.push('static/'+file)}

    }
     
    return allImages

}*/

server.listen(8080, () => {
    console.log('listening on *:8080');
  });
  //module.exports = app;