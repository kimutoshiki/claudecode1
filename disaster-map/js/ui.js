// 3ボタンUIの配線とトースト
(function () {
  document.addEventListener('DOMContentLoaded', async function () {
    const map = window.AppMap.init('map');
    await window.AppMap.loadBoundary();
    await window.AppLayers.loadShelters(map);

    const btnLocate = document.getElementById('btn-locate');
    const btnNearest = document.getElementById('btn-nearest');
    const btnHazard = document.getElementById('btn-hazard');

    btnLocate.addEventListener('click', function () {
      toast('位置情報を取得中…');
      window.AppLocate.locate(map,
        function () { toast('現在地を表示しました'); },
        function (msg) { toast(msg, true); }
      );
    });

    btnNearest.addEventListener('click', function () {
      toast('最寄りの避難所を探しています…');
      window.AppLocate.findNearest(map, window.AppLayers.getShelters(),
        function (feature, meters) {
          const name = feature.properties.name || '避難所';
          toast(name + ' / 直線距離 約' + meters + 'm');
          const layer = window.AppLayers.getLayer();
          if (layer) {
            layer.eachLayer(function (l) {
              if (l.feature && l.feature.properties.name === feature.properties.name) {
                l.openPopup();
              }
            });
          }
        },
        function (msg) { toast(msg, true); }
      );
    });

    // v1 ではハザード表示は無効 (v2 で浸水・土砂を追加予定)
    btnHazard.addEventListener('click', function () {
      toast('ハザード表示は次のバージョンで追加予定です');
    });
  });

  let toastTimer = null;
  function toast(msg, isError) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (isError ? ' error' : '');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 4000);
  }
  window.appToast = toast;
})();
