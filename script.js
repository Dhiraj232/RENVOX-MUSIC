let player;
let songIndex = 0;
let progressTimer;

// 🎶 REAL HINDI SONGS (YouTube VIDEO IDs)
const songs = [
  { name: "Hindi Song 1", videoId: "kJQP7kiw5Fk" },
  { name: "Hindi Song 2", videoId: "JGwWNGJdvx8" },
  { name: "Hindi Song 3", videoId: "RgKAFK5djSk" },
  { name: "Hindi Song 4", videoId: "OPf0YbXqDm0" },
  { name: "Hindi Song 5", videoId: "fRh_vgS2dFE" },
  { name: "Hindi Song 6", videoId: "60ItHLz5WEA" }
];

const songContainer = document.getElementById("songContainer");
const masterPlay = document.getElementById("masterPlay");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const nowPlayingEl = document.getElementById("nowPlaying");

// LOAD SONG LIST
songs.forEach((song, i) => {
    songContainer.innerHTML += `
        <div class="songItem">
            <span class="songName">${song.name}</span>
            <i class="fa-solid fa-play" onclick="playSong(${i})"></i>
        </div>
    `;
});

// YOUTUBE PLAYER
function onYouTubeIframeAPIReady() {
    player = new YT.Player("ytplayer", {
        height: "0",
        width: "0",
        videoId: songs[songIndex].videoId,
        playerVars: { autoplay: 0, controls: 0 },
        events: {
            onStateChange: onPlayerStateChange
        }
    });
}

function playSong(index){
    songIndex = index;
    player.loadVideoById(songs[songIndex].videoId);
    masterPlay.className = "fa-solid fa-pause-circle";
    nowPlayingEl.innerText = songs[songIndex].name;
}

// PLAY / PAUSE
masterPlay.addEventListener("click", ()=>{
    if(player.getPlayerState() !== YT.PlayerState.PLAYING){
        player.playVideo();
        masterPlay.className = "fa-solid fa-pause-circle";
    } else {
        player.pauseVideo();
        masterPlay.className = "fa-solid fa-play-circle";
    }
});

// NEXT / PREVIOUS
document.getElementById("next").addEventListener("click", ()=>{
    songIndex = (songIndex + 1) % songs.length;
    playSong(songIndex);
});

document.getElementById("previous").addEventListener("click", ()=>{
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    playSong(songIndex);
});

// PROGRESS & TIME (YouTube)
function onPlayerStateChange(event){
    if(event.data === YT.PlayerState.PLAYING){
        clearInterval(progressTimer);
        progressTimer = setInterval(updateProgress, 1000);
    }
}

function updateProgress(){
    const current = player.getCurrentTime();
    const duration = player.getDuration();

    if(duration){
        progressBar.value = (current / duration) * 100;
        currentTimeEl.innerText = formatTime(current);
        totalTimeEl.innerText = formatTime(duration);
    }
}

progressBar.addEventListener("input", ()=>{
    const seekTo = (progressBar.value / 100) * player.getDuration();
    player.seekTo(seekTo, true);
});

function formatTime(sec){
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
}