const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const state = {
  score: 0,
  lives: 3,
  gameOver: false,
  player: {
    x: canvas.width / 2 - 40,
    y: canvas.height - 40,
    width: 80,
    height: 16,
    speed: 320,
  },
  stars: [],
  keys: {
    left: false,
    right: false,
  },
  spawnTimer: 0,
};

function resetGame() {
  state.score = 0;
  state.lives = 3;
  state.gameOver = false;
  state.player.x = canvas.width / 2 - 40;
  state.stars = [];
  state.spawnTimer = 0.5;
  statusEl.textContent = "Catch stars to score points. Avoid letting them hit the ground.";
  updateHud();
}

function updateHud() {
  scoreEl.textContent = `Score: ${state.score}`;
  livesEl.textContent = `Lives: ${state.lives}`;
}

function spawnStar() {
  const size = 16 + Math.random() * 8;
  state.stars.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: 140 + Math.random() * 90,
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function update(delta) {
  if (state.gameOver) {
    return;
  }

  if (state.keys.left) {
    state.player.x -= state.player.speed * delta;
  }
  if (state.keys.right) {
    state.player.x += state.player.speed * delta;
  }

  state.player.x = clamp(state.player.x, 0, canvas.width - state.player.width);

  state.spawnTimer -= delta;
  if (state.spawnTimer <= 0) {
    spawnStar();
    state.spawnTimer = 0.55 - Math.min(0.2, state.score * 0.008);
  }

  for (let i = state.stars.length - 1; i >= 0; i -= 1) {
    const star = state.stars[i];
    star.y += star.speed * delta;

    const hitPlayer =
      star.x + star.size > state.player.x &&
      star.x < state.player.x + state.player.width &&
      star.y + star.size > state.player.y &&
      star.y < state.player.y + state.player.height;

    if (hitPlayer) {
      state.score += 1;
      state.stars.splice(i, 1);
      updateHud();
      continue;
    }

    if (star.y > canvas.height) {
      state.stars.splice(i, 1);
      state.lives -= 1;
      updateHud();

      if (state.lives <= 0) {
        state.gameOver = true;
        statusEl.textContent = "Game over! Press restart to try again.";
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#071120";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, "#1e4b6d");
  skyGradient.addColorStop(1, "#08101d");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f2d46b";
  for (let i = 0; i < 20; i += 1) {
    const x = (i * 77) % canvas.width;
    const y = (i * 53 + 40) % (canvas.height - 80);
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#6cf2ff";
  ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);

  ctx.fillStyle = "#ffd166";
  state.stars.forEach((star) => {
    ctx.beginPath();
    ctx.arc(star.x + star.size / 2, star.y + star.size / 2, star.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  if (state.gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "16px Trebuchet MS";
    ctx.fillText("Press restart to play again", canvas.width / 2, canvas.height / 2 + 20);
  }
}

function loop(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const delta = Math.min(0.03, (timestamp - state.lastTime) / 1000);
  state.lastTime = timestamp;

  update(delta);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    state.keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    state.keys.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    state.keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    state.keys.right = false;
  }
});

restartBtn.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(loop);
