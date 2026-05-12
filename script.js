const changingText = document.getElementById("changing-text");

const texts = [
    "Electrical Engineering Student",
    "I used to use Arch btw",
    "Casual Programmer",
    "Really Good Video Gamer",
    "Building Weird Internet Things"
];

let index = 0;

setInterval(() => {

    index++;

    if (index >= texts.length) {
        index = 0;
    }

    changingText.textContent = texts[index];

}, 2500);

/* MUSIC PLAYER */

const toggleMusicBtn = document.getElementById("toggle-music-btn");
const musicControls = document.getElementById("music-controls");
const musicBtn = document.getElementById("music-btn");
const music = document.getElementById("bg-music");
const seekbar = document.getElementById("seekbar");
const volumeSlider = document.getElementById("volume");

let playing = false;

// Remove loop attribute to play once
music.removeAttribute("loop");

// Toggle music controls visibility
toggleMusicBtn.addEventListener("click", () => {
    const isVisible = musicControls.style.display !== "none";
    musicControls.style.display = isVisible ? "none" : "flex";
    toggleMusicBtn.setAttribute("aria-expanded", String(!isVisible));
    musicControls.setAttribute("aria-hidden", String(isVisible));
});

// Play/Pause button
musicBtn.addEventListener("click", () => {
    if (!playing) {
        music.play();
        musicBtn.textContent = "⏸ Pause";
        playing = true;
    } else {
        music.pause();
        musicBtn.textContent = "▶ Play";
        playing = false;
    }
});

// Update seekbar as music plays
music.addEventListener("timeupdate", () => {
    if (!seekbar.disabled) {
        seekbar.value = (music.currentTime / music.duration) * 100 || 0;
    }
});

// Seekbar input
seekbar.addEventListener("input", (e) => {
    const newTime = (e.target.value / 100) * music.duration;
    music.currentTime = newTime;
});

// Volume control
volumeSlider.addEventListener("input", (e) => {
    music.volume = e.target.value / 100;
});

// Reset when music ends
music.addEventListener("ended", () => {
    playing = false;
    musicBtn.textContent = "▶ Play";
    seekbar.value = 0;
});

// Set initial volume
music.volume = 0.7;