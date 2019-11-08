const units = {
  mph: 2.23694,
  kmh: 3.6
}
const options = {
  navigator: '',
  speedUnit: units.mph
}
const ui = {
  body: document.querySelector('body'),
  toggle: document.querySelector('#toggle'),
  readout: document.querySelector('#readout'),
  units: document.querySelector('#units'),
  mph: document.querySelector('#mph'),
  kph: document.querySelector('#kph'),
}

const toggleClick = () => {
  if (options.navigator) {
    navigator.geolocation.clearWatch(options.navigator);
    options.navigator = null;
    ui.toggle.textContent = '🔑 Start';
  } else {
    const settings = {
      enableHighAccuracy: true
    };
    options.navigator = navigator.geolocation.watchPosition(calcSpeed,
      null, settings);
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
const calcSpeed = (position) => {
  ui.readout.textContent = Math.round(position.coords.speed * options.speedUnit);
};

const startServiceWorker = () => {
  navigator.serviceWorker.register('service-worker.js', {
    scope: './'
  });
}
