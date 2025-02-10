// Variables del juego
const gridSize = 10;
const totalObstacles = 5; // Cantidad de obstáculos por nivel
let obstacles = [];
let lives = 3; // Número de vidas inicial
let pacmanPosition = 0;
let score = 0;
let level = 1;
let enemySpeed = 1000;
let timeLeft = 40;
let bossActive = false;
let boss;
let timer;
let timerDuration = 30; // 30 seconds for boss
let pacman;
const totalPoints = 20;
let points = [];
const totalEnemies = 3;
let enemies = [];
let enemyInterval;
let timerInterval;
let invulnerable = false; // Variable para controlar la invulnerabilidad
let paused = false;


document.addEventListener('keydown', (event) => {
    if (event.key === 'p') {
      if (!paused) {
        pauseGame();
      } else {
        resumeGame();
      }
    }
  });


const pauseButton = document.getElementById('pause-button');

pauseButton.addEventListener('click', () => {
  if (!paused) {
    pauseGame();
  } else {
    resumeGame();
  }
});

function pauseGame() {
    paused = true;
    clearInterval(enemyInterval);
    clearInterval(timerInterval);
    backgroundMusic.pause();
    pauseButton.textContent = 'Reanudar';
  }
  
  function resumeGame() {
    paused = false;
    startEnemyMovement();
    startTimer();
    backgroundMusic.play();
    pauseButton.textContent = 'Pausar';
  }







  const bossMusic = new Audio('sounds/boss-music.mp3');
  bossMusic.loop = true; // Repetir la música

// Cargar sonidos
const pointSound = new Audio('sounds/point.mp3');
const obstacleCollisionSound = new Audio('sounds/obstacle_collision.mp3');
const enemyCollisionSound = new Audio('sounds/enemy_collision.mp3');

// Cargar música de fondo
const backgroundMusic = new Audio('sounds/background-music.mp3'); // Asegúrate de que la ruta sea correcta
backgroundMusic.loop = true; // Repetir la música

//Anadir obstaculos
function placeObstacles() {
    const cells = document.querySelectorAll('.cell');
    const cellsPerRow = gridSize;
    const pacmanPosition = 0; // Posición inicial del jugador
    const adjacentPositions = [
        pacmanPosition - 1, // Izquierda
        pacmanPosition + 1, // Derecha
        pacmanPosition - cellsPerRow, // Arriba
        pacmanPosition + cellsPerRow, // Abajo
        pacmanPosition - cellsPerRow - 1, // Arriba-izquierda
        pacmanPosition - cellsPerRow + 1, // Arriba-derecha
        pacmanPosition + cellsPerRow - 1, // Abajo-izquierda
        pacmanPosition + cellsPerRow + 1, // Abajo-derecha
    ];

    while (obstacles.length < totalObstacles) {
        const randomPosition = Math.floor(Math.random() * cells.length);
        if (
            randomPosition !== pacmanPosition &&
            !points.includes(randomPosition) &&
            !enemies.includes(randomPosition) &&
            !obstacles.includes(randomPosition) &&
            !adjacentPositions.includes(randomPosition) // Evita posiciones adyacentes
        ) {
            obstacles.push(randomPosition);
            cells[randomPosition].classList.add('obstacle');
        }
    }
}
// Inicializar el juego
function createGrid() {
    const container = document.getElementById('game-container');
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        container.appendChild(cell);
    }
}

function displayPacman() {
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('pacman'));
    document.querySelectorAll('.cell')[pacmanPosition].classList.add('pacman');
}

function updateScore() {
    document.getElementById('score').innerText = `Puntaje: ${score}`;
}

function updateLevel() {
    document.getElementById('level').innerText = `Nivel: ${level}`;
}

function updateTimer() {
    document.getElementById('timer').innerText = `Tiempo: ${timeLeft}`;
}

// Colocar puntos en el tablero
function placePoints() {
    const cells = document.querySelectorAll('.cell');
    while (points.length < totalPoints) {
        const randomPosition = Math.floor(Math.random() * cells.length);
        if (!points.includes(randomPosition) && randomPosition !== pacmanPosition) {
            points.push(randomPosition);
            cells[randomPosition].classList.add('point');
        }
    }
}

// Colocar enemigos en el tablero
function placeEnemies() {
    const cells = document.querySelectorAll('.cell');
    while (enemies.length < totalEnemies) {
        const randomPosition = Math.floor(Math.random() * cells.length);
        if (!enemies.includes(randomPosition) && randomPosition !== pacmanPosition && !points.includes(randomPosition)) {
            enemies.push(randomPosition);
            cells[randomPosition].classList.add('enemy');
        }
    }
}

// Movimiento de Pac-Man
function movePacman(event) {
    if (paused) return;
    const cellsPerRow = gridSize;
    let newPosition = pacmanPosition;

    switch (event.key) {
        case 'ArrowUp':
            if (pacmanPosition - cellsPerRow >= 0) newPosition -= cellsPerRow;
            break;
        case 'ArrowDown':
            if (pacmanPosition + cellsPerRow < cellsPerRow * cellsPerRow) newPosition += cellsPerRow;
            break;
        case 'ArrowLeft':
            if (pacmanPosition % cellsPerRow !== 0) newPosition -= 1;
            break;
        case 'ArrowRight':
            if (pacmanPosition % cellsPerRow !== cellsPerRow - 1) newPosition += 1;
            break;
    }

    // Verificar colisión con obstáculos
    if (obstacles.includes(newPosition)) {
        loseLife();
        return;
    }

    pacmanPosition = newPosition;
    displayPacman();
    checkForPoint();
    checkCollision(); // Verifica colisión con enemigos después de mover a Pac-Man
}
//Perder vidas
function loseLife() {
    obstacleCollisionSound.play(); // Reproduce el sonido de colisión con obstáculos
    lives--;
    updateLives();

    if (lives <= 0) {
        alert("¡Game Over! Te has quedado sin vidas.");
        window.location.href = 'index.html'; // Redirige al menú principal
    }
}

function updateLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = ''; // Limpiar el contenedor de vidas

    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('span');
        lifeIcon.classList.add('life-icon');
        livesContainer.appendChild(lifeIcon);
    }
}

// Verificar si Pac-Man ha comido un punto
function checkForPoint() {
    if (points.includes(pacmanPosition)) {
        points = points.filter(point => point !== pacmanPosition);
        document.querySelectorAll('.cell')[pacmanPosition].classList.remove('point');
        score += 10;
        updateScore();
        pointSound.play();
        if (points.length === 0) levelUp();
    }
}

// Verificar colisión con enemigos
function checkCollision() {
    if (paused) return;
    if (enemies.includes(pacmanPosition) && !invulnerable) {
        enemyCollisionSound.play(); // Reproduce el sonido de colisión con enemigos
        loseLife(); // Llama a la función que maneja la pérdida de vida
        makeInvulnerable(); // Llama a la función para hacer a Pac-Man invulnerable
    }
}

// Subir de nivel
function levelUp() {
    level += 1;
    enemySpeed *= 0.9;
    updateLevel();

    if (level % 10 === 0) {
        startBossLevel();
    } else {
        resetGame();
        startEnemyMovement();
    }
}

function aStar(start, goal, obstacles) {
    const cellsPerRow = gridSize;
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(start, 0);
    fScore.set(start, heuristic(start, goal));

    while (openSet.length > 0) {
        // Obtener el nodo con el menor fScore
        const current = openSet.reduce((lowest, node) => {
            if (fScore.get(node) < fScore.get(lowest)) {
                return node;
            }
            return lowest;
        });

        if (current === goal) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(openSet.indexOf(current), 1);

        const neighbors = getNeighbors(current, cellsPerRow);
        for (const neighbor of neighbors) {
            if (obstacles.includes(neighbor)) continue; // Ignorar obstáculos

            const tentativeGScore = gScore.get(current) + 1;

            if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal));

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return []; // No hay ruta
}

function heuristic(a, b) {
    const ax = a % gridSize;
    const ay = Math.floor(a / gridSize);
    const bx = b % gridSize;
    const by = Math.floor(b / gridSize);
    return Math.abs(ax - bx) + Math.abs(ay - by); // Distancia Manhattan
}

function getNeighbors(position, cellsPerRow) {
    const neighbors = [];
    const directions = [-1, 1, -cellsPerRow, cellsPerRow]; // Izquierda, derecha, arriba, abajo

    for (const dir of directions) {
        const newPos = position + dir;
        if (newPos >= 0 && newPos < cellsPerRow * cellsPerRow) {
            neighbors.push(newPos);
        }
    }

    return neighbors;
}

function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        totalPath.push(current);
    }
    return totalPath.reverse(); // Devuelve el camino desde el inicio hasta el objetivo
}

function startBossLevel() {
    bossActive = true;

    backgroundMusic.pause(); // Detener la música de fondo
    bossMusic.play(); // Iniciar la música de Boss

    // Colocar el boss en la parte superior derecha (posición 9)
    const cells = document.querySelectorAll('.cell');
    let bossPosition = 9; // Posición inicial en la parte superior derecha

    // Asegurarse de que la posición inicial no esté ocupada por Pac-Man, obstáculos o enemigos
    if (pacmanPosition === bossPosition || obstacles.includes(bossPosition) || enemies.includes(bossPosition)) {
        // Si hay una colisión, busca otra posición válida (esto es poco probable en este caso)
        do {
            bossPosition = Math.floor(Math.random() * cells.length);
        } while (bossPosition === pacmanPosition || obstacles.includes(bossPosition) || enemies.includes(bossPosition));
    }

    cells[bossPosition].classList.add('boss');

    // Colocar a Pac-Man en la parte inferior izquierda (posición 90)
    let pacmanStartPosition = 90; // Posición inferior izquierda en un grid de 10x10

    // Verificar si la posición 90 está ocupada por un obstáculo o un enemigo
    if (obstacles.includes(pacmanStartPosition) || enemies.includes(pacmanStartPosition)) {
        // Buscar una posición alternativa cercana que esté libre
        const adjacentPositions = [
            pacmanStartPosition - 1, // Izquierda
            pacmanStartPosition + 1, // Derecha
            pacmanStartPosition - gridSize, // Arriba
            pacmanStartPosition + gridSize, // Abajo
        ];

        for (const pos of adjacentPositions) {
            if (pos >= 0 && pos < gridSize * gridSize && !obstacles.includes(pos) && !enemies.includes(pos)) {
                pacmanStartPosition = pos;
                break;
            }
        }
    }

    pacmanPosition = pacmanStartPosition; // Actualizar la posición de Pac-Man
    displayPacman(); // Actualizar la posición de Pac-Man en el tablero

    alert("¡Nivel de Boss! Prepárate para enfrentarte al jefe.");

    clearInterval(enemyInterval);

    const bossSpeed = 300; // Velocidad de movimiento del boss
    let bossInterval = setInterval(() => {
        const path = aStar(bossPosition, pacmanPosition, obstacles);
        if (path.length > 0) {
            // Mover el boss al siguiente paso en el camino
            const nextPosition = path[1]; // El siguiente paso en el camino
            cells[bossPosition].classList.remove('boss'); // Eliminar el boss de la posición anterior
            bossPosition = nextPosition; // Actualizar la posición del boss
            cells[bossPosition].classList.add('boss'); // Añadir el boss a la nueva posición

            // Verificar colisión con Pac-Man
            if (bossPosition === pacmanPosition) {
                loseLife(); // Pac-Man pierde una vida al chocar con el boss
                if (lives <= 0) {
                    clearInterval(bossInterval); // Detener el movimiento del boss
                    alert("¡Game Over! Te has quedado sin vidas.");
                    window.location.href = 'index.html'; // Redirigir al menú principal
                }
            }
        }
    }, bossSpeed);

    // Reiniciar el juego después de derrotar al boss
    setTimeout(() => {
        clearInterval(bossInterval); // Detener el movimiento del boss
        cells[bossPosition].classList.remove('boss'); // Eliminar el boss del tablero
        bossActive = false; // Desactivar el boss
        alert("Has derrotado al boss! ¡Bien hecho! ¡Pero cuidado aun te persiguen!");
        resetGame(); // Reiniciar el juego para el siguiente nivel
    }, timerDuration * 1000); // Duración del nivel del boss en milisegundos
    // Actualizar el tiempo del nivel del boss
    timeLeft = timerDuration;
    updateTimer();
}

// Movimiento de los enemigos
function moveEnemies() {
    const cells = document.querySelectorAll('.cell');
    enemies.forEach((enemyPosition, index) => {
        const path = aStar(enemyPosition, pacmanPosition, obstacles); // Calcular el camino hacia Pac-Man
        if (path.length > 1) { // Si hay un camino válido
            const nextPosition = path[1]; // El siguiente paso en el camino

            // Verificar si la nueva posición está ocupada por otro enemigo
            if (!enemies.includes(nextPosition)) {
                cells[enemyPosition].classList.remove('enemy'); // Eliminar el enemigo de la posición anterior
                enemies[index] = nextPosition; // Actualizar la posición del enemigo
                cells[nextPosition].classList.add('enemy'); // Añadir el enemigo a la nueva posición
            }
        }
    });

    checkCollision(); // Verifica colisión después de mover a los enemigos
}

// Iniciar movimiento de enemigos
function startEnemyMovement() {
    clearInterval(enemyInterval);
    enemyInterval = setInterval(moveEnemies, enemySpeed);
}

// Iniciar el temporizador de nivel
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 40;
    updateTimer();

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!bossActive) {
                alert("¡Game Over! Se acabó el tiempo.");
                window.location.href = 'index.html'; // Redirigir al menú principal
            } else {
                alert("Se acabó el tiempo.");
                resetGame();
            }
        }
    }, 1000);
}

// Reiniciar el juego
function resetGame() {
    backgroundMusic.pause(); // Detener la música de fondo
    bossMusic.pause(); // Detener la música de Boss
    backgroundMusic.currentTime = 0; // Reiniciar la música al inicio
    bossMusic.currentTime = 0; // Reiniciar la música de Boss al inicio
    pacmanPosition = 0;
    points = []; // Reiniciar puntos en el tablero
    enemies = []; // Reiniciar enemigos
    obstacles = []; // Reiniciar obstáculos
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('pacman', 'point', 'enemy', 'obstacle'));
    displayPacman();
    placePoints();
    placeEnemies();
    placeObstacles();
    updateScore(); // Actualizar la puntuación en la interfaz
    updateLevel();
    updateLives(); // Actualizar la visualización de las vidas
    startTimer();
    backgroundMusic.play(); // Iniciar la música de fondo
    startEnemyMovement();
}

// Función para hacer a Pac-Man invulnerable y hacer que parpadee
function makeInvulnerable() {
    invulnerable = true;
    const pacman = document.querySelectorAll('.cell')[pacmanPosition];
    let blinkCount = 0;

    const blinkInterval = setInterval(() => {
        pacman.classList.toggle('invulnerable'); // Cambia la clase para hacer que parpadee
        blinkCount++;

        if (blinkCount >= 6) { // 6 parpadeos (3 segundos a 500 ms cada uno)
            clearInterval(blinkInterval);
            invulnerable = false; // Restablece la invulnerabilidad
            pacman.classList.remove('invulnerable'); // Asegúrate de que la clase se quite al final
        }
    }, 500); // Parpadea cada 500 ms
}

// Iniciar el juego
document.addEventListener('DOMContentLoaded', () => {
    createGrid();
    displayPacman();
    placePoints();
    placeEnemies();
    placeObstacles();
    updateScore();
    updateLevel();
    updateLives();
    startEnemyMovement();
    startTimer();
    document.addEventListener('keydown', movePacman);
});
