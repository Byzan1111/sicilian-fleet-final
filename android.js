// Wires the Android hardware Back button to the game (window.sfBack is defined in index.html).
(function () {
  try {
    var cap = window.Capacitor;
    if (!cap || !cap.Plugins || !cap.Plugins.App) return;
    var App = cap.Plugins.App;
    App.addListener('backButton', function () {
      var r = 'exit';
      try { r = window.sfBack ? window.sfBack() : 'exit'; } catch (e) {}
      if (r === 'exit') App.exitApp();
    });
  } catch (e) {}
})();
