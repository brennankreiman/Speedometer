const units = {
  mph: 2.23694,
  kmh: 3.6
}
const options = {
  wakeLock: null,
  watchId: null,
  speedUnit: units.mph,
  max: 0
}
const ui = {
  body: document.querySelector('body'),
  toggle: document.querySelector('#toggle'),
  readout: document.querySelector('#readout'),
  units: document.querySelector('#units'),
  mph: document.querySelector('#mph'),
  kph: document.querySelector('#kph'),
  max: document.querySelector('#max'),
}

const toggleClick = () => {
  if (options.watchId) {
    navigator.geolocation.clearWatch(options.watchId);
    options.watchId = null;
    if (options.wakeLock) {
      options.wakeLock.cancel();
    }

    ui.readout.textContent = '...';
    ui.toggle.textContent = '🔑 Start';
  } else {
    const settings = {
      enableHighAccuracy: true
    };
    options.watchId = navigator.geolocation.watchPosition(calcSpeed,
      null, settings);
      startWakeLock();
      ui.toggle.textContent = '🛑 Stop';
  }
}
const toggleUnits = (unit) => {
  if (!ui[unit].classList.contains('active')) {
    ui.units.textContent = unit.toUpperCase();
    ui.kph.classList.toggle('active');
    ui.mph.classList.toggle('active');
  }
}
const startWakeLock = () => {
  try {
    navigator.getWakeLock("screen").then((wakeLock) => {
      options.wakeLock = wakeLock.createRequest();
    });
  } catch(error) {
    // no experimental wake lock api build
  }
}

const calcSpeed = (position) => {
  ui.readout.textContent = Math.round(position.coords.speed * options.speedUnit);
  if (position.coords.speed > options.max) {
    options.max = position.coords.speed;
  }
  ui.max.textContent = Math.round(options.max * options.speedUnit);
};

const startServiceWorker = () => {
  navigator.serviceWorker.register('serviceWorker.js', {
    scope: './'
  });
}
startServiceWorker();
