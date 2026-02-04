// 1. ฟังก์ชันโหลด Component
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            document.getElementById(elementId).innerHTML = await response.text();
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}


// เริ่มทำงานเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('global-header', 'html/header.html');
    loadComponent('global-footer', 'html/footer.html');
    renderQuiz();
});