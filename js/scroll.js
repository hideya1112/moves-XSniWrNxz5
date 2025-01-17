document.addEventListener('DOMContentLoaded', () => {
    // すべてのアンカーリンクを取得
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // ヘッダーの高さを考慮したスクロール位置の計算
                const headerHeight = 80; // ヘッダーの高さ
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                
                smoothScroll({
                    start: startPosition,
                    end: targetPosition,
                    duration: 500, // 500ms = 0.5秒
                });
            }
        });
    });
});

function smoothScroll({ start, end, duration }) {
    const startTime = performance.now();
    
    function animation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数（ease-out）
        const easeOut = progress => 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, start + (end - start) * easeOut(progress));
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
} 