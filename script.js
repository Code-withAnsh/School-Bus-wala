const MASTER_TRACK_SRC = encodeURI(
  "songs/90s Bollywood All Time Hit Songs 90s Evergreen Songs 90s Hits Hindi Songs 90s Old Is Gold Songs.mp3",
);

const trackMarkers = [
  { title: "Chunnari Chunnari", start: "00:00" },
  { title: "Teri Chunnariya", start: "04:56" },
  { title: "Pyar Dilon Ka Mela", start: "09:28" },
  { title: "Chupke Se Koi Aayega", start: "14:26" },
  { title: "Meri Tarah", start: "19:30" },
  { title: "Meri Mehbooba", start: "24:07" },
  { title: "Dil Laga Liya", start: "29:41" },
  { title: "Aaye Ho Meri Zindagi", start: "33:53" },
  { title: "Mohabbat Dil Ka Sakoon", start: "39:49" },
  { title: "Sona Kitna Sona Hai", start: "45:22" },
  { title: "Aa Jaana Aa Jana", start: "50:06" },
  { title: "Raah Mein Unse", start: "55:22" },
  { title: "Mile Jo Tere Naina", start: "01:03:57" },
];

function toSeconds(value) {
  const parts = value.split(":").map((piece) => Number(piece));
  if (parts.some((piece) => !Number.isFinite(piece))) {
    return 0;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

const tracks = trackMarkers.map((marker, index) => ({
  title: marker.title,
  artist: "90s Bollywood Mix",
  startLabel: marker.start,
  startSeconds: toSeconds(marker.start),
  endSeconds:
    index < trackMarkers.length - 1
      ? toSeconds(trackMarkers[index + 1].start)
      : null,
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
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getTrackEnd(index) {
  const track = tracks[index];
  if (!track) {
    return 0;
  }

  if (Number.isFinite(track.endSeconds)) {
    return track.endSeconds;
  }

  if (Number.isFinite(audioPlayer.duration) && audioPlayer.duration > track.startSeconds) {
    return audioPlayer.duration;
  }

  return track.startSeconds;
}

function getTrackDuration(index) {
  const track = tracks[index];
  if (!track) {
    return 0;
  }

  return Math.max(0, getTrackEnd(index) - track.startSeconds);
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
  const track = tracks[trackIndex];
  if (!track) {
    return;
  }

  const segmentDuration = getTrackDuration(trackIndex);
  const absoluteCurrent = Number.isFinite(audioPlayer.currentTime)
    ? audioPlayer.currentTime
    : track.startSeconds;
  const segmentCurrent = Math.min(
    Math.max(0, absoluteCurrent - track.startSeconds),
    segmentDuration,
  );
  const percentage = segmentDuration ? (segmentCurrent / segmentDuration) * 100 : 0;

  progressBar.value = segmentCurrent;
  progressBar.max = segmentDuration || 100;
  progressBar.style.setProperty("--progress", `${percentage}%`);
  progressFill.style.width = `${percentage}%`;
  timeDisplay.textContent = `${formatTime(segmentCurrent)} / ${formatTime(segmentDuration)}`;
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
            ${index + 1}. ${track.title} <span class="track-start-time">(${track.startLabel})</span>
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

function startSelectedTrack(autoplay) {
  const track = tracks[trackIndex];
  if (!track) {
    return;
  }

  audioPlayer.currentTime = track.startSeconds;
  updateProgressUI();

  if (autoplay) {
    const playPromise = audioPlayer.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
  }
}

function loadTrack(index, autoplay = isPlaying) {
  const track = tracks[index];
  if (!track) {
    return;
  }

  isSwitchingTrack = true;
  trackIndex = index;

  titleEl.textContent = `${index + 1}. ${track.title}`;
  artistEl.textContent = `90s Bollywood Mix • Starts at ${track.startLabel}`;
  albumArt.src = track.cover || albumArt.src;
  renderPlaylist();

  const shouldReplaceSource = !audioPlayer.src || !audioPlayer.src.includes("90s%20Bollywood");
  if (shouldReplaceSource) {
    audioPlayer.pause();
    audioPlayer.src = MASTER_TRACK_SRC;
    audioPlayer.load();
  }

  if (audioPlayer.readyState >= 1) {
    startSelectedTrack(autoplay);
  } else {
    audioPlayer.addEventListener(
      "loadedmetadata",
      () => {
        startSelectedTrack(autoplay);
      },
      { once: true },
    );
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      isSwitchingTrack = false;
    }, 120);
  });
}

function selectTrack(index) {
  loadTrack(index, true);
}

function nextTrack() {
  if (isSwitchingTrack) {
    return;
  }
  const nextIndex = (trackIndex + 1) % tracks.length;
  loadTrack(nextIndex, true);
}

function prevTrack() {
  if (isSwitchingTrack) {
    return;
  }
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
  const segmentOffset = Number(event.target.value);
  const track = tracks[trackIndex];
  if (!track || !Number.isFinite(segmentOffset)) {
    return;
  }

  audioPlayer.currentTime = track.startSeconds + segmentOffset;
  updateProgressUI();
});

audioPlayer.addEventListener("loadedmetadata", () => {
  updateProgressUI();
});

audioPlayer.addEventListener("timeupdate", () => {
  const trackEnd = getTrackEnd(trackIndex);
  if (!isSwitchingTrack && trackEnd > 0 && audioPlayer.currentTime >= trackEnd - 0.12) {
    nextTrack();
    return;
  }

  updateProgressUI();
});

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
