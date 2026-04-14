// 避難所レイヤー
window.AppLayers = (function () {
  const cfg = window.APP_CONFIG;
  let sheltersLayer = null;
  let shelters = [];

  const shelterIcon = L.divIcon({
    className: 'shelter-marker',
    html: '<div class="shelter-pin" aria-hidden="true"><span>避</span></div>',
    iconSize: [44, 44],
    iconAnchor: [22, 42],
    popupAnchor: [0, -40]
  });

  async function loadShelters(map) {
    try {
      const res = await fetch(cfg.sheltersUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error('避難所データの取得に失敗: ' + res.status);
      const gj = await res.json();
      shelters = gj.features || [];
      sheltersLayer = L.geoJSON(gj, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: shelterIcon, keyboard: true, title: feature.properties.name });
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(buildPopup(feature), { maxWidth: 280, minWidth: 220 });
        }
      }).addTo(map);
    } catch (e) {
      console.warn('[layers] 避難所の読み込みに失敗しました:', e);
    }
  }

  function buildPopup(feature) {
    const p = feature.properties || {};
    const hazards = Array.isArray(p.hazards) ? p.hazards.join('・') : '';
    return (
      '<div class="popup">' +
        '<div class="popup-title">' + escapeHtml(p.name || '避難所') + '</div>' +
        (p.type ? '<div class="popup-type">' + escapeHtml(p.type) + '</div>' : '') +
        (p.address ? '<div class="popup-row"><b>住所</b> ' + escapeHtml(p.address) + '</div>' : '') +
        (p.capacity ? '<div class="popup-row"><b>収容人数</b> 約' + p.capacity + '人</div>' : '') +
        (hazards ? '<div class="popup-row"><b>対応災害</b> ' + escapeHtml(hazards) + '</div>' : '') +
        (p.note ? '<div class="popup-note">' + escapeHtml(p.note) + '</div>' : '') +
      '</div>'
    );
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getShelters() { return shelters; }
  function getLayer() { return sheltersLayer; }

  return { loadShelters: loadShelters, getShelters: getShelters, getLayer: getLayer };
})();
