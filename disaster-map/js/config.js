// 有楽自治会 防災マップ - 設定
window.APP_CONFIG = {
  appName: '有楽自治会 防災マップ',

  // 国土地理院 淡色地図タイル
  // 出典: https://maps.gsi.go.jp/development/ichiran.html
  tileUrl: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
  tileAttribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>',
  minZoom: 12,
  maxZoom: 18,

  // 地図初期中心 (川崎市麻生区付近)。境界が読み込めなかった場合のフォールバック。
  fallbackCenter: [35.6036, 139.4956],
  fallbackZoom: 15,

  // データファイル
  boundaryUrl: './data/yuraku-boundary.geojson',
  sheltersUrl: './data/shelters.geojson',

  // Service Worker キャッシュ名 (バージョン変更時はここを更新)
  cacheAppName: 'yuraku-app-v1',
  cacheTilesName: 'yuraku-tiles-v1',
  maxTileCacheEntries: 800
};
