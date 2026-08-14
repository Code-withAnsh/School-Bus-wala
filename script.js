const songNames = [
  "Pehla Nasha",
  "Dheere Dheere Se",
  "Chura Ke Dil Mera",
  "Aankhon Ki Gustakhiyan",
  "Kya Kasoor Hai",
  "Dil Ne Yeh Kaha",
  "Tujhe Dekha To",
  "Pardesi Pardesi",
  "Tip Tip Barsa Pani",
  "Laila O Laila",
  "Mere Sapno Ki Rani",
  "O Meri Jaan",
  "Maanglahi Teri Dhoop",
  "Tu Mere Samne",
  "Main Khiladi Tu Anari",
  "Jaane Jigar",
  "Aaj Phir Jeene Ki Tamanna Hai",
  "Aati Kya Khandala",
  "Rajaji Teri Aankhon Ka",
];

const tracks = songNames.map((title, index) => ({
  title,
  artist: "90s Bollywood Mix",
  mp3: `songs/segment_${String(index).padStart(2, "0")}.mp3`,
  cover:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80",
}));

const audioPlayer = document.getElementById("audio-player");
const titleEl = document.getElementById("track-title");
const artistEl = document.getElementById("track-artist");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const timeDisplay = document.getElementById("time-display");
const albumArt = document.getElementById("album-art");
const prevBtn = document.getElementById("btn-prev");
const nextBtn = document.getElementById("btn-next");
const playPauseBtn = document.getElementById("btn-play-pause");
const playlistToggleBtn = document.getElementById("btn-playlist-toggle");
const playlistPanel = document.getElementById("playlist-panel");
const playlistList = document.getElementById("playlist-list");
const closePlaylistBtn = document.getElementById("btn-close-playlist");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");

let trackIndex = 0;
let isPlaying = false;
let isSwitchingTrack = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function updatePlayButton() {
  if (isPlaying) {
    iconPlay.classList.add("hidden");
    iconPause.classList.remove("hidden");
  } else {
    iconPlay.classList.remove("hidden");
    iconPause.classList.add("hidden");
  }
}

function updateProgressUI() {
  const duration = Number.isFinite(audioPlayer.duration)
    ? audioPlayer.duration
    : 0;
  const current = Number.isFinite(audioPlayer.currentTime)
    ? audioPlayer.currentTime
    : 0;
  const percentage = duration ? (current / duration) * 100 : 0;

  progressBar.value = current;
  progressBar.max = duration || 100;
  progressBar.style.setProperty("--progress", `${percentage}%`);
  progressFill.style.width = `${percentage}%`;
  timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
}

function renderPlaylist() {
  playlistList.innerHTML = tracks
    .map(
      (track, index) => `
        <li>
          <button
            type="button"
            class="playlist-item ${index === trackIndex ? "active" : ""}"
            data-index="${index}"
          >
            ${index + 1}. ${track.title}
          </button>
        </li>
      `,
    )
    .join("");

  playlistList.querySelectorAll(".playlist-item").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.dataset.index);
      selectTrack(selectedIndex);
      playlistPanel.classList.add("hidden");
    });
  });
}

function loadTrack(index, autoplay = isPlaying) {
  const track = tracks[index];
  if (!track) return;

  isSwitchingTrack = true;
  const shouldPlay = autoplay;

  trackIndex = index;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  albumArt.src = track.cover || albumArt.src;

  audioPlayer.pause();
  audioPlayer.src = track.mp3;
  audioPlayer.load();
  audioPlayer.currentTime = 0;
  progressBar.value = 0;
  progressFill.style.width = "0%";
  timeDisplay.textContent = "0:00 / 0:00";
  renderPlaylist();

  if (shouldPlay) {
    const playPromise = audioPlayer.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      isSwitchingTrack = false;
    }, 150);
  });
}

function selectTrack(index) {
  loadTrack(index, true);
}

function nextTrack() {
  if (isSwitchingTrack) return;
  const nextIndex = (trackIndex + 1) % tracks.length;
  loadTrack(nextIndex, true);
}

function prevTrack() {
  if (isSwitchingTrack) return;
  const prevIndex = (trackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(prevIndex, true);
}

function togglePlayPause() {
  if (!audioPlayer.src) {
    loadTrack(trackIndex, true);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => {});
  } else {
    audioPlayer.pause();
  }
}

playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);
playlistToggleBtn.addEventListener("click", () => {
  playlistPanel.classList.toggle("hidden");
});
closePlaylistBtn.addEventListener("click", () => {
  playlistPanel.classList.add("hidden");
});

progressBar.addEventListener("input", (event) => {
  const newTime = Number(event.target.value);
  if (Number.isFinite(newTime)) {
    audioPlayer.currentTime = newTime;
    updateProgressUI();
  }
});

audioPlayer.addEventListener("loadedmetadata", () => {
  progressBar.max = audioPlayer.duration || 100;
  updateProgressUI();

  if (isPlaying && audioPlayer.paused) {
    const playPromise = audioPlayer.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
  }
});

audioPlayer.addEventListener("timeupdate", updateProgressUI);
audioPlayer.addEventListener("play", () => {
  isPlaying = true;
  updatePlayButton();
  isSwitchingTrack = false;
});
audioPlayer.addEventListener("pause", () => {
  isPlaying = false;
  updatePlayButton();
});
audioPlayer.addEventListener("ended", () => {
  if (!isSwitchingTrack) {
    nextTrack();
  }
});

renderPlaylist();
loadTrack(trackIndex, false);
