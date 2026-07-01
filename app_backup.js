let questions = [];
let examQuestions = [];
let currentQuestion = 0;
let score = 0;
let missed = [];
let examName = "";
let examLength = 5;
let startTime = 0;

const exams = [
  ["A+", "data/aplus_core1.json"],
  ["Network+", "data/networkplus.json"],
  ["Security+", "data/securityplus.json"],
  ["Linux+", "data/linuxplus.json"]
];

const lengths = [
  [5, "Quick"],
  [20, "Practice"],
  [40, "Review"],
  [60, "Exam"],
  [90, "Simulation"]
];

function buildMenu() {
  const menu = document.getElementById("menu");
  const quiz = document.getElementById("quiz");

  menu.style.display = "block";
  menu.innerHTML = "";

  quiz.innerHTML = `
    <h2>Ready</h2>
    <p>Select a certification and test length.</p>
  `;

  exams.forEach(([cert]) => {
    const box = document.createElement("div");
    box.className = "examBox";
    box.innerHTML = `<h2>${cert}</h2>`;

    lengths.forEach(([count, label]) => {
      const button = document.createElement("button");
      button.textContent = `${label} (${count})`;
      button.onclick = () => startExam(cert, count);
      box.appendChild(button);
    });

    menu.appendChild(box);
  });
}

async function startExam(cert, count) {
  examName = cert;
  examLength = count;

  const quiz = document.getElementById("quiz");
  quiz.innerHTML = `<h2>Loading ${cert}...</h2><p>Please wait.</p>`;

  const exam = exams.find(e => e[0] === cert);
  const file = exam[1];

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Could not load ${file}`);
    }

    questions = await response.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error(`${file} has no questions.`);
    }

    questions = shuffleArray(questions);

    examQuestions = [];

    while (examQuestions.length < count) {
      examQuestions.push(questions[examQuestions.length % questions.length]);
    }

    currentQuestion = 0;
    score = 0;
    missed = [];
    startTime = Date.now();

    document.getElementById("menu").style.display = "none";

    showQuestion();

  } catch (error) {
    quiz.innerHTML = `
      <h2>Error</h2>
      <p>${error.message}</p>
      <button onclick="buildMenu()">Back to Menu</button>
    `;
  }
}

function showQuestion() {
  if (currentQuestion >= examQuestions.length) {
    finishExam();
    return;
  }

  const q = examQuestions[currentQuestion];
  const quiz = document.getElementById("quiz");

  quiz.innerHTML = `
    <h2>${examName}</h2>
    <p><strong>Question ${currentQuestion + 1} of ${examQuestions.length}</strong></p>
    <p>${escapeHTML(q.question)}</p>
    <div id="answers"></div>
  `;

  const answers = document.getElementById("answers");

  q.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.onclick = () => checkAnswer(choice, index);
    answers.appendChild(button);
  });
}

function checkAnswer(choice, index) {
  const q = examQuestions[currentQuestion];

  let correct = false;

  if (typeof q.answer === "string") {
    correct = choice === q.answer;
  } else if (typeof q.correctIndex === "number") {
    correct = index === q.correctIndex;
  }

  if (correct) {
    score++;
  } else {
    missed.push({
      question: q.question,
      choices: q.choices,
      answer: q.answer ?? q.choices[q.correctIndex],
      selected: choice
    });
  }

  currentQuestion++;
  showQuestion();
}

function finishExam() {
  const quiz = document.getElementById("quiz");
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const percent = Math.round((score / examQuestions.length) * 100);

  quiz.innerHTML = `
    <h2>${examName} Complete</h2>
    <p><strong>Score:</strong> ${score} / ${examQuestions.length}</p>
    <p><strong>Percent:</strong> ${percent}%</p>
    <p><strong>Time:</strong> ${minutes}m ${seconds}s</p>
    <p><strong>Missed:</strong> ${missed.length}</p>

    <button onclick="reviewMissed()">Review Missed</button>
    <button onclick="retestMissed()">Retest Missed</button>
    <button onclick="exportMissedQuestions()">Export Missed</button>
    <button onclick="buildMenu()">Back to Menu</button>
  `;
}

function reviewMissed() {
  const quiz = document.getElementById("quiz");

  if (!missed.length) {
    quiz.innerHTML = `
      <h2>Perfect Score</h2>
      <p>No missed questions.</p>
      <button onclick="buildMenu()">Back to Menu</button>
    `;
    return;
  }

  let html = `<h2>Missed Questions</h2>`;

  missed.forEach((m, index) => {
    html += `
      <div class="missedBox">
        <p><strong>${index + 1}. ${escapeHTML(m.question)}</strong></p>
        <p>Your answer: ${escapeHTML(m.selected)}</p>
        <p>Correct answer: ${escapeHTML(m.answer)}</p>
      </div>
    `;
  });

  html += `
    <button onclick="retestMissed()">Retest Missed</button>
    <button onclick="buildMenu()">Back to Menu</button>
  `;

  quiz.innerHTML = html;
}

function retestMissed() {
  if (!missed.length) {
    alert("No missed questions to retest.");
    return;
  }

  examQuestions = missed.map(m => ({
    question: m.question,
    choices: m.choices,
    answer: m.answer
  }));

  currentQuestion = 0;
  score = 0;
  missed = [];
  startTime = Date.now();

  showQuestion();
}

function exportMissedQuestions() {
  const report = {
    date: new Date().toLocaleString(),
    exam: examName,
    score: score,
    total: examQuestions.length,
    percent: Math.round((score / examQuestions.length) * 100),
    missed: missed
  };

  const blob = new Blob(
    [JSON.stringify(report, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "missed_questions.json";
  a.click();
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

buildMenu();
