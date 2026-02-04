// js/quiz-engine.js

// 1. ฟังก์ชันโหลด Header/Footer
async function loadComponents() {
    try {
        // โหลด Header
        const headerRes = await fetch('html/header.html');
        if (headerRes.ok) document.getElementById('global-header').innerHTML = await headerRes.text();

        // โหลด Footer
        const footerRes = await fetch('html/footer.html');
        if (footerRes.ok) document.getElementById('global-footer').innerHTML = await footerRes.text();
        
    } catch (error) {
        console.error("Error loading components:", error);
    }
}

// 2. ฟังก์ชันตรวจคำตอบ (Core Quiz Logic)
function checkAnswer(btn, isCorrect, explanationId) {
    const cardBody = btn.closest('.card-body');
    const feedbackDiv = document.getElementById(explanationId);
    
    // Disable all buttons in this question
    const allBtns = cardBody.querySelectorAll('.option-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        b.classList.add('opacity-50', 'cursor-not-allowed');
    });

    // Show feedback
    feedbackDiv.classList.remove('d-none');
    feedbackDiv.classList.add('feedback-box');

    // Styling based on result
    if (isCorrect) {
        btn.classList.remove('btn-outline-dark', 'opacity-50');
        btn.classList.add('btn-success', 'text-white', 'fw-bold');
        btn.innerHTML = `<div class="d-flex justify-content-between align-items-center w-100">
            <span>${btn.innerText}</span>
            <i class="ph-fill ph-check-circle fs-4"></i>
        </div>`;
    } else {
        btn.classList.remove('btn-outline-dark', 'opacity-50');
        btn.classList.add('btn-danger', 'text-white');
        btn.innerHTML = `<div class="d-flex justify-content-between align-items-center w-100">
            <span>${btn.innerText}</span>
            <i class="ph-fill ph-x-circle fs-4"></i>
        </div>`;
    }
}

// เริ่มทำงานเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', loadComponents);