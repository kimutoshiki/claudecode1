// 管理ページ: 境界ポリゴン描画 + 避難所マーカー編集
(function () {
  const cfg = window.APP_CONFIG;
  let map;
  let boundaryLayer = null;
  let sheltersLayer = null;
  let mode = 'boundary';
  let addMode = false;
  let editingMarker = null;

  const shelterIcon = L.divIcon({
    className: 'shelter-marker',
    html: '<div class="shelter-pin"><span>避</span></div>',
    iconSize: [44, 44],
    iconAnchor: [22, 42],
    popupAnchor: [0, -40]
  });
  const shelterIconUnsaved = L.divIcon({
    className: 'shelter-marker unsaved',
    html: '<div class="shelter-pin"><span>新</span></div>',
    iconSize: [44, 44],
    iconAnchor: [22, 42]
  });

  document.addEventListener('DOMContentLoaded', function () {
    map = L.map('map').setView(cfg.fallbackCenter, cfg.fallbackZoom);
    L.tileLayer(cfg.tileUrl, {
      attribution: cfg.tileAttribution,
      maxZoom: cfg.maxZoom,
      minZoom: cfg.minZoom
    }).addTo(map);

    map.pm.addControls({
      position: 'topleft',
      drawPolygon: true, editMode: true, removalMode: true,
      drawMarker: false, drawCircleMarker: false, drawCircle: false,
      drawRectangle: false, drawPolyline: false, drawText: false,
      cutPolygon: false, rotateMode: false, dragMode: false
    });
    map.pm.setLang('ja');
    map.on('pm:create', function (e) {
      if (mode !== 'boundary') { map.removeLayer(e.layer); return; }
      if (boundaryLayer) map.removeLayer(boundaryLayer);
      boundaryLayer = e.layer;
    });

    sheltersLayer = L.featureGroup().addTo(map);

    document.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.dataset.mode); });
    });

    document.getElementById('btn-load-boundary').addEventListener('click', loadBoundary);
    document.getElementById('btn-download-boundary').addEventListener('click', downloadBoundary);

    document.getElementById('btn-add-shelter').addEventListener('click', toggleAddMode);
    document.getElementById('btn-load-shelters').addEventListener('click', loadShelters);
    document.getElementById('btn-download-shelters').addEventListener('click', downloadShelters);
    document.getElementById('btn-clear-shelters').addEventListener('click', clearShelters);

    map.on('click', function (e) {
      if (mode !== 'shelter' || !addMode) return;
      if (e.originalEvent && e.originalEvent.target &&
          e.originalEvent.target.closest && e.originalEvent.target.closest('.leaflet-marker-icon')) {
        return;
      }
      addShelterAt(e.latlng);
    });

    document.getElementById('shelter-form').addEventListener('submit', function (e) {
      e.preventDefault();
      saveShelter();
    });
    document.getElementById('btn-cancel').addEventListener('click', cancelEdit);
    document.getElementById('btn-delete').addEventListener('click', deleteShelter);
  });

  function setMode(m) {
    mode = m;
    document.body.dataset.mode = m;
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.mode === m);
    });
    document.getElementById('boundary-tools').hidden = (m !== 'boundary');
    document.getElementById('shelter-tools').hidden = (m !== 'shelter');
    document.getElementById('help-boundary').hidden = (m !== 'boundary');
    document.getElementById('help-shelter').hidden = (m !== 'shelter');
    if (m === 'shelter') {
      try { map.pm.disableDraw(); } catch (e) {}
    } else {
      stopAddMode();
    }
    status(m === 'boundary' ? '境界の描画モードです。' : '避難所の編集モードです。');
  }

  function toggleAddMode() {
    addMode = !addMode;
    updateAddBtn();
    if (addMode) {
      status('地図上の避難所の位置をタップしてください。もう一度「避難所を追加」を押すと終了します。');
      L.DomUtil.addClass(map.getContainer(), 'crosshair');
    } else {
      L.DomUtil.removeClass(map.getContainer(), 'crosshair');
    }
  }

  function stopAddMode() {
    addMode = false;
    updateAddBtn();
    L.DomUtil.removeClass(map.getContainer(), 'crosshair');
  }

  function updateAddBtn() {
    const b = document.getElementById('btn-add-shelter');
    b.textContent = addMode ? '避難所の追加を終了' : '避難所を追加';
    b.classList.toggle('active', addMode);
  }

  function addShelterAt(latlng) {
    const marker = L.marker(latlng, { icon: shelterIconUnsaved, draggable: true, pmIgnore: true });
    marker.feature = { type: 'Feature', properties: {} };
    attachMarker(marker);
    editMarker(marker);
  }

  function attachMarker(marker) {
    marker.on('click', function (ev) {
      if (mode !== 'shelter') return;
      if (ev && ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
      editMarker(marker);
    });
    marker.on('dragend', function () { /* position updated; properties unchanged */ });
    marker.addTo(sheltersLayer);
  }

  function editMarker(marker) {
    editingMarker = marker;
    const p = marker.feature && marker.feature.properties || {};
    const form = document.getElementById('shelter-form');
    form.elements.name.value = p.name || '';
    form.elements.name_kana.value = p.name_kana || '';
    form.elements.address.value = p.address || '';
    form.elements.type.value = p.type || '指定避難所';
    form.elements.capacity.value = p.capacity != null ? p.capacity : '';
    form.elements.note.value = p.note || '';
    const haz = Array.isArray(p.hazards) ? p.hazards : [];
    form.querySelectorAll('input[name=hazards]').forEach(function (cb) {
      cb.checked = haz.indexOf(cb.value) !== -1;
    });
    document.getElementById('shelter-modal').hidden = false;
    setTimeout(function () {
      try { form.elements.name.focus(); } catch (e) {}
    }, 60);
  }

  function saveShelter() {
    if (!editingMarker) return;
    const form = document.getElementById('shelter-form');
    const hazards = Array.prototype.slice
      .call(form.querySelectorAll('input[name=hazards]:checked'))
      .map(function (cb) { return cb.value; });
    const p = {
      name: form.elements.name.value.trim(),
      name_kana: form.elements.name_kana.value.trim(),
      address: form.elements.address.value.trim(),
      type: form.elements.type.value,
      capacity: form.elements.capacity.value ? Number(form.elements.capacity.value) : null,
      hazards: hazards,
      note: form.elements.note.value.trim()
    };
    if (!p.name) {
      alert('名称は必須です。');
      return;
    }
    editingMarker.feature.properties = p;
    editingMarker.setIcon(shelterIcon);
    editingMarker.bindTooltip(p.name, { direction: 'top', offset: [0, -40] });
    closeModal();
    status(p.name + ' を保存しました。 (全部で ' + sheltersLayer.getLayers().length + ' 件)');
  }

  function cancelEdit() {
    if (editingMarker) {
      const p = editingMarker.feature && editingMarker.feature.properties;
      if (!p || !p.name) {
        sheltersLayer.removeLayer(editingMarker);
      }
    }
    closeModal();
  }

  function deleteShelter() {
    if (!editingMarker) return;
    if (!confirm('この避難所を編集リストから削除しますか? (ダウンロード前なら完全に消えます)')) return;
    sheltersLayer.removeLayer(editingMarker);
    closeModal();
    status('1件削除しました。 (全部で ' + sheltersLayer.getLayers().length + ' 件)');
  }

  function closeModal() {
    document.getElementById('shelter-modal').hidden = true;
    editingMarker = null;
  }

  async function loadShelters() {
    try {
      const res = await fetch(cfg.sheltersUrl + '?t=' + Date.now());
      if (!res.ok) throw new Error(res.status);
      const gj = await res.json();
      sheltersLayer.clearLayers();
      (gj.features || []).forEach(function (f) {
        if (!f.geometry || f.geometry.type !== 'Point') return;
        const c = f.geometry.coordinates;
        const marker = L.marker([c[1], c[0]], { icon: shelterIcon, draggable: true, pmIgnore: true });
        marker.feature = { type: 'Feature', properties: f.properties || {} };
        if (f.properties && f.properties.name) {
          marker.bindTooltip(f.properties.name, { direction: 'top', offset: [0, -40] });
        }
        attachMarker(marker);
      });
      if (sheltersLayer.getLayers().length) {
        map.fitBounds(sheltersLayer.getBounds(), { padding: [40, 40], maxZoom: 17 });
      }
      status('既存の避難所を ' + sheltersLayer.getLayers().length + ' 件読み込みました。');
    } catch (e) {
      status('避難所データの読み込みに失敗: ' + e.message, true);
    }
  }

  function downloadShelters() {
    const features = [];
    sheltersLayer.eachLayer(function (m) {
      const p = m.feature && m.feature.properties;
      if (!p || !p.name) return;
      const ll = m.getLatLng();
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [ll.lng, ll.lat] },
        properties: p
      });
    });
    if (!features.length) {
      status('保存済みの避難所がまだありません。先にマーカーを追加して保存してください。', true);
      return;
    }
    const gj = {
      type: 'FeatureCollection',
      metadata: { generated: new Date().toISOString(), count: features.length },
      features: features
    };
    downloadJson('shelters.geojson', gj);
    status(features.length + ' 件を shelters.geojson としてダウンロードしました。');
  }

  function clearShelters() {
    if (!sheltersLayer.getLayers().length) return;
    if (!confirm('編集中の避難所マーカーを全部消しますか? (サーバ上のファイルには影響しません)')) return;
    sheltersLayer.clearLayers();
    status('編集中のマーカーをすべて消しました。');
  }

  async function loadBoundary() {
    try {
      const res = await fetch(cfg.boundaryUrl + '?t=' + Date.now());
      if (!res.ok) throw new Error(res.status);
      const gj = await res.json();
      if (boundaryLayer) { map.removeLayer(boundaryLayer); boundaryLayer = null; }
      const layer = L.geoJSON(gj, { style: { color: '#0b5394', weight: 4 } });
      layer.eachLayer(function (l) {
        boundaryLayer = l.addTo(map);
        try { l.pm.enable({ allowSelfIntersection: false }); } catch (e) {}
      });
      if (layer.getBounds().isValid()) map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      status('既存の境界を読み込みました。編集してダウンロードできます。');
    } catch (e) {
      status('境界を読み込めませんでした: ' + e.message, true);
    }
  }

  function downloadBoundary() {
    if (!boundaryLayer) {
      status('先に地図上でポリゴンを描いてください。', true);
      return;
    }
    const gj = boundaryLayer.toGeoJSON();
    const feature = gj.type === 'FeatureCollection' ? gj.features[0] : gj;
    feature.properties = feature.properties || {};
    feature.properties.name = '有楽自治会';
    downloadJson('yuraku-boundary.geojson', feature);
    status('ダウンロードしました。下の「反映する方法」を参考にGitHubへアップロードしてください。');
  }

  function downloadJson(filename, obj) {
    const text = JSON.stringify(obj, null, 2);
    const blob = new Blob([text], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function status(msg, isError) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status' + (isError ? ' error' : '');
  }
})();
