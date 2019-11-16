const units = {
  mph: 2.23694,
  kph: 3.6
}
const options = {
  center: [],
  map: '',
  wakeLock: null,
  watchId: null,
  speedUnit: units.mph,
  max: 0,
  avg: 0,
  distance: 0,
}
const route =  {
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": []
    }
};

const setCenter = (position) => {
    options.center = [position.coords.latitude.toFixed(6), position.coords.longitude.toFixed(6)];
    document.querySelector('#view-route').style.display = 'block';
}
const avgArray = [];
const ui = {
  body: document.querySelector('body'),
  toggle: document.querySelector('#toggle'),
  readout: document.querySelector('#readout'),
  units: document.querySelector('#units'),
  mph: document.querySelector('#mph'),
  kph: document.querySelector('#kph'),
  max: document.querySelector('#max'),
  avg: document.querySelector('#avg'),
  distance: document.querySelector('#distance'),
}

const openNav = () => {
  document.getElementById("nav-menu").style.width = "100%";
  navigator.geolocation.getCurrentPosition(setCenter);
};

const closeNav = () => {
  document.getElementById("nav-menu").style.width = "0%";
  document.getElementById("map").style.display = "none";
  document.getElementById("menu-content").style.display = "block";
  if(options.map != null) {
      options.map.remove();
      options.map = null;

  }
};

const resetStats = () => {
    options.distance = 0;
    options.max = 0;
    options.avg = 0;
    ui.distance.textContent = '...';
    ui.max.textContent = '...';
    ui.avg.textContent = '...';
    ui.readout.textContent = '...';
    route.geometry.coordinates = [];
};
const toggleClick = () => {
  if (options.watchId) {
    navigator.geolocation.clearWatch(options.watchId);
    options.watchId = null;
    if (options.wakeLock) {
      options.wakeLock.cancel();
    }
    ui.toggle.textContent = 'Start';
    ui.toggle.classList = 'button start';
  } else {
        if ("geolocation" in navigator) {
            const settings = {
              enableHighAccuracy: true
            };
            options.watchId = navigator.geolocation.watchPosition(watchPosition,
              error, settings);
              startWakeLock();
              ui.toggle.classList = 'button stop';
              ui.toggle.textContent = 'Stop';
        } else {
            ui.toggle.classList = 'button stop';
            ui.toggle.textContent = 'Position not Available';
            ut.toggle.setAttribute("editable", true);
        }

  }
}

const error = (err) => {
    ui.readout.textContent = err.message;
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
        ui.distance.textContent = options.distance.toFixed(2);
    }
    if (options.avg > 0) {
        ui.avg.textContent = (options.avg  * options.speedUnit).toFixed(2);
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
    ui.max.textContent = Math.round(options.max * options.speedUnit);
  }
  avgArray.push(position.coords.speed);
  options.avg = avgArray.reduce((a, b) => a + b, 0);

  if (
        (
            typeof route.geometry.coordinates[route.geometry.coordinates.length-1] == typeof undefined
        )
        ||
        (
            route.geometry.coordinates[route.geometry.coordinates.length-1][0] !== position.coords.longitude.toFixed(6)
            && route.geometry.coordinates[route.geometry.coordinates.length-1][1] !== position.coords.latitude.toFixed(6)
        )
    ) {
      route.geometry.coordinates.push([position.coords.latitude.toFixed(6), position.coords.longitude.toFixed(6)]);
  }
  let units = (ui.mph.classList.contains('active') ? 'miles' : 'kilometers' );
  options.distance = turf.length(route, {units: units});
  ui.distance.textContent = options.distance.toFixed(2);
  ui.avg.textContent = (options.avg  * options.speedUnit).toFixed(2);
};
const showMap = () => {
    let menu = document.querySelector('#menu-content');
    let mapEl = document.querySelector('#map');
    mapEl.style.display = 'block';
    menu.style.display = 'none';
    if (!options.map) {
        options.map = L.map('map').setView(options.center, 13);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29nd29ybGRtYXAiLCJhIjoiN3Vmb1FXTSJ9.HDCxpYrUAFQoc6u8sY-Hnw', {
                maxZoom: 18,
                attribution: ' <div  class="attr">Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a></div>',
                id: 'mapbox.light'
            }).addTo(options.map);
        L.geoJSON(route).addTo(options.map);
    }
}

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
