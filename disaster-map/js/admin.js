// 管理ページ: 境界ポリゴンを描いて GeoJSON としてダウンロード
(function () {
  const cfg = window.APP_CONFIG;
  let map, drawnLayer = null;

  document.addEventListener('DOMContentLoaded', function () {
    map = L.map('map').setView(cfg.fallbackCenter, cfg.fallbackZoom);
    L.tileLayer(cfg.tileUrl, {
      attribution: cfg.tileAttribution,
      maxZoom: cfg.maxZoom,
      minZoom: cfg.minZoom
    }).addTo(map);

    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawCircle: false,
      drawRectangle: false,
      drawPolyline: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      removalMode: true
    });
    map.pm.setLang('ja');

    map.on('pm:create', function (e) {
      if (drawnLayer) map.removeLayer(drawnLayer);
      drawnLayer = e.layer;
    });

    document.getElementById('btn-load').addEventListener('click', loadExisting);
    document.getElementById('btn-download').addEventListener('click', download);
  });

  async function loadExisting() {
    try {
      const res = await fetch(cfg.boundaryUrl + '?t=' + Date.now());
      if (!res.ok) throw new Error(res.status);
      const gj = await res.json();
      if (drawnLayer) { map.removeLayer(drawnLayer); drawnLayer = null; }
      const layer = L.geoJSON(gj, { style: { color: '#0b5394', weight: 4 } });
      layer.eachLayer(function (l) {
        drawnLayer = l.addTo(map);
        l.pm.enable({ allowSelfIntersection: false });
      });
      if (layer.getBounds().isValid()) map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      status('既存の境界を読み込みました。編集してからダウンロードできます。');
    } catch (e) {
      status('既存の境界を読み込めませんでした: ' + e.message, true);
    }
  }

  function download() {
    if (!drawnLayer) {
      status('先に地図上でポリゴンを描いてください。', true);
      return;
    }
    const gj = drawnLayer.toGeoJSON();
    const feature = gj.type === 'FeatureCollection' ? gj.features[0] : gj;
    feature.properties = feature.properties || {};
    feature.properties.name = '有楽自治会';
    const text = JSON.stringify(feature, null, 2);
    const blob = new Blob([text], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yuraku-boundary.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    status('ダウンロードしました。data/yuraku-boundary.geojson に置き換えて Git コミット・push してください。');
  }

  function status(msg, isError) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status' + (isError ? ' error' : '');
  }
})();
