// --- sw.js (サービスワーカー) ---
const CACHE_NAME = 'shiraiwa-rail-v5'; // バージョン更新
const API_URL = "https://script.google.com/macros/s/AKfycbwnOtC0MEt216M2c0PpTP9hg0vWux1_NLDlpFn8B9Y792dcMfwIX3Dv-2c9MCcdixHHmQ/exec";
const STATUS_KEY = 'last-known-status'; // 状態保存用のキー

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// 通知メッセージの辞書
const STATUS_MESSAGES = {
    'normal':   { title: '🟢 運行再開', body: '現在は平常通り運行しています。' },
    'delay':    { title: '🟠 遅延発生', body: '現在、列車に遅れが出ています。' },
    'disorder': { title: '🟣 ダイヤ乱れ', body: '現在、ダイヤが乱れています。' },
    'alert':    { title: '🔴 運転見合わせ', body: '現在、運転を見合わせています。' },
    'stopped':  { title: '⚫ 運行終了', body: '本日の運行は終了しました。' }
};

async function checkStatus() {
    try {
        // 1. 最新の情報を取得
        const response = await fetch(API_URL);
        if (!response.ok) return;
        const data = await response.json();
        const currentStatus = data.status ? String(data.status).trim() : "unknown";

        // 2. 以前の情報を「倉庫(Cache)」から取り出す
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(STATUS_KEY);
        let lastStatus = null;
        
        if (cachedResponse) {
            lastStatus = await cachedResponse.text();
        }

        // 3. 比較して通知 (前回と違う、かつ前回が空っぽではない場合)
        if (lastStatus !== null && lastStatus !== currentStatus) {
            
            const msg = STATUS_MESSAGES[currentStatus] || { 
                title: '⚪ 運行情報更新', 
                body: '運行状況が更新されました。' 
            };

            self.registration.showNotification(msg.title, {
                body: msg.body + "\n※テスト通知の場合があり正確ではない可能性があります",
                icon: "group.jpg",
                vibrate: [200, 100, 200],
                tag: 'train-status' // 通知が重ならないようにタグ付け
            });
        }

        // 4. 最新の状態を「倉庫」に上書き保存 (次回のために)
        if (lastStatus !== currentStatus) {
            await cache.put(STATUS_KEY, new Response(currentStatus));
        }

    } catch (e) {
        console.error("BG Check Error", e);
    }
}

// 5秒ごとにチェック (5000ミリ秒)
setInterval(checkStatus, 5000);
