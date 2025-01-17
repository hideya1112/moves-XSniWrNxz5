const API_KEY = 'hoFfNFSqLE9WzeZgaJIP1Hz3GxGrJfv4HMOL';
const SERVICE_DOMAIN = 'moves';
const END_POINT = 'news';
const ITEMS_PER_PAGE = 9; // 1ページあたりの表示件数

async function fetchNews(page = 1) {
    try {
        const response = await fetch(
            `https://${SERVICE_DOMAIN}.microcms.io/api/v1/${END_POINT}?limit=${ITEMS_PER_PAGE}&offset=${(page - 1) * ITEMS_PER_PAGE}`,
            {
                headers: {
                    'X-MICROCMS-API-KEY': API_KEY
                }
            }
        );
        
        const data = await response.json();
        displayNews(data.contents);
        displayPagination(data.totalCount, page);
        setupModalHandlers(data.contents);
    } catch (error) {
        console.error('ニュースの取得に失敗しました:', error);
    }
}

function displayNews(newsItems, currentPage = 1) {
    const newsGrid = document.querySelector('.news-grid');
    newsGrid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageItems = newsItems.slice(startIndex, endIndex);

    currentPageItems.forEach(news => {
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
                <span class="read-more">READ MORE</span>
            </div>
        `;
        
        // カード全体のクリックイベントを追加
        newsCard.style.cursor = 'pointer';
        newsCard.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // イベントの伝播を停止
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

    // ページネーションの表示を更新
    displayPagination(newsItems.length, currentPage);
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

// 初期化時にモーダルのセットアップを行う
document.addEventListener('DOMContentLoaded', () => {
    fetchNews(1);
    setupModalHandlers();
}); 