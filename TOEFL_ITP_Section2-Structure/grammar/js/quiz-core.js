/**
 * ฟังก์ชันสำหรับสร้างโจทย์ Quiz ลงใน HTML
 * @param {Array} data - ข้อมูลคำถาม
 * @param {String} containerId - ID ของ div ที่จะแสดงผล
 */
function renderQuiz(data, containerId) {
    const quizArea = document.getElementById(containerId);
    if (!quizArea) return;

    quizArea.innerHTML = ''; // เคลียร์ของเก่าถ้ามี

    data.forEach((item, index) => {
        // Create Card
        const qDiv = document.createElement('div');
        qDiv.className = "bg-white p-4 rounded-3 border shadow-sm";

        // Create Options HTML
        let optionsHtml = "";
        item.options.forEach((opt, optIndex) => {
            // เรียกใช้ global function checkAnswer
            optionsHtml += `
                <button onclick="checkAnswer(${index}, ${optIndex}, this)" 
                        class="btn btn-quiz-option">
                    <span>${opt.text}</span>
                    <i class="ph-bold ph-circle text-secondary"></i>
                </button>
            `;
        });

        // Assemble HTML
        qDiv.innerHTML = `
            <p class="fw-bold text-dark mb-3">${index + 1}. ${item.question}</p>
            <div>${optionsHtml}</div>
            <div id="feedback-${index}" class="mt-3 p-3 rounded-3 small fw-bold d-none"></div>
        `;
        quizArea.appendChild(qDiv);
    });
}

/**
 * ฟังก์ชันตรวจสอบคำตอบ (Logic การตรวจ)
 */
function checkAnswer(qIndex, optIndex, btnElement) {
    // ดึงตัวแปร global quizData (ที่อยู่ในไฟล์ HTML หลัก)
    if (typeof quizData === 'undefined') {
        console.error("Quiz data not found!");
        return;
    }

    const question = quizData[qIndex];
    const option = question.options[optIndex];
    const feedbackEl = document.getElementById(`feedback-${qIndex}`);
    
    // Disable all buttons in this question
    const allBtns = btnElement.parentElement.querySelectorAll('button');
    allBtns.forEach(btn => {
        btn.disabled = true;
    });

    // Show Feedback & Change Styles
    feedbackEl.classList.remove('d-none');
    
    if (option.correct) {
        // Correct Style
        btnElement.classList.add('btn-success-custom');
        btnElement.querySelector('i').className = "ph-fill ph-check-circle text-success fs-5";
        
        feedbackEl.className = "mt-3 p-3 rounded-3 small fw-bold alert alert-success border-success";
        feedbackEl.innerHTML = `<i class="ph-bold ph-check me-2"></i> ${option.rationale}`;
    } else {
        // Wrong Style
        btnElement.classList.add('btn-danger-custom');
        btnElement.querySelector('i').className = "ph-fill ph-x-circle text-danger fs-5";

        feedbackEl.className = "mt-3 p-3 rounded-3 small fw-bold alert alert-danger border-danger";
        feedbackEl.innerHTML = `<i class="ph-bold ph-x me-2"></i> ${option.rationale}`;
    }
}