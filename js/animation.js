// Intersection Observerの設定
const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

// アニメーション対象の要素を監視
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, options);

// 監視する要素を登録
document.addEventListener('DOMContentLoaded', () => {
    // アニメーション対象の要素を取得
    const newsCards = document.querySelectorAll('.news-card');
    const serviceCards = document.querySelectorAll('.service-card');
    const messageContent = document.querySelector('.message-content');

    // 各要素にフェードアップクラスを追加
    newsCards.forEach(card => {
        card.classList.add('fade-up');
        observer.observe(card);
    });

    serviceCards.forEach(card => {
        card.classList.add('fade-up');
        observer.observe(card);
    });

    if (messageContent) {
        messageContent.classList.add('fade-up');
        observer.observe(messageContent);
    }
}); 