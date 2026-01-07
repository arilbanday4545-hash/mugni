const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");

canvas.width = 400; 
canvas.height = 400; 
const box = 20; 

let snake, food, score, d, gameInterval, gameSpeed, playerName, audioCtx;
let snakeColor = "#00f2ff"; 

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(freq, type, duration, vol) {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'namePage') loadLeaderboard();
}

function initGame() {
    initAudio();
    playerName = document.getElementById("playerName").value || "GHOST";
    document.getElementById("namePage").style.display = "none";
    document.getElementById("gameArea").style.display = "flex";
    snake = [{x: 10*box, y: 10*box}, {x: 9*box, y: 10*box}];
    food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box };
    score = 0; d = "RIGHT"; gameSpeed = 180;
    runGame();
}

function changeDir(n) {
    if(n=="LEFT" && d!="RIGHT") d="LEFT";
    if(n=="UP" && d!="DOWN") d="UP";
    if(n=="RIGHT" && d!="LEFT") d="RIGHT";
    if(n=="DOWN" && d!="UP") d="DOWN";
    playSound(440, 'triangle', 0.05, 0.02);
}

function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Food
    ctx.shadowBlur = 15; ctx.shadowColor = "#ff0055";
    ctx.fillStyle = "#ff0055";
    ctx.beginPath(); ctx.arc(food.x+box/2, food.y+box/2, box/2.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? "#fff" : snakeColor;
        ctx.beginPath(); ctx.roundRect(p.x+1, p.y+1, box-2, box-2, 5); ctx.fill();
    });

    let hX = snake[0].x; let hY = snake[0].y;
    if(d=="LEFT") hX -= box; if(d=="UP") hY -= box;
    if(d=="RIGHT") hX += box; if(d=="DOWN") hY += box;

    if(hX < 0) hX = canvas.width - box; else if(hX >= canvas.width) hX = 0;
    if(hY < 0) hY = canvas.height - box; else if(hY >= canvas.height) hY = 0;

    if(snake.some((p,i) => i!==0 && p.x===hX && p.y===hY)) return gameOver();

    if(hX === food.x && hY === food.y) {
        score += 10; document.getElementById("scoreVal").innerText = score;
        food = { x: Math.floor(Math.random()*20)*box, y: Math.floor(Math.random()*20)*box };
        let colors = ["#00f2ff", "#00ff44", "#ffff00", "#ff00ff", "#ffae00"];
        snakeColor = colors[Math.floor(Math.random()*colors.length)];
        playSound(800, 'sine', 0.1, 0.1);
        if(gameSpeed > 60) { gameSpeed-=3; clearInterval(gameInterval); runGame(); }
    } else { snake.pop(); }
    snake.unshift({x:hX, y:hY});
}

function runGame() { gameInterval = setInterval(draw, gameSpeed); }
function gameOver() { clearInterval(gameInterval); playSound(100, 'sawtooth', 0.4, 0.2); document.getElementById("gameArea").style.display="none"; document.getElementById("gameOverPage").style.display="block"; document.getElementById("finalScoreMsg").innerText=`SKOR: ${score} PTS`; }
function saveScore(n,s) { let l = JSON.parse(localStorage.getItem("snk")||"[]"); l.push({n,s}); l.sort((a,b)=>b.s-a.s); localStorage.setItem("snk", JSON.stringify(l.slice(0,3))); }
function loadLeaderboard() { let l = JSON.parse(localStorage.getItem("snk")||"[]"); document.getElementById("leaderList").innerHTML = l.map(x=>`<div>${x.n}: ${x.s}</div>`).join("") || "NO DATA"; }
document.addEventListener("keydown", e => { if(e.key.includes("Arrow")) changeDir(e.key.replace("Arrow","").toUpperCase()); });

// 1. UPDATE FUNGSI GAMEOVER (Agar simpan skor dan lapor ke leaderboard)
function gameOver() { 
    clearInterval(gameInterval); 
    playSound(100, 'sawtooth', 0.4, 0.2); 
    
    // Simpan skor dulu sebelum pindah halaman
    saveScore(playerName, score); 
    
    document.getElementById("gameArea").style.display = "none"; 
    document.getElementById("gameOverPage").style.display = "block"; 
    document.getElementById("finalScoreMsg").innerText = `SKOR AKHIR: ${score} PTS`; 
    
    // Tampilkan leaderboard terbaru di halaman Game Over jika ada tempatnya
    loadLeaderboard(); 
}

// 2. UPDATE FUNGSI SAVESCORE (Memastikan data tersimpan di HP)
function saveScore(n, s) { 
    let l = JSON.parse(localStorage.getItem("snk") || "[]"); 
    l.push({n: n, s: s}); 
    l.sort((a, b) => b.s - a.s); // Urutkan dari yang terbesar
    l = l.slice(0, 5); // Ambil 5 besar saja
    localStorage.setItem("snk", JSON.stringify(l)); 
}

// 3. UPDATE FUNGSI LOADLEADERBOARD (Agar muncul di layar)
function loadLeaderboard() { 
    let l = JSON.parse(localStorage.getItem("snk") || "[]"); 
    const listElement = document.getElementById("leaderList");
    if (listElement) {
        listElement.innerHTML = l.map((x, index) => 
            `<div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>${index + 1}. ${x.n}</span>
                <span style="color:var(--primary)">${x.s}</span>
            </div>`
        ).join("") || "BELUM ADA DATA"; 
    }
}

// VARIABEL & FUNGSI PAUSE
let isPaused = false;

function togglePause() {
    if (isPaused) {
        isPaused = false;
        document.getElementById("pauseBtn").innerText = "PAUSE ||";
        document.getElementById("pauseBtn").style.background = "rgba(0,242,255,0.1)";
        document.getElementById("pauseBtn").style.borderColor = "var(--primary)";
        runGame(); 
    } else {
        isPaused = true;
        document.getElementById("pauseBtn").innerText = "RESUME ▶";
        document.getElementById("pauseBtn").style.background = "var(--danger)";
        document.getElementById("pauseBtn").style.borderColor = "var(--danger)";
        clearInterval(gameInterval); 
        
        // Munculkan tulisan PAUSED di tengah canvas
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "bold 30px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
}

// FUNGSI MENGHAPUS LEADERBOARD
function clearLeaderboard() {
    // Tanya dulu biar nggak sengaja kehapus
    if (confirm("Hapus semua rekor skor?")) {
        localStorage.removeItem("snk"); // Hapus data dengan kunci 'snk'
        loadLeaderboard(); // Segarkan tampilan (akan jadi "NO DATA")
        
        // Efek suara hapus jika mau
        if(typeof playSound === "function") playSound(200, 'sawtooth', 0.2, 0.1);
    }
}