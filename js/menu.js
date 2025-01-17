document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    hamburger.addEventListener('click', () => {
        // ナビゲーションの表示/非表示を切り替え
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');

        // リンクのアニメーション
        links.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
    });

    // メニューリンクをクリックしたらメニューを閉じる
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            links.forEach(link => {
                link.style.animation = '';
            });
        });
    });
}); 