const units = {
  mph: 2.23694,
  kph: 3.6
}
const options = {
  wakeLock: null,
  watchId: null,
  speedUnit: units.mph,
  max: 0,
  distance: 0,
}
const route = {
    "type": "LineString",
    "coordinates": []
};
const ui = {
  body: document.querySelector('body'),
  toggle: document.querySelector('#toggle'),
  readout: document.querySelector('#readout'),
  units: document.querySelector('#units'),
  mph: document.querySelector('#mph'),
  kph: document.querySelector('#kph'),
  max: document.querySelector('#max'),
  distance: document.querySelector('#distance'),
}

const openNav = () => {
  document.getElementById("nav-menu").style.width = "100%";
};

const closeNav = () => {
  document.getElementById("nav-menu").style.width = "0%";
};

const resetStats = () => {
    options.distance = 0;
    options.max = 0;
    ui.distance.textContent = '...';
    ui.max.textContent = '...';
    route.coordinates = [];
};
const toggleClick = () => {
  if (options.watchId) {
    navigator.geolocation.clearWatch(options.watchId);
    options.watchId = null;
    if (options.wakeLock) {
      options.wakeLock.cancel();
    }

    ui.readout.textContent = '...';
    ui.toggle.textContent = '🔑 Start';
    ui.toggle.classList = 'button start';
  } else {
    const settings = {
      enableHighAccuracy: true
    };
    options.watchId = navigator.geolocation.watchPosition(watchPosition,
      null, settings);
      startWakeLock();
      ui.toggle.classList = 'button stop';
      ui.toggle.textContent = '🛑 Stop';
  }
}
const toggleUnits = (unit) => {
  if (!ui[unit].classList.contains('active')) {
    options.speedUnit = units[unit];
    ui.units.textContent = unit.toUpperCase();
    ui.kph.classList.toggle('active');
    ui.mph.classList.toggle('active');
    if (options.max > 0) {
        ui.max.textContent = Math.round(options.max * options.speedUnit);
    }
    if (options.distance > 0) {
        let units = (unit == 'mph' ? 'miles' : 'kilometers' );
        options.distance = turf.length(route, {units: units});
        ui.distance.textContent = options.distance;
    }
  }
}
const startWakeLock = () => {
  try {
    navigator.getWakeLock("screen").then((wakeLock) => {
      options.wakeLock = wakeLock.createRequest();
    });
  } catch(error) {
      console.log('No Wake Lock Support 😪');
    // no experimental wake lock api build
  }
}

const watchPosition = (position) => {
  ui.readout.textContent = Math.round(position.coords.speed * options.speedUnit);
  if (position.coords.speed > options.max) {
    options.max = position.coords.speed;
  }
  ui.max.textContent = Math.round(options.max * options.speedUnit);
  // 6 units of prercision is all that is needed for GPS, anything more is down to mm
  route.coordinates.push([position.coords.longitude.toFixed(8), position.coords.latitude.toFixed(8)]);
  let units = (ui.mph.classList.contains('active') ? 'miles' : 'kilometers' );
  options.distance = turf.length(route, {units: units});
  ui.distance.textContent = options.distance;
};

const startServiceWorker = () => {
  navigator.serviceWorker.register('serviceWorker.js', {
    scope: './'
  });
}
startServiceWorker();
console.log(`%c
     _     _ _                                         _
    | |   (_) |                                       | |
    | |__  _| | _____   ___ ___  _ __ ___  _ __  _   _| |_ ___ _ __
    | '_ \\| | |/ / _ \\ / __/ _ \\| '_  '_ \\| '_ \\| | | | __/ _ \\ '__|
    | |_) | |   <  __/| (_| (_) | | | | | | |_) | |_| | ||  __/ |
    |_.__/|_|_|\\_\\___(_)___\\___/|_| |_| |_| .__/ \\__,_|\\__\\___|_|
                                         | |
                                         |_|
                        o__
                        _.>/ _
    __________________(_)_\\(_)___________________________


    `, "font-family:monospace");
