// 現在地取得と最寄り避難所
window.AppLocate = (function () {
  let userMarker = null;
  let nearestLine = null;
  let lastPosition = null;

  function locate(map, onOk, onErr) {
    if (!('geolocation' in navigator)) {
      onErr && onErr('この端末では位置情報が使えません');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        lastPosition = latlng;
        showUser(map, latlng);
        map.setView(latlng, Math.max(map.getZoom(), 16));
        onOk && onOk(latlng);
      },
      function (err) {
        const msg = err.code === 1
          ? '位置情報が許可されていません。端末の設定から許可してください'
          : '位置情報を取得できませんでした';
        onErr && onErr(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  function showUser(map, latlng) {
    if (userMarker) {
      userMarker.setLatLng(latlng);
    } else {
      const icon = L.divIcon({
        className: 'user-marker',
        html: '<div class="user-dot" aria-hidden="true"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      userMarker = L.marker(latlng, { icon: icon, interactive: false }).addTo(map);
    }
  }

  function haversine(a, b) {
    const R = 6371000;
    const toRad = function (d) { return d * Math.PI / 180; };
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const la1 = toRad(a[0]);
    const la2 = toRad(b[0]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function findNearest(map, shelters, onOk, onErr) {
    locate(map, function (latlng) {
      if (!shelters || shelters.length === 0) {
        onErr && onErr('避難所データがありません');
        return;
      }
      let best = null;
      let bestDist = Infinity;
      shelters.forEach(function (f) {
        const c = f.geometry.coordinates;
        const shelterLL = [c[1], c[0]];
        const d = haversine(latlng, shelterLL);
        if (d < bestDist) { bestDist = d; best = { feature: f, latlng: shelterLL }; }
      });
      if (!best) { onErr && onErr('最寄り避難所が見つかりません'); return; }
      if (nearestLine) { map.removeLayer(nearestLine); nearestLine = null; }
      nearestLine = L.polyline([latlng, best.latlng], {
        color: '#e53935', weight: 5, opacity: 0.85, dashArray: '8,8'
      }).addTo(map);
      map.fitBounds(nearestLine.getBounds(), { padding: [60, 60] });
      onOk && onOk(best.feature, Math.round(bestDist));
    }, onErr);
  }

  function getLastPosition() { return lastPosition; }

  return { locate: locate, findNearest: findNearest, getLastPosition: getLastPosition };
})();
