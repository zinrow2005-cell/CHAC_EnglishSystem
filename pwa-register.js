// CHAC PWA: relative URL keeps installation working at GitHub Pages /repository/ paths.
(function () {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {scope: './'}).catch(function (error) {
      console.warn('CHAC PWA 安裝/離線功能無法啟用:', error);
    });
  });
}());
