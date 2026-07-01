let currentExam="security";
let currentMode="assessment";
let quiz=[];
let currentQuestion=0;
let score=0;
let missed=[];

function appBox(){
return document.getElementById("app");
}

function renderMenu(){
appBox().innerHTML=`
<div class="card">
<h1>CompTIA Certification Testing Suite</h1>
<h2>Select Certification</h2>
<button onclick="selectExam('corea')">CompTIA A+ Core 1</button>
<button onclick="selectExam('coreb')">CompTIA A+ Core 2</button>
<button onclick="selectExam('network')">Network+</button>
<button onclick="selectExam('security')">Security+</button>
<button onclick="selectExam('linux')">Linux+</button>
</div>
`;
}

function selectExam(exam){
currentExam=exam;
renderModes();
}

function renderModes(){
appBox().innerHTML=`
<div class="card">
<h1>${EXAMS[currentExam]}</h1>
<button onclick="beginQuiz('assessment')">Assessment (30)</button>
<button onclick="beginQuiz('practice')">Practice (60)</button>
<button onclick="beginQuiz('simulation')">Simulation (90)</button>
<button onclick="renderMenu()">Back</button>
</div>
`;
}

function beginQuiz(mode){

currentMode=mode;

const bank=QUESTIONS[currentExam] || [];

quiz=[...bank];

for(let i=quiz.length-1;i>0;i--){

const j=Math.floor(Math.random()*(i+1));

[quiz[i],quiz[j]]=[quiz[j],quiz[i]];

}

quiz=quiz.slice(0,Math.min(quiz.length,MODES[mode].questions));

currentQuestion=0;
score=0;
missed=[];

if(quiz.length===0){

appBox().innerHTML=`
<div class="card">
<h2>No Questions Found</h2>
<p>Question bank is empty.</p>
<button onclick="renderMenu()">Main Menu</button>
</div>
`;

return;

}

console.log("QUIZ SIZE",quiz.length);
console.log("CURRENT EXAM",currentExam);
console.log("QUESTIONS",QUESTIONS[currentExam]);
renderQuestion();

}

function renderQuestion(){
if(currentQuestion>=quiz.length){
showResults();
return;
}

const q=quiz[currentQuestion];

appBox().innerHTML=`
<div class="card">
<h2>${EXAMS[currentExam]} - ${MODES[currentMode].name}</h2>
<p>Question ${currentQuestion+1} / ${quiz.length}</p>
<h3>${q.question}</h3>
<div id="answers"></div>
</div>
`;

const answers=document.getElementById("answers");

q.choices.forEach((choice,index)=>{
const button=document.createElement("button");
button.className="answer";
button.textContent=choice;
button.onclick=()=>submitAnswer(index);
answers.appendChild(button);
});
}

function submitAnswer(index){
const q=quiz[currentQuestion];

if(index===q.answer){
score++;
}else{
missed.push({
question:q.question,
correct:q.choices[q.answer],
chosen:q.choices[index],
explanation:q.explanation || "No explanation available."
});
}

currentQuestion++;

if(currentQuestion>=quiz.length){
showResults();
}else{
renderQuestion();
}
}

function showResults(){
const percent=Math.round((score/quiz.length)*100);

let html=`
<div class="card">
<h1>Results</h1>
<h2>${EXAMS[currentExam]} - ${MODES[currentMode].name}</h2>
<p>Score: ${score} / ${quiz.length}</p>
<p>Percent: ${percent}%</p>
<p>Missed: ${missed.length}</p>
`;

if(missed.length){
html+=`<h2>Review</h2>`;

missed.forEach(item=>{
html+=`
<div class="review">
<b>${item.question}</b>
<p class="wrong">Your answer: ${item.chosen}</p>
<p class="correct">Correct answer: ${item.correct}</p>
<p class="explanation"><b>Explanation:</b> ${item.explanation}</p>
</div>
`;
});
}

html+=`
<button onclick="renderMenu()">Main Menu</button>
<button onclick="beginQuiz(currentMode)">Retake Same Mode</button>
</div>
`;

appBox().innerHTML=html;
}

window.onload=async function(){

    await loadAllQuestions();

    renderMenu();

};
