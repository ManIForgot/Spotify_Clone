let currentsong = new Audio();
let songs;
let currentfolder;
async function getsongs(folder) {
    currentfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="" srcset="">
            <div class="info">
              <div>${song.replaceAll("%20", " ")}</div>
              <div>artist</div>
            </div>
            <div class="playnow">
              <span>Play Now</span>
              <img src="play.svg" alt="" class="invert">
            </div></li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

}
const playmusic = (track, pause = false) => {

    currentsong.src = `/${currentfolder}/` + track;
    if (!pause) {

        currentsong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"



}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]

            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="heavy" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                  fill="currentColor" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpEg" alt="">
            <h2>${response.name}</h2>
            <p>${response.discription}</p>
          </div>`
        }

    }
 
}

async function main() {

    await getsongs("songs/heavy")
    playmusic(songs[0], true)

    // display all the albums
    displayalbums()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        if (isNaN(currentsong.duration) || currentsong.duration < 0) {

            return "0:00";
        }
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = `${currentsong.currentTime / currentsong.duration * 100}%`
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        console.log(e.offsetX, e.target.offsetWidth)
        let pos = e.offsetX / e.target.offsetWidth
        currentsong.currentTime = pos * currentsong.duration
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        if (songs.indexOf(currentsong.src.split("/songs/")[1]) == 0) {
            playmusic(songs[songs.length - 1])
        }
        else {
            playmusic(songs[songs.indexOf(currentsong.src.split("/songs/")[1]) - 1])
        }

    })

    next.addEventListener("click", () => {
        if (songs.indexOf(currentsong.src.split("/songs/")[1]) == songs.length - 1) {
            playmusic(songs[0])
        }
        else {
            playmusic(songs[songs.indexOf(currentsong.src.split("/songs/")[1]) + 1])
        }
    })

    const volumeInput = document.querySelector(".range input");
    if (volumeInput) {
        volumeInput.addEventListener("change", (e) => {

            currentsong.volume = parseInt(e.target.value) / 100;
        });
    } else {
        console.error("Volume input element not found");
    }


    Array.from(document.getElementsByClassName("card")).forEach(async e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
        });

    });


}

main()

