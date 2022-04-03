var socket = io();
socket.on('hello', function (data) { // réception 'hello'
    console.log('le premier socket arrive ');
});

var nb=0;
// Ajout evenement boutton next
document.getElementById("next").addEventListener('click', function (e) {
    console.log('Next button clicked');
    nb=nb+1;
    socket.emit('nb', nb)
    console.log('nb image emitted : '+nb);

});


//Ajout evenement boutton back
document.getElementById("back").addEventListener('click', function (e) {
    console.log('Back button clicked');
    //socket.emit('nb', e.target.textContent)
    //console.log('nb image emitted : ');

});

