// --- sw.js (サービスワーカー) ---
const CACHE_NAME = 'shiraiwa-rail-v1';
const API_URL = "https://script.google.com/macros/s/AKfycbwnOtC0MEt216M2c0PpTP9hg0vWux1_NLDlpFn8B9Y792dcMfwIX3Dv-2c9MCcdixHHmQ/exec";

// インストール時に即座に有効化
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

let lastStatus = null;

// 定期的にチェックする関数
async function checkStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return;
        const data = await response.json();
        const currentStatus = data.status ? String(data.status).trim() : "";

        // 前回の状態が「運行中以外」で、今回「normal(運行中)」になったら通知
        if (lastStatus !== null && lastStatus !== 'normal' && currentStatus === 'normal') {
            self.registration.showNotification("運行再開のお知らせ", {
                body: "白岩電鉄の運行が開始(正常化)されました！",
                icon: "group.jpg", // 同じフォルダに画像が必要です
                vibrate: [200, 100, 200]
            });
        }
        lastStatus = currentStatus;
    } catch (e) {
        console.error("BG Check Error", e);
    }
}

// ブラウザが許可すれば、定期的に裏で動こうとします
// ※注意: 最近のブラウザは電池節約のため、ここでのsetIntervalを止めることがあります
setInterval(checkStatus, 60000); // 1分ごとにチェック
