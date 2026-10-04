// 1. Notes: keyboard letter -> note name + frequency (Hz)
const notes = {
  // white keys
  a: { name: "C (Do)",  freq: 262 },
  s: { name: "D (Re)",  freq: 294 },
  d: { name: "E (Mi)",  freq: 330 },
  f: { name: "F (Fa)",  freq: 349 },
  g: { name: "G (Sol)", freq: 392 },
  h: { name: "A (La)",  freq: 440 },
  j: { name: "B (Ti)",  freq: 494 },
  k: { name: "C (Do)",  freq: 523 },
  // black keys (sharps)
  w: { name: "C#", freq: 277 },
  e: { name: "D#", freq: 311 },
  t: { name: "F#", freq: 370 },
  y: { name: "G#", freq: 415 },
  u: { name: "A#", freq: 466 }
};

// 2. Page elements we need
const lastNoteText = document.querySelector("#lastNote");
const waveSelect = document.querySelector("#waveType");

// 3. Sound
const ctx = new AudioContext();
let waveType = "sine";                  // changed by the dropdown

function playNote(freq) {
  const osc = ctx.createOscillator();
  const volume = ctx.createGain();      // lowers the volume (square/saw are loud)
  osc.type = waveType;
  osc.frequency.value = freq;
  volume.gain.value = 0.3;
  osc.connect(volume);
  volume.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

// 4. Two reusable functions: used by BOTH keyboard and mouse
function pressKey(letter) {
  if (!(letter in notes)) return;       // unknown key -> do nothing
  if (ctx.state === "suspended") ctx.resume();

  document.querySelector('[data-key="' + letter + '"]').classList.add("active");
  playNote(notes[letter].freq);
  lastNoteText.textContent = notes[letter].name;   // show last note
  checkSong(letter);                               // song mode
}

function releaseKey(letter) {
  if (!(letter in notes)) return;
  document.querySelector('[data-key="' + letter + '"]').classList.remove("active");
}

// 5. Keyboard events
// e.code is the physical key ("KeyA"), so it works with any language keyboard
function getLetter(e) {
  return e.code.replace("Key", "").toLowerCase();
}

document.addEventListener("keydown", function (e) {
  if (e.repeat) return;                 // ignore auto-repeat
  pressKey(getLetter(e));
});

document.addEventListener("keyup", function (e) {
  releaseKey(getLetter(e));
});

// 6. Mouse events (bonus): one set of listeners on every .key
document.querySelectorAll(".key").forEach(function (keyDiv) {
  const letter = keyDiv.dataset.key;    // reads data-key="a"

  keyDiv.addEventListener("mousedown", function () { pressKey(letter); });
  keyDiv.addEventListener("mouseup",   function () { releaseKey(letter); });
  keyDiv.addEventListener("mouseleave", function () { releaseKey(letter); });
});

// 7. Sound selector (bonus): "change" event on the dropdown
waveSelect.addEventListener("change", function () {
  waveType = waveSelect.value;
  waveSelect.blur();                    // so typing letters doesn't change the dropdown
});

// 8. Song mode (bonus) + next-key hint
// Each song is a list of keyboard letters, in the order to play them
const songs = {
  twinkle: ["a","a","g","g","h","h","g",  "f","f","d","d","s","s","a"],
  ode:     ["d","d","f","g","g","f","d","s","a","a","s","d","d","s","s"]
};

const songSelect   = document.querySelector("#songSelect");
const songLetters  = document.querySelector("#songLetters");
const songStatus   = document.querySelector("#songStatus");

let currentSong = null;   // the array of letters, or null when no song is active
let step = 0;             // which letter the player must press next

function clearHint() {
  document.querySelectorAll(".key.hint").forEach(function (k) {
    k.classList.remove("hint");
  });
}

// Show the whole song as letters; done = played, current = next to play
function drawSongLetters() {
  songLetters.innerHTML = "";
  currentSong.forEach(function (letter, i) {
    const span = document.createElement("span");
    span.textContent = letter.toUpperCase();
    if (i < step) span.className = "done";
    if (i === step) span.className = "current";
    songLetters.appendChild(span);
  });
}

// Light up the piano key that must be pressed next
function showHint() {
  clearHint();
  if (step < currentSong.length) {
    document.querySelector('[data-key="' + currentSong[step] + '"]').classList.add("hint");
  }
}

function startSong() {
  currentSong = songs[songSelect.value];
  step = 0;
  songStatus.textContent = "Play the glowing key!";
  drawSongLetters();
  showHint();
}

function stopSong() {
  currentSong = null;
  clearHint();
  songLetters.innerHTML = "";
  songStatus.textContent = "Choose a song and press Start.";
}

// Called from pressKey() every time a note is played
function checkSong(letter) {
  if (currentSong === null) return;        // no song running
  if (letter !== currentSong[step]) return; // wrong key: just keep waiting

  step++;
  if (step === currentSong.length) {        // song finished
    songStatus.textContent = "Well done! You played the whole song.";
    drawSongLetters();
    clearHint();
    currentSong = null;
  } else {
    drawSongLetters();
    showHint();
  }
}

document.querySelector("#startSong").addEventListener("click", function (e) {
  startSong();
  e.target.blur();                          // keep keyboard focus off the button
});
document.querySelector("#stopSong").addEventListener("click", function (e) {
  stopSong();
  e.target.blur();
});
songSelect.addEventListener("change", function () {
  songSelect.blur();
  stopSong();
});
