// ========================================
// 🎵 RENVOX MUSIC PLAYER — HTML5 AUDIO
// ========================================

const songs = [
    { name: "Main To Ek Khwab Hoon", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/01.01.%20Main%20To%20Ek%20Khwab%20Hoon.mp3" },
    { name: "Chand Aahen Bharega", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/01.02.%20Chand%20Aahen%20Bharega.mp3" },
    { name: "Jis Dil Men Basa Tha", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/01.03.%20Jis%20Dil%20Men%20Basa%20Tha.mp3" },
    { name: "Diwanon Se Ye Mat Poochho", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/01.04.%20Diwanon%20Se%20Ye%20Mat%20Poochho.mp3" },
    { name: "Mere Toote Hue Dil Se", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/01.05.%20Mere%20Toote%20Hue%20Dil%20Se.mp3" },
    { name: "Chandan Sa Badan", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/01.06.%20Chandan%20Sa%20Badan.mp3" },
    { name: "Mujh Ko Is Raat Ki", artist: "Mukesh | Kalyanji-Anandji", src: "https://archive.org/download/lp_a-selection-of-hindi-film-songs_kalyanji-anandji-mukesh/disc1/02.01.%20Mujh%20Ko%20Is%20Raat%20Ki.mp3" }
];

// ---- DOM Elements ----
const songContainer = document.getElementById("songContainer");
const masterPlay = document.getElementById("masterPlay");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const nowPlayingEl = document.getElementById("nowPlaying");

// ---- Audio ----
const audio = new Audio();
let currentIndex = -1;
let isPlaying = false;

// ---- Build Song List ----
songs.forEach((song, i) => {
    const div = document.createElement("div");
    div.className = "songItem";
    div.id = `song-${i}`;
    div.innerHTML = `
        <span class="song-number">${i + 1}</span>
        <div class="songInfo">
            <span class="songName">${song.name}</span>
            <span class="songArtist">${song.artist}</span>
        </div>
        <i class="fa-solid fa-play songPlayBtn" id="btn-${i}" onclick="playSong(${i})"></i>
    `;
    songContainer.appendChild(div);
});

// ---- Play Song ----
function playSong(index) {
    if (currentIndex >= 0) {
        const prevBtn = document.getElementById(`btn-${currentIndex}`);
        const prevItem = document.getElementById(`song-${currentIndex}`);
        if (prevBtn) prevBtn.className = "fa-solid fa-play songPlayBtn";
        if (prevItem) {
            prevItem.classList.remove("active-song");
            const numEl = prevItem.querySelector(".song-number");
            if (numEl) numEl.textContent = currentIndex + 1;
        }
    }

    currentIndex = index;
    audio.src = songs[index].src;
    audio.play();
    isPlaying = true;

    masterPlay.className = "fa-solid fa-pause-circle";
    nowPlayingEl.innerText = `🎵 ${songs[index].name} — ${songs[index].artist}`;

    const btn = document.getElementById(`btn-${index}`);
    const item = document.getElementById(`song-${index}`);
    if (btn) btn.className = "fa-solid fa-pause songPlayBtn";
    if (item) {
        item.classList.add("active-song");
        const numEl = item.querySelector(".song-number");
        if (numEl) numEl.innerHTML = '<i class="fa-solid fa-volume-high" style="font-size:12px;"></i>';
    }
}

// ---- Play / Pause ----
masterPlay.addEventListener("click", () => {
    if (currentIndex === -1) { playSong(0); return; }
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        masterPlay.className = "fa-solid fa-play-circle";
        const btn = document.getElementById(`btn-${currentIndex}`);
        if (btn) btn.className = "fa-solid fa-play songPlayBtn";
    } else {
        audio.play();
        isPlaying = true;
        masterPlay.className = "fa-solid fa-pause-circle";
        const btn = document.getElementById(`btn-${currentIndex}`);
        if (btn) btn.className = "fa-solid fa-pause songPlayBtn";
    }
});

// ---- Next / Previous ----
document.getElementById("next").addEventListener("click", () => {
    playSong((currentIndex + 1) % songs.length);
});
document.getElementById("previous").addEventListener("click", () => {
    playSong((currentIndex - 1 + songs.length) % songs.length);
});

// ---- Auto Next ----
audio.addEventListener("ended", () => playSong((currentIndex + 1) % songs.length));

// ---- Progress ----
audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.innerText = formatTime(audio.currentTime);
        totalTimeEl.innerText = formatTime(audio.duration);
    }
});

progressBar.addEventListener("input", () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// ---- Search ----
const searchInput = document.querySelector(".search-container input");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        songs.forEach((song, i) => {
            const item = document.getElementById(`song-${i}`);
            if (item) {
                const match = song.name.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
                item.style.display = match ? "flex" : "none";
            }
        });
    });
}

// ---- Format Time ----
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
}