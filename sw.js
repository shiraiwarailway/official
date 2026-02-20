// --- sw.js (サービスワーカー) ---
const CACHE_NAME = 'shiraiwa-rail-v4';
const API_URL = "https://script.google.com/macros/s/AKfycbwnOtC0MEt216M2c0PpTP9hg0vWux1_NLDlpFn8B9Y792dcMfwIX3Dv-2c9MCcdixHHmQ/exec";

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

let lastStatus = null;

// 通知メッセージの辞書
const STATUS_MESSAGES = {
    'normal':   { title: '🟢 運行再開', body: '運行が開始しました。' },
    'delay':    { title: '🟠 遅延発生', body: '現在、列車に遅れが出ています。' },
    'disorder': { title: '🟣 ダイヤ乱れ', body: '現在、ダイヤが乱れています。' },
    'alert':    { title: '🔴 運転見合わせ', body: '現在、運転を見合わせています。' },
    'stopped':  { title: '⚫ 運行終了', body: '本日の運行は終了しました。' }
};

async function checkStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return;
        const data = await response.json();
        const currentStatus = data.status ? String(data.status).trim() : "";

        // 初回チェック(null)ではなく、かつ 前回と状態が違う場合 に通知
        if (lastStatus !== null && lastStatus !== currentStatus) {
            
            // 辞書からメッセージを取得（未定義の場合はデフォルト）
            const msg = STATUS_MESSAGES[currentStatus] || { 
                title: '⚪ 運行情報更新', 
                body: '運行状況が更新されました。' 
            };

            self.registration.showNotification(msg.title, {
                body: msg.body + "\n※テスト通知の場合があり正確ではない可能性があります",
                icon: "group.jpg",
                vibrate: [200, 100, 200]
            });
        }
        
        // 状態を更新
        lastStatus = currentStatus;

    } catch (e) {
        console.error("BG Check Error", e);
    }
}

// 20秒ごとにチェック
setInterval(checkStatus, 20000);
