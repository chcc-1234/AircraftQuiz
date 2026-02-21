let token = localStorage.getItem("token");
let sessionId = null;
let currentAircraftId = null;
let currentImages = [];
let currentImageIndex = 0;
let answering = false;
let timerInterval = null;
let timeLeft = 30;


// ================= LOGIN =================
async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        token = data.token;

        document.getElementById("loginSection").style.display = "none";
        document.getElementById("modeSection").style.display = "block";
    } else {
        alert("Login failed");
    }
}


// ================= START QUIZ =================
async function startQuiz(mode) {

    const res = await fetch("http://localhost:5000/api/quiz/start", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ mode })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message);
        return;
    }

    sessionId = data.sessionId;

    document.getElementById("modeSection").style.display = "none";
    document.getElementById("quizSection").style.display = "block";

    loadQuestion();
}


// ================= LOAD QUESTION =================
async function loadQuestion() {

    clearInterval(timerInterval);
    answering = false;

    const res = await fetch(
        `http://localhost:5000/api/quiz/question/${sessionId}`,
        {
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    );

    const data = await res.json();

    if (!res.ok) {
        showFinalScreen(0, 0);
        return;
    }

    if (data.completed) {
        showFinalScreen(data.score, data.totalQuestions);
        return;
    }

    currentAircraftId = data.aircraftId;
    currentImages = data.images;
    currentImageIndex = 0;

    document.getElementById("aircraftImage").src = currentImages[0];
    document.getElementById("aircraftImage").onclick = cycleImage;

    document.getElementById("progress").innerText =
        `Question ${data.answered + 1} / ${data.totalQuestions}`;

    document.getElementById("result").innerText = "";

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    data.options.forEach(option => {
        const btn = document.createElement("button");
        btn.innerText = option;
        btn.onclick = () => submitAnswer(option);
        optionsDiv.appendChild(btn);
    });

    startTimer();
}


// ================= IMAGE CYCLING =================
function cycleImage() {

    if (currentImages.length <= 1) return;

    currentImageIndex++;

    if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }

    document.getElementById("aircraftImage").src =
        currentImages[currentImageIndex];
}


// ================= FULLSCREEN =================
function openFullscreen() {

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    modalImg.src = currentImages[currentImageIndex];
    modal.style.display = "flex";

    modal.onclick = () => {
        modal.style.display = "none";
    };
}


// ================= TIMER =================
function startTimer() {

    timeLeft = 30;

    document.getElementById("timer").innerText =
        `Time: ${timeLeft}s`;

    timerInterval = setInterval(() => {

        timeLeft--;

        document.getElementById("timer").innerText =
            `Time: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitAnswer("TIMEOUT");
        }

    }, 1000);
}


// ================= SUBMIT ANSWER =================
async function submitAnswer(selectedAnswer) {

    if (answering) return;
    answering = true;

    clearInterval(timerInterval);

    const res = await fetch(
        "http://localhost:5000/api/quiz/answer",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                sessionId,
                aircraftId: currentAircraftId,
                selectedAnswer
            })
        }
    );

    const data = await res.json();

    if (!res.ok) {
        showFinalScreen(0, 0);
        return;
    }

    document.getElementById("score").innerText =
        `Score: ${data.score}`;

    const resultText = data.correct
        ? "✅ Correct!"
        : `❌ Wrong! Correct: ${data.correctAnswer}`;

    document.getElementById("result").innerText = resultText;

    if (data.completed) {
        setTimeout(() => {
            showFinalScreen(data.score, data.totalQuestions);
        }, 1500);
        return;
    }

    setTimeout(() => {
        loadQuestion();
    }, 1500);
}


// ================= FINAL SCREEN =================
function showFinalScreen(score, total) {

    document.getElementById("quizSection").style.display = "none";
    document.getElementById("finalScreen").style.display = "block";

    document.getElementById("finalScore").innerText =
        `Final Score: ${score} / ${total}`;
}
// ================= AUTO LOGIN CHECK =================
window.onload = function () {

    if (token) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("modeSection").style.display = "block";
    }
};