const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const start = document.querySelector(".start");
const contt = document.querySelector(".conttt");
const overr = document.querySelector(".overr");
const overrs = document.querySelector(".overrs");
const game = document.querySelector("canvas");
const text = document.querySelector(".score_text");
var good_s = new Audio("good.mp3");
const next = document.getElementById("nextc");
const ctx = canvas.getContext("2d");
const nctx = next.getContext("2d")
var move_s = new Audio("se_game_move.mp3");
var ply = new Audio("Kairis.mp3");
var overrr = new Audio('./me_game_gameover.mp3');

context.scale(80, 80);

document.addEventListener('DOMContentLoaded', function () {

    const overlay = document.getElementById('overlay');
    function overlayToggle() {
      overlay.classList.toggle('overlay-on');
    }
    const clickArea = document.getElementsByClassName('overlay-event');
    for (let i = 0; i < clickArea.length; i++) {
      clickArea[i].addEventListener('click', overlayToggle, false);
    }

    function stopEvent(event) {
      event.stopPropagation();
    }
    const overlayInner = document.getElementById('overlay-inner');
    overlayInner.addEventListener('click', stopEvent, false);

  }, false);

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        good_s.play()
        player.score += rowCount * 50;
        rowCount *= 2;
        if (player.score >= 500) {
            dropInterval -= 15;
        }
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}


function createPiece(type, next) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    } else {
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.globalAlpha = 1;
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    move_s.play();
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        viewResult();
    }
}

function playerRotate(dir) {
    move_s.play();
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = "Score: " + player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 65) {
        playerMove(-1);
        move_sound();
    } else if (event.keyCode === 68) {
        playerMove(1);
        move_sound();
    } else if (event.keyCode === 83) {
        playerDrop();
        move_sound();
    } else if (event.keyCode === 32) {
        playerRotate(-1);
        rotate_sound();
    } else if (event.keyCode === 90) {
        playerRotate(1);
        rotate_sound();
    } else if (event.keyCode === 40) {
        playerDrop();
        move_sound();
    } else if (event.keyCode === 37) {
        playerMove(-1);
        move_sound();
    } else if (event.keyCode === 39) {
        playerMove(1);
        move_sound();
    } else if (event.keyCode === 46) {
        viewResult();
        alert('正常に終了しました')
    }
});

const colors = [
    null,
    '#00bfff',
    '#FF8E0D',
    '#0d0dff',
    '#ffd700',
    '#ff1a1a',
    '#32cd32',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
}

function move_sound() {
    move_s.currentTime = 0;
    move_s.play();
}

const rot = new Audio("./move.mp3")

function rotate_sound() {
    rot.currentTime = 0;
    rot.play();
}

function stopO() {
    overrr.pause();
}

const num = 0;

function viewResult() {
    ply.pause();
    game.style.display = "none";
    overr.style.display = "block";
    if (num === 0) {
        overrr.play();
    }
    num += 1
}

function reload() {
    location.reload();
}