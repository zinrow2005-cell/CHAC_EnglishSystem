/* 補充教材入口：未來新增時只需把教材包 JS 路徑加入下面陣列。
   例如：'addons/h/lesson-h.js'。請勿填入尚未上傳的檔案。 */
window.PB_ADDON_FILES = [
  // 'addons/h/lesson-h.js',
];
window.PB_ADDON_FILES.forEach(function(path){
  if (!/^addons\/[a-z0-9_\/-]+\.js$/i.test(path) || path.indexOf('..') !== -1) return;
  document.write('<script src="' + path + '?v=633"><\/script>');
});
