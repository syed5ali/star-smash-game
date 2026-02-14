var config = {
    type: Phaser.AUTO,
    width: 360,
    height: 540,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

var game = new Phaser.Game(config);

var stars;
var score = 0;
var scoreText;
var lives = 3;
var livesText;
var dangerZone;

var timeLeft = 20;
var timerText;
var timerEvent;

var gameOver = false;
var overlay, gameOverPanel, restartButton, earningsText, gameOverText;

function preload() {
    this.load.image("bg", "assets/background.png");
    this.load.image("star", "assets/star.png");
}

function create() {

    // BACKGROUND
    let bg = this.add.image(180, 270, "bg");
    bg.setDisplaySize(360, 540);

    // RED DANGER ZONE
    dangerZone = this.add.rectangle(180, 525, 360, 30, 0xff0000).setDepth(20);

    // SCORE
    scoreText = this.add.text(10, 10, "Score: 0", {
        fontSize: "20px",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 4
    });

    // LIVES
    livesText = this.add.text(250, 10, "💥💥💥", {
        fontSize: "26px"
    });

    // TIMER
    timerText = this.add.text(140, 10, "Time: 20", {
        fontSize: "20px",
        color: "#ffff55",
        stroke: "#000",
        strokeThickness: 4
    });

    // STAR GROUP
    stars = this.physics.add.group();

    // ⭐ STAR SPAWNER ⭐
    this.spawnEvent = this.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
            if (!gameOver) {
                let star = stars.create(
                    Phaser.Math.Between(30, 330),
                    -20,
                    "star"
                );
                star.setScale(0.06);
                star.setVelocityY(140);
                star.setDepth(10);

                // ENABLE TAP
                star.setInteractive();
                star.on("pointerdown", () => smashStar(star));
            }
        }
    });

    // ⏳ TIMER EVENT
    timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!gameOver) {
                timeLeft--;
                timerText.setText("Time: " + timeLeft);

                if (timeLeft <= 0) endGame.call(this);
            }
        }
    });
}

function update() {

    if (gameOver) return;

    // STAR MISSED CHECK
    stars.children.iterate(star => {
        if (star && star.y > 510) {
            star.destroy();
            loseLife.call(this);
        }
    });
}

// ⭐ TAP STAR = POINTS
function smashStar(star) {
    if (gameOver) return;

    star.destroy();
    score += 10;
    scoreText.setText("Score: " + score);
}

// ❤️ LOSE LIFE
function loseLife() {
    lives--;
    livesText.setText("💥".repeat(lives));

    if (lives <= 0) endGame.call(this);
}

// 🛑 GAME OVER SCREEN
function endGame() {
    if (gameOver) return;
    gameOver = true;

    timerEvent.paused = true;
    this.spawnEvent.paused = true;

    overlay = this.add.rectangle(180, 270, 360, 540, 0x000000, 0.5).setDepth(50);

    gameOverPanel = this.add.rectangle(180, 270, 260, 200, 0x000000, 0.85)
        .setStrokeStyle(3, 0xff3d3d)
        .setDepth(55)
        .setOrigin(0.5);

    gameOverText = this.add.text(180, 220, "GAME OVER", {
        fontSize: "28px",
        color: "#ff4040",
        stroke: "#000",
        strokeThickness: 6
    }).setDepth(60).setOrigin(0.5);

    earningsText = this.add.text(180, 260, "Total Score: " + score, {
        fontSize: "22px",
        color: "#fff"
    }).setDepth(60).setOrigin(0.5);

    restartButton = this.add.text(180, 310, "Play Again", {
        fontSize: "22px",
        backgroundColor: "#ff3d3d",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
        color: "#fff"
    })
        .setInteractive()
        .setDepth(60)
        .setOrigin(0.5)
        .on("pointerdown", () => restartGame.call(this));
}

// 🔄 RESTART GAME
function restartGame() {

    overlay.destroy();
    gameOverPanel.destroy();
    restartButton.destroy();
    earningsText.destroy();
    gameOverText.destroy();

    score = 0;
    lives = 3;
    timeLeft = 20;
    gameOver = false;

    scoreText.setText("Score: 0");
    livesText.setText("💥💥💥");
    timerText.setText("Time: 20");

    stars.clear(true, true);

    this.spawnEvent.paused = false;
    timerEvent.paused = false;
}

// 📱 RESPONSIVE SCALING
function resizeGame() {
    const gameContainer = document.getElementById("game-container");
    const scaleWrapper = document.getElementById("game-scale-wrapper");

    let sw = scaleWrapper.clientWidth;
    let scale = sw / 360;

    gameContainer.style.transform = "scale(" + scale + ")";
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
setTimeout(resizeGame, 200);
