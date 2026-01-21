// Global Variables Setup
let currentQuestion = 0;
let userAnswers = [];
let isAnswered = [];

// ==========================================
// 1. Initialization & Component Loading
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load Header & Footer Components
        await loadComponent('assets/html/header.html', 'header-slot');
        await loadComponent('assets/html/footer.html', 'footer-slot');

        // Apply Configuration from index.html
        applyConfig();

        // Initialize Quiz Logic
        if (typeof quizData !== 'undefined') {
            userAnswers = new Array(quizData.length).fill(null);
            isAnswered = new Array(quizData.length).fill(false);
            
            // Shuffle
            quizData.forEach(q => shuffleArray(q.options));
            
            initQuiz();
            updateNavigationButtons();
        } else {
            console.error("Quiz Data not found!");
        }

    } catch (error) {
        console.error("Error initializing app:", error);
    }
});

// Helper to fetch HTML files
async function loadComponent(path, targetId) {
    const response = await fetch(path);
    const html = await response.text();
    document.getElementById(targetId).innerHTML = html;
}

// Apply Config Styles & Text
function applyConfig() {
    if (typeof quizConfig !== 'undefined') {
        const headerBg = document.getElementById('dynamic-header-bg');
        const title = document.getElementById('config-title');
        const subtitle = document.getElementById('config-subtitle');
        const scoreLabel = document.getElementById('config-score-label');

        if (headerBg) headerBg.classList.add(quizConfig.headerColorClass || 'bg-blue-700');
        if (title) title.innerText = quizConfig.title;
        if (subtitle) {
            subtitle.innerText = quizConfig.subtitle;
            subtitle.className = `text-xs mt-1 ${quizConfig.accentColorClass || 'text-blue-200'}`;
        }
        if (scoreLabel) scoreLabel.className = `text-xs uppercase tracking-wide ${quizConfig.scoreTitleClass || 'text-blue-200'}`;
    }
}

// ==========================================
// 2. Navigation Logic (GitHub API)
// ==========================================
async function getQuizNavigation() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(p => p);
    const currentFilename = decodeURIComponent(pathParts[pathParts.length - 1]);
    
    // Default fallback if running locally
    if(window.location.protocol === 'file:') return { prev: null, next: null };

    const user = 'pls-c';
    const repo = 'English-Quiz';
    const internalPath = pathParts.slice(1, -1).join('/'); 
    const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${internalPath}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('GitHub API Fail');
        const data = await response.json();
        let filesArray = data
            .filter(file => file.type === 'file' && file.name.toLowerCase().startsWith('test-') && file.name.endsWith('.html'))
            .map(file => file.name);
        filesArray.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        const currentIndex = filesArray.indexOf(currentFilename);
        return {
            prev: currentIndex > 0 ? filesArray[currentIndex - 1] : null,
            next: (currentIndex !== -1 && currentIndex < filesArray.length - 1) ? filesArray[currentIndex + 1] : null
        };
    } catch (error) {
        console.error(error);
        return { prev: null, next: null };
    }
}

async function updateNavigationButtons() {
    const nav = await getQuizNavigation();
    const prevBtn = document.getElementById('prev-quiz-link');
    const nextBtn = document.getElementById('next-quiz-link');

    if (nav.prev && prevBtn) {
        prevBtn.href = nav.prev;
        prevBtn.classList.remove('hidden');
    }
    if (nav.next && nextBtn) {
        nextBtn.href = nav.next;
        nextBtn.classList.remove('hidden');
    }
}

// ==========================================
// 3. Quiz Logic Engine
// ==========================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initQuiz() {
    currentQuestion = 0;
    document.getElementById('content-area').innerHTML = `
        <div id="question-view" class="fade-in">
            <div class="flex justify-between items-center mb-4">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wide" id="question-count"></span>
            </div>
            <div class="mb-6">
                <h2 class="text-xl text-gray-900 font-semibold leading-relaxed mb-2" id="question-text">Loading...</h2>
                <p class="hidden text-blue-700 text-sm italic font-medium bg-blue-50 inline-block px-3 py-1 rounded-lg border border-blue-100 fade-in" id="question-translation"></p>
            </div>
            <div class="space-y-3" id="options-container"></div>
            <div id="feedback-area" class="hidden mt-6 rounded-xl border overflow-hidden fade-in shadow-sm">
                <div class="p-4" id="feedback-header"><div class="flex items-center gap-2 font-bold text-lg" id="feedback-title"></div></div>
                <div class="p-5 bg-gray-50 border-t border-gray-100 text-gray-700 text-sm leading-relaxed space-y-4" id="feedback-content"></div>
                <div class="bg-yellow-50 p-4 border-t border-yellow-100 text-sm text-gray-800">
                    <div class="font-bold text-yellow-800 flex items-center gap-2 mb-2"><i class="ph-fill ph-lightbulb"></i> คำศัพท์น่ารู้ (Vocabulary Boost)</div>
                    <div id="vocab-content" class="space-y-2 pl-6"></div>
                </div>
            </div>
        </div>
        <div id="result-view" class="hidden text-center py-8 fade-in h-full flex flex-col justify-center">
            <div class="mb-6 inline-block p-4 rounded-full bg-blue-50 text-blue-600"><i class="ph ph-trophy text-6xl"></i></div>
             <h2 class="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
             <p class="text-gray-500 mb-8">คะแนนรวมของคุณ</p>
             <div class="flex justify-center items-center mb-8">
                <div class="bg-white px-10 py-6 rounded-2xl border border-gray-200 shadow-sm">
                    <span class="block text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Total Score</span>
                    <div class="flex items-baseline gap-1">
                        <span id="final-score" class="text-5xl font-bold text-blue-600"></span>
                        <span class="text-gray-400 text-2xl font-medium">/ <span id="total-q">10</span></span>
                    </div>
                </div>
             </div>
             <div class="flex flex-col gap-3 justify-center items-center w-full">
                <div class="flex gap-3 w-full justify-center">
                    <button onclick="reviewAnswers()" class="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition flex items-center gap-2"><i class="ph ph-eye"></i> Review</button>
                    <button onclick="restartQuiz()" class="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition shadow-md hover:shadow-lg flex items-center gap-2"><i class="ph ph-arrow-counter-clockwise"></i> Try Again</button>
                </div>
                <a href="https://pls-c.github.io/English-Quiz/TOEFL_ITP_Section2-Structure/index.html" class="text-blue-500 hover:text-blue-700 text-sm font-medium mt-4 flex items-center gap-1 transition-colors"><i class="ph-bold ph-house"></i> กลับหน้าหลัก</a>
             </div>
        </div>
    `;
    loadQuestion(0);
}

function loadQuestion(index) {
    currentQuestion = index;
    const data = quizData[currentQuestion];
    const answered = isAnswered[currentQuestion];
    const userChoice = userAnswers[currentQuestion];

    document.getElementById('question-count').innerText = `QUESTION ${currentQuestion + 1}/${quizData.length}`;
    
    // Update Score Display
    const currentScore = userAnswers.reduce((acc, ans, idx) => {
        return (ans !== null && quizData[idx].options[ans].correct) ? acc + 1 : acc;
    }, 0);
    const scoreDisplay = document.getElementById('score-display');
    if(scoreDisplay) scoreDisplay.innerText = currentScore;

    document.getElementById('question-text').innerHTML = data.question;
    const translationEl = document.getElementById('question-translation');
    translationEl.innerHTML = `<i class="ph-bold ph-translate mr-1"></i> ${data.translation}`;
    translationEl.classList.toggle('hidden', !answered);

    const progress = ((currentQuestion) / quizData.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    data.options.forEach((option, idx) => {
        const btn = document.createElement('button');
        btn.className = `option-btn w-full text-left p-4 rounded-xl border border-gray-200 focus:outline-none mb-1 bg-white text-gray-700 font-medium flex items-start gap-3 hover:bg-blue-50 hover:border-blue-300`;
        const marker = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">${String.fromCharCode(65 + idx)}</span>`;
        btn.innerHTML = `${marker} <span class="leading-relaxed">${option.text}</span>`;
        btn.onclick = () => handleAnswer(idx);

        if (answered) {
            btn.disabled = true;
            btn.classList.remove('hover:bg-blue-50', 'hover:border-blue-300');
            if (option.correct) {
                btn.className = `w-full text-left p-4 rounded-xl border-2 border-green-500 bg-green-50 text-green-800 font-medium flex items-start gap-3 shadow-sm`;
                btn.innerHTML = `<i class="ph-fill ph-check-circle text-2xl text-green-500 flex-shrink-0"></i> <span class="leading-relaxed">${option.text}</span>`;
            } else if (idx === userChoice && !option.correct) {
                btn.className = `w-full text-left p-4 rounded-xl border-2 border-red-400 bg-red-50 text-red-800 font-medium flex items-start gap-3 opacity-90`;
                btn.innerHTML = `<i class="ph-fill ph-x-circle text-2xl text-red-500 flex-shrink-0"></i> <span class="leading-relaxed">${option.text}</span>`;
            } else {
                btn.className += ' opacity-50 grayscale';
            }
        }
        optionsContainer.appendChild(btn);
    });

    const feedbackArea = document.getElementById('feedback-area');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackContent = document.getElementById('feedback-content');
    const feedbackHeader = document.getElementById('feedback-header');
    const vocabContent = document.getElementById('vocab-content');

    if (answered) {
        feedbackArea.classList.remove('hidden');
        feedbackArea.classList.add('fade-in');
        const isCorrect = quizData[currentQuestion].options[userChoice].correct;
        vocabContent.innerHTML = data.vocab.map(v => `<div class="flex items-start gap-2"><i class="ph-bold ph-dot text-yellow-600 mt-1"></i><span>${v}</span></div>`).join('');

        if (isCorrect) {
            feedbackHeader.className = "p-4 bg-green-100 text-green-800 border-b border-green-200";
            feedbackTitle.innerHTML = '<i class="ph-fill ph-check-circle"></i> ถูกต้อง! (Correct)';
            feedbackContent.innerHTML = quizData[currentQuestion].options[userChoice].rationale;
        } else {
            feedbackHeader.className = "p-4 bg-red-100 text-red-800 border-b border-red-200";
            feedbackTitle.innerHTML = '<i class="ph-fill ph-warning-circle"></i> ไม่ถูกต้อง (Incorrect)';
            const correctOptionIndex = quizData[currentQuestion].options.findIndex(o => o.correct);
            feedbackContent.innerHTML = `
                <div class="mb-3 pb-3 border-b border-gray-200">
                     <div class="text-red-700 font-semibold mb-1">สิ่งที่คุณเลือกผิดเพราะ:</div>
                     <div class="text-gray-600">${quizData[currentQuestion].options[userChoice].rationale.replace(/<b>.*?<\/b>/, '')}</div>
                </div>
                <div>
                    <span class="font-bold text-green-700">คำตอบที่ถูกคือข้อ ${String.fromCharCode(65+correctOptionIndex)}</span> เพราะ ${quizData[currentQuestion].options[correctOptionIndex].rationale}
                </div>`;
        }
    } else {
        feedbackArea.classList.add('hidden');
    }

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if(prevBtn) {
        prevBtn.classList.toggle('hidden', currentQuestion === 0);
        prevBtn.disabled = false;
    }
    if(nextBtn) {
        if (answered) {
            nextBtn.classList.remove('hidden');
            nextBtn.innerHTML = (currentQuestion === quizData.length - 1) ? 'See Results <i class="ph-bold ph-chart-bar"></i>' : 'Next <i class="ph-bold ph-arrow-right"></i>';
        } else {
            nextBtn.classList.add('hidden');
        }
    }
    document.getElementById('content-area').scrollTop = 0;
}

function handleAnswer(idx) {
    userAnswers[currentQuestion] = idx;
    isAnswered[currentQuestion] = true;
    loadQuestion(currentQuestion);
    setTimeout(() => {
        const ca = document.getElementById('content-area');
        ca.scrollTo({ top: ca.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
}

function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion(currentQuestion);
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('question-view').classList.add('hidden');
    document.getElementById('footer-controls')?.classList.add('hidden');
    document.getElementById('result-view').classList.remove('hidden');
    
    const finalScore = userAnswers.reduce((acc, ans, idx) => (ans !== null && quizData[idx].options[ans].correct) ? acc + 1 : acc, 0);
    document.getElementById('final-score').innerText = finalScore;
    document.getElementById('total-q').innerText = quizData.length;
    document.getElementById('progress-bar').style.width = `100%`;
}

function reviewAnswers() {
    document.getElementById('result-view').classList.add('hidden');
    document.getElementById('question-view').classList.remove('hidden');
    document.getElementById('footer-controls')?.classList.remove('hidden');
    loadQuestion(0);
}

function restartQuiz() {
    userAnswers.fill(null);
    isAnswered.fill(false);
    initQuiz();
    document.getElementById('result-view').classList.add('hidden');
    document.getElementById('question-view').classList.remove('hidden');
    document.getElementById('footer-controls')?.classList.remove('hidden');
}