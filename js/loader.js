/**
 * loader.js - 画面コンポーネント非同期読み込み専用スクリプト
 */
const PAGE_FILES = [
  'pages/home.html',
  'pages/settings.html',
  'pages/char-edit.html',
  'pages/stage-select.html',
  'pages/enemy-select.html',
  'pages/battle.html',
  'pages/status.html',
  'pages/fitting.html',
  'pages/lab.html',
  'pages/item-shop.html',
  'pages/equip-shop.html',
  'pages/flea-market.html',
  'pages/gacha.html',
  'pages/admin.html'
];

async function loadAllPages() {
  const container = document.getElementById('main-content');
  if (!container) return;
  container.innerHTML = '';

  for (const file of PAGE_FILES) {
    try {
      const response = await fetch(file);
      if (response.ok) {
        const htmlText = await response.text();
        container.insertAdjacentHTML('beforeend', htmlText);
      } else {
        console.error(`コンポーネント読み込み失敗: ${file}`);
      }
    } catch (err) {
      console.error(`ネットワークエラー: ${file}`, err);
    }
  }

  // すべてのDOM構築が完了したことを通知（script.js側で受け取る）
  document.dispatchEvent(new CustomEvent('pagesLoaded'));
}

window.addEventListener('DOMContentLoaded', loadAllPages);