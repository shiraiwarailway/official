// --- sw.js (サービスワーカー) ---
const CACHE_NAME = 'shiraiwa-rail-v3'; // キャッシュ名を更新
const API_URL = "https://script.google.com/macros/s/AKfycbwnOtC0MEt216M2c0PpTP9hg0vWux1_NLDlpFn8B9Y792dcMfwIX3Dv-2c9MCcdixHHmQ/exec";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

let lastStatus = null;

async function checkStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return;
        const data = await response.json();
        const currentStatus = data.status ? String(data.status).trim() : "";

        // 前回と違い、かつ今回が「normal(運行中)」なら通知
        if (lastStatus !== null && lastStatus !== 'normal' && currentStatus === 'normal') {
            self.registration.showNotification("運行再開のお知らせ", {
                body: "白岩電鉄の運行が開始(正常化)されました！",
                icon: "group.jpg",
                vibrate: [200, 100, 200]
            });
        }
        lastStatus = currentStatus;
    } catch (e) {
        console.error("BG Check Error", e);
    }
}

// 20秒ごとにチェック (20000ミリ秒)
setInterval(checkStatus, 20000);
