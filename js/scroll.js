document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observerの設定
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                // 一度表示されたら監視を解除
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // ニュースカードの表示時にアニメーションを適用
    function observeNewsCards() {
        const newsCards = document.querySelectorAll('.news-card');
        newsCards.forEach(card => {
            observer.observe(card);
        });
    }

    // 新しいニュースが読み込まれるたびに監視を設定
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid) {
        const observer = new MutationObserver(() => {
            observeNewsCards();
        });

        observer.observe(newsGrid, {
            childList: true
        });
    }

    // 初期表示時のカードも監視対象に
    observeNewsCards();
}); 