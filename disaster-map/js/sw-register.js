// Service Worker 登録とホーム画面追加ヒント
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        console.log('[sw] registered:', reg.scope);
      }).catch(function (e) {
        console.warn('[sw] registration failed:', e);
      });
    });
  }

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    const hint = document.getElementById('install-hint');
    if (hint) {
      hint.hidden = false;
      hint.addEventListener('click', async function () {
        hint.hidden = true;
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      });
    }
  });
})();
