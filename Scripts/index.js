//chargement des sockets 
var socket = io();
var id
//rechargement du fenetre 
function reload() {
    window.location.reload()
}
//engendre l'attente d'une fonction en delivrant un promise
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//chargemet du data necessaire pour le foinctionnement du front 

async function loaddata() {
    socket.on('playlist', (results) => {
        console.log(results)
        id = results

        console.log(results[0]['id'])
        var playlist = document.querySelector(".play")
        for (i = 0; i < results.length; i++) {
            console.log(results.length)
            playlist.innerHTML = playlist.innerHTML + "<p id='" + results[i]['id'] + "'>" + results[i]['name'] + "</p>"
        }
        const play = sessionStorage.getItem('play')
        if (play !== null) {
            console.log(play)
            var s = document.createElement('source')
            s.src = '/video/' + id[play - 1]['id']
            var videoTag = document.querySelector('video')
            videoTag.appendChild(s)
            //console.log('<source src="/video/'+play+'" id="source" type="video/mp4" />')
            //videoTag.innerHTML='<source src="/video/'+play+'" id="source" type="video/mp4" />'
        }
    })
    sleep(100).then(() => { events(); });
}
//configuration des differentes evenements
async function events() {
    //chargement du playlist 
    const pTab = document.querySelectorAll('p');
    const play = sessionStorage.getItem('play')
    if (play !== null) {
        pTab[play - 1].style.backgroundColor = "rgb(37,37,37)"
        pTab[play - 1].style.color = "white"
    }
    //assurer la continuité du playlist : si un media se termine un autre commence 
    var stateVid = document.querySelector('video')
    stateVid.addEventListener("ended", function () {
        const play = Number(sessionStorage.getItem('play'));
        if (play <= pTab.length - 1) {
            socket.emit('title', id[play]['id'])

            sessionStorage.setItem('play', play + 1);
            window.location.reload();
        }
    });


    //adding events to all texts in playlist


    pTab.forEach((element, index) => {
        element.addEventListener('click', (e) => {
            socket.emit('title', id[index]['id']);
            sessionStorage.setItem('play', index + 1);
            window.location.reload();

        })
    });

    //adding events to buttons 
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function () {
            return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
        }
    })
    //configuration du bouton start
    document.getElementById('start').addEventListener('click', (e) => {
        var vid = false;

        if (document.querySelector('video').playing) {
            vid = true;
        }
        if ((!vid) && (sessionStorage.getItem('play') !== null)) {
            socket.emit('title', id[sessionStorage.getItem('play')]['id'])
            window.location.reload();
        }
        if ((!vid) && (sessionStorage.getItem('play') == null)) {
            socket.emit('title', id[0]['id'])
            sessionStorage.setItem('play', 1);
            window.location.reload();
        }

    });
    //configuration du bouton stop
    document.getElementById('stop').addEventListener('click', (e) => {
        const video = document.querySelector('video');
        sessionStorage.removeItem("play")
        window.location.reload();
        video.currentTime = 0;
        video.pause();
    });
    //configuration du bouton next
    document.getElementById('next').addEventListener('click', (e) => {
        const play = Number(sessionStorage.getItem('play'));
        if (play <= pTab.length - 1) {
            socket.emit('title', id[play]['id'])

            sessionStorage.setItem('play', play + 1);
            window.location.reload();
        }
        else {
            window.location.reload();
        }
    });
    //configuration du bouton previous 
    document.getElementById('previous').addEventListener('click', (e) => {
        const play = Number(sessionStorage.getItem('play')) - 1;
        if (play >= 1) {

            socket.emit('title', id[play]['id'])
            sessionStorage.setItem('play', play);
            window.location.reload();
        }
        else {
            window.location.reload();
        }
    });
    //configuration du bouton resume 
    document.getElementById('resume').addEventListener('click', (e) => {
        const video = document.querySelector('video');
        video.play();
    });
    //configurer la bouton pause
    document.getElementById('pause').addEventListener('click', (e) => {
        const video = document.querySelector('video');
        video.pause();
    });
    //configurer la bouton delete 
    document.getElementById('dell').addEventListener('click', (e) => {
       reset();
    });
    // controle du pop-up

    var modal = document.getElementById("myModal");
    var btn = document.getElementById("addbtn");
    var span = document.querySelector(".close");
    var modals = document.getElementById("myModals");
    var btns = document.getElementById("delete");
    var spans = document.querySelector(".closes");
    // When the user clicks the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    // When the user clicks the button, open the modal 
    btns.onclick = function () {
        modals.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    spans.onclick = function () {
        modals.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modals) {
            modals.style.display = "none";
        }
    }
}
//reset le video selectionné suite a un delete 

function reset()
{
    sessionStorage.setItem('play', 1);
}
//appl du fonction loaddata()
loaddata();
