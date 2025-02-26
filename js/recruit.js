// microCMSの設定
const RECRUIT_API_KEY = 'hoFfNFSqLE9WzeZgaJIP1Hz3GxGrJfv4HMOL';
const RECRUIT_SERVICE_DOMAIN = 'moves';
const RECRUIT_ENDPOINT = 'recruit';

// APIのデータをキャッシュするための変数
let jobsData = [];

// DOMの読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing Recruit Section');
    initializeRecruit();
});

// 初期化処理
async function initializeRecruit() {
    console.log('Starting initialization');
    
    const jobList = document.querySelector('.job-list');
    if (!jobList) {
        console.error('Job list element not found');
        return;
    }

    const jobDetails = document.querySelector('.job-details');
    if (!jobDetails) {
        console.error('Job details element not found');
        return;
    }

    console.log('All required elements found');

    // デフォルトの職種を表示
    displayDefaultJobs();
    
    // APIからデータを取得
    try {
        console.log('Fetching jobs from API...');
        jobsData = await fetchJobs() || [];
        console.log('Jobs fetched:', jobsData);
        if (jobsData.length > 0) {
            // 初期表示のデータを設定（エンジニア）
            const initialJobData = jobsData.find(job => job.job_type === 'エンジニア');
            if (initialJobData) {
                updateJobDetailsFromAPI(initialJobData);
            }
        }
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });
    }
}

// デフォルトの職種を表示
function displayDefaultJobs() {
    console.log('Displaying default jobs');
    const jobList = document.querySelector('.job-list');
    const defaultJobs = ['エンジニア', '営業'];
    
    jobList.innerHTML = defaultJobs.map(job => `
        <div class="job-card ${job === 'エンジニア' ? 'active' : ''}" data-job-type="${job}">
            <h3 class="job-title">${job}</h3>
        </div>
    `).join('');

    // 各カードにクリックイベントを設定
    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', () => {
            const jobType = card.dataset.jobType;
            console.log('Job card clicked:', jobType);
            
            // アクティブなカードを更新
            document.querySelectorAll('.job-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // APIデータがある場合はそれを使用、なければデフォルトメッセージ
            const jobData = jobsData.find(job => job.job_type === jobType);
            if (jobData) {
                updateJobDetailsFromAPI(jobData);
            } else {
                updateJobDetails(jobType);
            }
        });
    });
}

// 職種の詳細を更新（デフォルトメッセージ）
function updateJobDetails(jobType) {
    console.log('Updating job details for:', jobType);
    const title = document.querySelector('.job-details-title');
    const body = document.querySelector('.job-details-body');

    if (title && body) {
        title.textContent = jobType;
        body.innerHTML = '<p>現在、募集要項を準備中です。</p>';
    }
}

// APIからデータを取得
async function fetchJobs() {
    console.log('Fetching jobs from:', `https://${RECRUIT_SERVICE_DOMAIN}.microcms.io/api/v1/${RECRUIT_ENDPOINT}`);
    const response = await fetch(
        `https://${RECRUIT_SERVICE_DOMAIN}.microcms.io/api/v1/${RECRUIT_ENDPOINT}`,
        {
            headers: {
                'X-MICROCMS-API-KEY': RECRUIT_API_KEY
            }
        }
    );
    
    if (!response.ok) {
        console.error('API Response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    return data.contents;
}

// APIから取得したデータで詳細を更新
function updateJobDetailsFromAPI(jobData) {
    console.log('Updating job details from API:', jobData);
    const title = document.querySelector('.job-details-title');
    const body = document.querySelector('.job-details-body');

    if (title && body) {
        title.textContent = jobData.job_type;
        body.innerHTML = jobData.requirements || '<p>現在、募集要項を準備中です。</p>';
    }
} 