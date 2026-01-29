if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', {
    scope: '/TimeTrackerApp-V0.1/'
  }).then(registration => {
    console.log('✅ Service Worker registered:', registration);
  }).catch(error => {
    console.log('⚠️ Service Worker registration failed:', error);
  });
}
