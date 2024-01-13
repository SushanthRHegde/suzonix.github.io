console.log("Hello, This is my Music Website named SUZONIX !!");
let songs;
let currentSong = new Audio();
let currFolder;

async function playNextSong() {
    await getSongs(currFolder);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 <= songs.length - 1) {
        playMusic(songs[index + 1]);
    }
}
function shufflePlaylist() {
    // Shuffle the songs array
    for (let i = songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [songs[i], songs[j]] = [songs[j], songs[i]];
    }

    // Play the first song after shuffling
    playMusic(songs[0]);
}


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    var formattedMinutes = (minutes < 10) ? '0' + minutes : minutes;
    var formattedSeconds = (remainingSeconds < 10) ? '0' + remainingSeconds : remainingSeconds;

    return formattedMinutes + ':' + formattedSeconds;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ol")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = song.replaceAll("%20", " ");
        let displayName = songName;
        if (displayName.endsWith(".mp3")) {
            displayName = displayName.replace(".mp3", "");
        }
        songUL.innerHTML =
            songUL.innerHTML +
            `<li> 
        <div class="info">
            <div class="songName" data-song="${songName}">${displayName}</div>
            <div class="songArtist"></div>
        </div>
        <img src="images/cards/playnow.png" alt="">
        </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".info").firstElementChild.dataset.song.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    const displaySongName = track.replace(".mp3", "").replaceAll("%20", " ");
    document.querySelector(".songinfo").innerHTML = decodeURI(displaySongName);
    if (!pause) {
        currentSong.play();
        play.src = "images/playbar/pause.png";
    }
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
    // for getting the list of all songs
    await getSongs("songs/anuv");
    playMusic(songs[0], true);

    // Attach an event listener to play, next, and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/playbar/pause.png";
        } else {
            currentSong.pause();
            play.src = "images/playbar/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}
        / ${secondsToMinutesSeconds(currentSong.duration)} `;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hameburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", async (e) => {
        await getSongs(currFolder);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        currentSong.pause();
        play.src = "images/playbar/play.svg";
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", async (e) => {
        await getSongs(currFolder);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        currentSong.pause();
        play.src = "images/playbar/play.svg";
        if (index + 1 <= songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });

    currentSong.addEventListener("ended", async () => {
        await playNextSong();
    });

    document.getElementById("shuffle").addEventListener("click", () => {
        shufflePlaylist();
    });
    

    // Add this JavaScript to your existing script


}

main();
