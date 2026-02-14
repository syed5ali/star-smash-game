var config = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#000",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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
var spawnEvent;

var overlay, gameOverPanel, restartButton, earningsText, gameOverText;

function preload() {
    this.load.image("bg", "assets/background.png");
    this.load.image("star", "assets/star.png");
}

function create() {

    const width = this.scale.width;
    const height = this.scale.height;

    // BACKGROUND FULLSCREEN
    let bg = this.add.image(0, 0, "bg").setOrigin(0);
    bg.displayWidth = width;
    bg.displayHeight = height;

    // RED DANGER ZONE (Responsive)
    dangerZone = this.add.rectangle(
        width / 2,
        height - 25,
        width,
        40,
        0xff0000
    ).setDepth(20);

    // SCORE
    scoreText = this.add.text(20, 20, "Score: 0", {
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4
    });

    // TIMER
    timerText = this.add.text(width / 2 - 40, 20, "Time: 20", {
        fontSize: "22px",
        color: "#ffff55",
        stroke: "#000",
        strokeThickness: 4
    });

    // LIVES
    livesText = this.add.text(width - 120, 20, "💥💥💥", {
        fontSize: "24px"
    });

    // STAR GROUP
    stars = this.physics.add.group();

    // STAR SPAWNER
    spawnEvent = this.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
            if (!gameOver) {

                let star = stars.create(
                    Phaser.Math.Between(30, this.scale.width - 30),
                    -20,
                    "star"
                );

                star.setScale(0.06);
                star.setVelocityY(150);
                star.setDepth(10);

                // TAP / CLICK
                star.setInteractive();
                star.on("pointerdown", () => smashStar.call(this, star));
            }
        }
    });

    // TIMER EVENT
    timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!gameOver) {
                timeLeft--;
                timerText.setText("Time: " + timeLeft);

                if (timeLeft <= 0) {
                    endGame.call(this);
                }
            }
        }
    });
}

function update() {

    if (gameOver) return;

    stars.children.iterate(star => {

        if (star && star.y > this.scale.height - 40) {
            star.destroy();
            loseLife.call(this);
        }

    }, this);
}

// SMASH STAR
function smashStar(star) {

    if (gameOver) return;

    star.destroy();
    score += 10;
    scoreText.setText("Score: " + score);
}

// LOSE LIFE
function loseLife() {

    lives--;
    livesText.setText("💥".repeat(lives));

    if (lives <= 0) {
        endGame.call(this);
    }
}

// GAME OVER
function endGame() {

    if (gameOver) return;

    gameOver = true;

    spawnEvent.remove(false);
    timerEvent.remove(false);

    const width = this.scale.width;
    const height = this.scale.height;

    // DARK OVERLAY
    overlay = this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x000000,
        0.6
    ).setDepth(50);

    // PANEL
    gameOverPanel = this.add.rectangle(
        width / 2,
        height / 2,
        width * 0.7,
        220,
        0x000000,
        0.9
    ).setStrokeStyle(3, 0xff3d3d)
     .setDepth(55);

    // GAME OVER TEXT
    gameOverText = this.add.text(
        width / 2,
        height / 2 - 60,
        "GAME OVER",
        {
            fontSize: "30px",
            color: "#ff4040",
            stroke: "#000",
            strokeThickness: 6
        }
    ).setOrigin(0.5).setDepth(60);

    // SCORE
    earningsText = this.add.text(
        width / 2,
        height / 2 - 10,
        "Total Score: " + score,
        {
            fontSize: "22px",
            color: "#ffffff"
        }
    ).setOrigin(0.5).setDepth(60);

    // RESTART BUTTON
    restartButton = this.add.text(
        width / 2,
        height / 2 + 50,
        "Play Again",
        {
            fontSize: "22px",
            backgroundColor: "#ff3d3d",
            padding: { left: 15, right: 15, top: 8, bottom: 8 },
            color: "#fff"
        }
    )
    .setOrigin(0.5)
    .setDepth(60)
    .setInteractive()
    .on("pointerdown", () => restartGame.call(this));
}

// RESTART
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

    // Restart events
    spawnEvent = this.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
            if (!gameOver) {

                let star = stars.create(
                    Phaser.Math.Between(30, this.scale.width - 30),
                    -20,
                    "star"
                );

                star.setScale(0.06);
                star.setVelocityY(150);
                star.setDepth(10);

                star.setInteractive();
                star.on("pointerdown", () => smashStar.call(this, star));
            }
        }
    });

    timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!gameOver) {
                timeLeft--;
                timerText.setText("Time: " + timeLeft);

                if (timeLeft <= 0) {
                    endGame.call(this);
                }
            }
        }
    });
}
