// Leaflet 地図の初期化と境界マスク描画
window.AppMap = (function () {
  const cfg = window.APP_CONFIG;
  let map = null;
  let boundaryLayer = null;
  let boundaryFeature = null;

  function init(containerId) {
    map = L.map(containerId, {
      zoomControl: true,
      attributionControl: true,
      minZoom: cfg.minZoom,
      maxZoom: cfg.maxZoom
    }).setView(cfg.fallbackCenter, cfg.fallbackZoom);

    L.tileLayer(cfg.tileUrl, {
      attribution: cfg.tileAttribution,
      maxZoom: cfg.maxZoom,
      minZoom: cfg.minZoom,
      crossOrigin: true
    }).addTo(map);

    // ズームコントロールのサイズを大きく (高齢者向け)
    const zc = document.querySelector('.leaflet-control-zoom');
    if (zc) zc.classList.add('big-zoom');

    return map;
  }

  async function loadBoundary() {
    try {
      const res = await fetch(cfg.boundaryUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error('境界ファイルの取得に失敗: ' + res.status);
      const gj = await res.json();
      boundaryFeature = gj;
      drawBoundary(gj);
    } catch (e) {
      console.warn('[map] 境界の読み込みに失敗しました:', e);
    }
  }

  function drawBoundary(feature) {
    // 境界ポリゴンを細い線で強調表示
    boundaryLayer = L.geoJSON(feature, {
      style: {
        color: '#0b5394',
        weight: 4,
        opacity: 1,
        fillColor: '#ffffff',
        fillOpacity: 0
      }
    }).addTo(map);

    // 範囲外を暗くするマスク (世界を覆う矩形に境界ポリゴンの穴を開ける)
    const coords = extractRing(feature);
    if (coords) {
      const outer = [
        [-90, -360],
        [-90, 360],
        [90, 360],
        [90, -360]
      ];
      const hole = coords.map(function (c) { return [c[1], c[0]]; });
      L.polygon([outer, hole], {
        stroke: false,
        fillColor: '#000000',
        fillOpacity: 0.35,
        interactive: false
      }).addTo(map);
    }

    // 境界範囲にフィット
    if (boundaryLayer.getBounds().isValid()) {
      map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] });
    }
  }

  function extractRing(gj) {
    if (!gj) return null;
    if (gj.type === 'Feature') gj = gj.geometry;
    if (!gj) return null;
    if (gj.type === 'Polygon') return gj.coordinates[0];
    if (gj.type === 'MultiPolygon') return gj.coordinates[0][0];
    return null;
  }

  function getMap() { return map; }
  function getBoundary() { return boundaryFeature; }

  return { init: init, loadBoundary: loadBoundary, getMap: getMap, getBoundary: getBoundary };
})();
