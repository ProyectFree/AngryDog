document.getElementById('start-game').addEventListener('click', () => {
    window.location.href = 'game.html'; // Redirige al juego
});

document.getElementById('start-arcade').addEventListener('click', () => {
    window.location.href = 'arcade.html'; // Redirige al juego
});

document.getElementById('instructions').addEventListener('click', () => {
    alert('Instrucciones del juego: Usa las flechas del teclado para mover a ThinkYellow y recoger puntos. Evita los enemigos y obstáculos.');
});

document.getElementById('exit').addEventListener('click', () => {
    window.close(); // Cierra la ventana (puede no funcionar en algunos navegadores)
});