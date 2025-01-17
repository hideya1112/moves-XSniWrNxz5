const API_KEY = 'hoFfNFSqLE9WzeZgaJIP1Hz3GxGrJfv4HMOL';
const SERVICE_DOMAIN = 'moves';
const END_POINT = 'news';
const ITEMS_PER_PAGE = 8; // 1ページあたりの表示件数を8に変更

let currentProgress = 0;
let targetProgress = 0;
let animationFrameId = null;

const loadingElement = document.getElementById('loading');
const progressElement = document.getElementById('progress');

function animateProgress() {
    if (Math.abs(currentProgress - targetProgress) < 0.1) {
        currentProgress = targetProgress;
        updateProgressUI(currentProgress);
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }

    // イージングの係数を調整してよりスムーズに
    currentProgress += (targetProgress - currentProgress) * 0.1;
    updateProgressUI(currentProgress);
    animationFrameId = requestAnimationFrame(animateProgress);
}

function updateProgress(value) {
    targetProgress = Math.min(value, 100);
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateProgress);
    }
}

function hideLoading() {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
        loadingElement.style.display = 'none';
    }, 800);
}

async function fetchNews(page = 1) {
    try {
        // ニュースセクションの位置を取得
        const newsSection = document.querySelector('#news');
        
        // ローディングの表示
        loadingElement.style.display = 'flex';
        loadingElement.style.opacity = '1';
        
        currentProgress = 0;  // 初期化
        updateProgress(0);    // 0%から開始
        
        // ページ2以降の場合、newsセクションまでスクロール
        if (page > 1) {
            newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        updateProgress(20);   // フェッチ開始
        const response = await fetch(
            `https://${SERVICE_DOMAIN}.microcms.io/api/v1/${END_POINT}?limit=${ITEMS_PER_PAGE}&offset=${(page - 1) * ITEMS_PER_PAGE}`,
            {
                headers: {
                    'X-MICROCMS-API-KEY': API_KEY
                }
            }
        );
        
        updateProgress(50);   // データ受信完了
        const data = await response.json();
        updateProgress(70);   // JSON解析完了
        
        // ニュースグリッドをフェードアウト
        const newsGrid = document.querySelector('.news-grid');
        newsGrid.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // コンテンツをクリアして新しい記事を表示
        newsGrid.innerHTML = '';
        displayNews(data.contents);
        
        // ニュースグリッドをフェードイン
        setTimeout(() => {
            newsGrid.style.opacity = '1';
        }, 100);
        
        updateProgress(85);   // 表示処理開始
        
        // ページネーションを表示
        displayPagination(data.totalCount, page);
        setupModalHandlers(data.contents);
        
        updateProgress(100);  // 全処理完了
        await new Promise(resolve => setTimeout(resolve, 300));
        hideLoading();
        
    } catch (error) {
        console.error('ニュースの取得に失敗しました:', error);
        hideLoading();
    }
}

function displayNews(newsItems) {
    const newsGrid = document.querySelector('.news-grid');
    newsGrid.innerHTML = '';
    
    newsItems.forEach(news => {
        const date = new Date(news.publishedAt);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.dataset.body = news.body;
        
        newsCard.innerHTML = `
            <div class="news-image">
                <img src="${news.thumbnail.url}" alt="${news.title}">
            </div>
            <div class="news-content">
                <time datetime="${news.publishedAt}">${formattedDate}</time>
                <span class="news-tag">${news.tag}</span>
                <h3>${news.title}</h3>
            </div>
        `;

        // カード全体のクリックイベントを追加
        newsCard.style.cursor = 'pointer';
        newsCard.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const newsData = {
                date: formattedDate,
                tag: news.tag,
                title: news.title,
                body: news.body
            };
            openModal(newsData);
        });
        
        newsGrid.appendChild(newsCard);
    });
}

function setupModalHandlers() {
    const modal = document.getElementById('newsModal');
    const closeButton = modal.querySelector('.close-button');
    const modalContent = modal.querySelector('.modal-content');

    function closeModal() {
        modal.classList.remove('show');
        // トランジション完了後に非表示にする
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300); // CSSのトランジション時間と合わせる
    }

    // モーダルを閉じる処理
    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    });

    // モーダルの外側をクリックした時の処理
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            e.preventDefault();
            closeModal();
        }
    });

    // モーダルコンテンツ内のクリックイベントの伝播を停止
    modalContent.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function displayPagination(total, currentPage) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    // 前へボタン
    const prevButton = document.createElement('button');
    prevButton.textContent = '前へ';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => fetchNews(currentPage - 1);
    
    // 次へボタン
    const nextButton = document.createElement('button');
    nextButton.textContent = '次へ';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => fetchNews(currentPage + 1);
    
    // ページ番号ボタン
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.onclick = () => fetchNews(i);
        pageButtons.push(pageButton);
    }
    
    // ページネーションの組み立て
    paginationContainer.appendChild(prevButton);
    pageButtons.forEach(button => paginationContainer.appendChild(button));
    paginationContainer.appendChild(nextButton);
    
    // 既存のページネーションを削除して新しいものを追加
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    document.querySelector('#news').appendChild(paginationContainer);
}

// モーダルを開く関数を追加
function openModal(newsData) {
    const modal = document.getElementById('newsModal');
    modal.querySelector('.modal-date').textContent = newsData.date;
    modal.querySelector('.modal-tag').textContent = newsData.tag;
    modal.querySelector('.modal-title').textContent = newsData.title;
    modal.querySelector('.modal-body').innerHTML = newsData.body;
    
    modal.style.display = 'block';
    // トランジションのためのタイミング調整
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    document.body.style.overflow = 'hidden';
}

function updateProgressUI(progress) {
    // プログレス数値の更新
    progressElement.textContent = `${Math.round(progress)}%`;
    
    // プログレスバーの更新
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        // afterとbeforeの両方の要素に直接スタイルを適用
        const afterBar = progressBar.querySelector('::after');
        const beforeBar = progressBar.querySelector('::before');
        
        // スタイルを直接設定
        progressBar.style.setProperty('--progress', Math.round(progress));
    }
}

// 初期化時にモーダルのセットアップを行う
document.addEventListener('DOMContentLoaded', () => {
    fetchNews(1);
    setupModalHandlers();
}); 