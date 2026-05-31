/* ============================================================
   StreetRacer 3D — real-world 3D driving
   - Mapbox GL JS Standard style  -> real 3D buildings + roads
   - Threebox                     -> player car + AI traffic (3D)
   - First & third-person cameras, oncoming traffic
   - Postcode / place search + random spawns
   Needs a free Mapbox public token (pk....). No billing.
   ============================================================ */

(function () {
  'use strict';

  var el = {
    start:       document.getElementById('start'),
    game:        document.getElementById('game'),
    mapDiv:      document.getElementById('map'),
    searchForm:  document.getElementById('searchForm'),
    placeInput:  document.getElementById('placeInput'),
    tokenInput:  document.getElementById('tokenInput'),
    randomBtn:   document.getElementById('randomBtn'),
    famousBtn:   document.getElementById('famousBtn'),
    backBtn:     document.getElementById('backBtn'),
    respawnBtn:  document.getElementById('respawnBtn'),
    camBtn:      document.getElementById('camBtn'),
    camFirst:    document.getElementById('camFirst'),
    camThird:    document.getElementById('camThird'),
    startStatus: document.getElementById('startStatus'),
    placeLabel:  document.getElementById('placeLabel'),
    speedValue:  document.getElementById('speedValue'),
    gearLabel:   document.getElementById('gearLabel')
  };

  var FAMOUS = [
    { name: 'London',        lat: 51.50094, lng: -0.12466 },
    { name: 'New York',      lat: 40.75889, lng: -73.98513 },
    { name: 'Paris',         lat: 48.85837, lng: 2.29448 },
    { name: 'Tokyo',         lat: 35.65858, lng: 139.74543 },
    { name: 'San Francisco', lat: 37.79280, lng: -122.40640 },
    { name: 'Chicago',       lat: 41.88250, lng: -87.62340 },
    { name: 'Dubai',         lat: 25.19720, lng: 55.27441 },
    { name: 'Singapore',     lat: 1.28346, lng: 103.85070 },
    { name: 'Toronto',       lat: 43.64870, lng: -79.38170 },
    { name: 'Sydney',        lat: -33.86680, lng: 151.20550 },
    { name: 'Hong Kong',     lat: 22.28030, lng: 114.15880 },
    { name: 'Bengaluru',     lat: 12.97560, lng: 77.60565 }
  ];

  // ---- state ----
  var map, tb, playerCar = null, traffic = [], builtScene = false;
  var camMode = 'third';               // 'first' | 'third'
  var pos = { lat: 51.5, lng: -0.12 };
  var heading = 0;                     // deg, 0 = north
  var speed = 0;                       // m/s
  var keys = {};
  var lastTime = 0;
  var running = false;

  var MAX_SPEED = 50, ACCEL = 18, BRAKE = 36, DRAG = 5, TURN_RATE = 95;
  var LANE = 3.2;                      // metres, lane offset
  var R = 6378137;                     // earth radius (m)

  /* ---------------- geo helpers ---------------- */
  function dest(lng, lat, distM, brngDeg) {
    var br = brngDeg * Math.PI / 180;
    var lat1 = lat * Math.PI / 180, lng1 = lng * Math.PI / 180;
    var dr = distM / R;
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dr) +
                         Math.cos(lat1) * Math.sin(dr) * Math.cos(br));
    var lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(dr) * Math.cos(lat1),
                                 Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2));
    return [lng2 * 180 / Math.PI, lat2 * 180 / Math.PI];
  }
  // signed distance of a point ahead(+)/behind(-) of player along heading
  function alongDist(lng, lat) {
    var dx = (lng - pos.lng) * Math.cos(pos.lat * Math.PI / 180) * 111320;
    var dy = (lat - pos.lat) * 110540;
    var h = heading * Math.PI / 180;
    return dx * Math.sin(h) + dy * Math.cos(h);
  }

  /* ---------------- INIT ---------------- */
  function init() {
    var saved = localStorage.getItem('mapbox_token');
    if (saved) el.tokenInput.value = saved;
    wireUI();
    requestAnimationFrame(loop);
  }

  function wireUI() {
    el.searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = el.placeInput.value.trim();
      if (!q) { setStatus('Type a postcode, zip, pincode or place first.'); return; }
      if (!getToken()) return;
      geocode(q);
    });
    el.randomBtn.addEventListener('click', function () { if (getToken()) goRandom(); });
    el.famousBtn.addEventListener('click', function () {
      if (!getToken()) return;
      var c = FAMOUS[(Math.random() * FAMOUS.length) | 0];
      startAt(c.lat, c.lng, c.name);
    });
    el.backBtn.addEventListener('click', stop);
    el.respawnBtn.addEventListener('click', goRandom);
    el.camBtn.addEventListener('click', toggleCam);
    el.camFirst.addEventListener('click', function () { setCam('first'); });
    el.camThird.addEventListener('click', function () { setCam('third'); });

    el.tokenInput.addEventListener('change', function () {
      localStorage.setItem('mapbox_token', el.tokenInput.value.trim());
    });

    window.addEventListener('keydown', function (e) {
      var k = norm(e.key); if (!k) return;
      keys[k] = true;
      if (k === 'r' && running) goRandom();
      if (k === 'c' && running) toggleCam();
      if (['up', 'down', 'left', 'right', 'space'].indexOf(k) !== -1) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { var k = norm(e.key); if (k) keys[k] = false; });

    Array.prototype.forEach.call(document.querySelectorAll('.touch__btn'), function (b) {
      var k = b.getAttribute('data-key');
      var d = function (e) { e.preventDefault(); keys[k] = true; };
      var u = function (e) { e.preventDefault(); keys[k] = false; };
      b.addEventListener('touchstart', d, { passive: false });
      b.addEventListener('touchend', u);
      b.addEventListener('mousedown', d);
      b.addEventListener('mouseup', u);
      b.addEventListener('mouseleave', u);
    });
  }

  function getToken() {
    var t = el.tokenInput.value.trim();
    if (!t || t.indexOf('pk.') !== 0) {
      setStatus('Paste your free Mapbox public token (starts with “pk.”) above first.');
      el.tokenInput.focus();
      return null;
    }
    localStorage.setItem('mapbox_token', t);
    return t;
  }

  function norm(key) {
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case ' ': return 'space';
      case 'r': case 'R': return 'r';
      case 'c': case 'C': return 'c';
      default: return null;
    }
  }

  function setCam(m) {
    camMode = m;
    el.camFirst.classList.toggle('is-active', m === 'first');
    el.camThird.classList.toggle('is-active', m === 'third');
    if (playerCar) playerCar.visible = (m === 'third');
  }
  function toggleCam() { setCam(camMode === 'third' ? 'first' : 'third'); }

  /* ---------------- location resolution ---------------- */
  function geocode(query) {
    setStatus('Searching “' + query + '”…');
    var url = 'https://api.mapbox.com/search/geocode/v6/forward?q=' +
      encodeURIComponent(query) + '&limit=1&access_token=' + encodeURIComponent(getToken());
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.features && d.features.length) {
        var c = d.features[0].geometry.coordinates;       // [lng, lat]
        startAt(c[1], c[0], d.features[0].properties.full_address || query);
      } else {
        setStatus('Couldn’t find “' + query + '”. Try a fuller postcode or a city name.');
      }
    }).catch(function () { setStatus('Lookup failed — check your token and connection.'); });
  }

  function goRandom() {
    if (!getToken()) return;
    var c = FAMOUS[(Math.random() * FAMOUS.length) | 0];
    var jLng = (Math.random() - 0.5) * 0.02, jLat = (Math.random() - 0.5) * 0.02;
    startAt(c.lat + jLat, c.lng + jLng, c.name + ' (somewhere nearby)');
  }

  /* ---------------- start a drive ---------------- */
  function startAt(lat, lng, label) {
    pos = { lat: lat, lng: lng };
    heading = Math.random() * 360; speed = 0;
    el.placeLabel.textContent = label || (lat.toFixed(4) + ', ' + lng.toFixed(4));
    setStatus('Loading 3D world…');
    showGame();

    if (!map) buildMap();
    else { resetScene(); flyToStart(); }
  }

  function buildMap() {
    mapboxgl.accessToken = getToken();
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      center: [pos.lng, pos.lat],
      zoom: 18, pitch: 60, bearing: heading,
      antialias: true, attributionControl: true, interactive: false
    });

    map.on('style.load', function () {
      try { map.setConfigProperty('basemap', 'lightPreset', 'day'); } catch (e) {}
      addThreebox();
    });
    map.on('error', function (e) {
      var msg = (e && e.error && e.error.message) ? e.error.message : '';
      if (/401|token|unauthor/i.test(msg)) {
        setStatus('Mapbox rejected the token. Make sure it’s a valid public token (pk.…).');
        stop();
      }
    });
  }

  // Threebox custom layer holds the player car + traffic.
  function addThreebox() {
    map.addLayer({
      id: 'cars3d', type: 'custom', renderingMode: '3d',
      onAdd: function (m, gl) {
        tb = new Threebox(m, gl, { defaultLights: true });
        buildScene();
        setStatus('');
      },
      render: function () { if (tb) tb.update(); }
    });
  }

  function makeCarMesh(color) {
    var T = window.THREE;
    var g = new T.Group();
    var body = new T.Mesh(
      new T.BoxGeometry(2, 4.4, 1.1),
      new T.MeshStandardMaterial({ color: color, metalness: 0.4, roughness: 0.5 }));
    body.position.z = 0.7;
    var cabin = new T.Mesh(
      new T.BoxGeometry(1.7, 2.2, 0.9),
      new T.MeshStandardMaterial({ color: 0x0a1326, metalness: 0.2, roughness: 0.3 }));
    cabin.position.set(0, -0.1, 1.5);
    g.add(body); g.add(cabin);
    // wheels
    var wm = new T.MeshStandardMaterial({ color: 0x111111 });
    [[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]].forEach(function (p) {
      var w = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.4, 14), wm);
      w.rotation.z = Math.PI / 2;
      w.position.set(p[0], p[1], 0.5);
      g.add(w);
    });
    return g;
  }

  function buildScene() {
    // player car
    playerCar = tb.Object3D({ obj: makeCarMesh(0xff2d55), units: 'meters', anchor: 'center' });
    playerCar.setCoords([pos.lng, pos.lat, 0]);
    tb.add(playerCar);
    playerCar.visible = (camMode === 'third');

    // traffic
    var colors = [0x2d7dff, 0xffd23d, 0xffffff, 0x33dd77, 0x9b59b6, 0xe67e22];
    for (var i = 0; i < 10; i++) {
      var car = tb.Object3D({ obj: makeCarMesh(colors[i % colors.length]), units: 'meters', anchor: 'center' });
      var t = { obj: car, dir: i % 2 === 0 ? 1 : -1, lane: 0, ahead: 0, speed: 0 };
      spawnTraffic(t, true);
      tb.add(car);
      traffic.push(t);
    }
    builtScene = true;
    flyToStart();
  }

  function resetScene() {
    if (playerCar) playerCar.setCoords([pos.lng, pos.lat, 0]);
    traffic.forEach(function (t) { spawnTraffic(t, true); });
  }

  function flyToStart() {
    setTimeout(function () { map.resize(); updateCamera(); setStatus(''); }, 50);
  }

  // place a traffic car relative to the player along the current street
  function spawnTraffic(t, initial) {
    t.dir = Math.random() < 0.5 ? 1 : -1;                 // 1 = same way, -1 = oncoming
    t.lane = (t.dir === -1 ? -1 : 1) * LANE;              // oncoming on the other side
    t.ahead = initial ? (30 + Math.random() * 160) : (120 + Math.random() * 80);
    t.speed = 8 + Math.random() * 14;                     // m/s
    placeTraffic(t);
  }

  function placeTraffic(t) {
    // point `ahead` metres along heading, then `lane` metres to the side
    var p = dest(pos.lng, pos.lat, t.ahead, heading);
    var side = dest(p[0], p[1], Math.abs(t.lane), heading + (t.lane < 0 ? -90 : 90));
    t.lng = side[0]; t.lat = side[1];
    t.obj.setCoords([t.lng, t.lat, 0]);
    var carHeading = t.dir === 1 ? heading : (heading + 180) % 360;
    t.obj.setRotation({ x: 0, y: 0, z: -carHeading });
  }

  /* ---------------- game loop ---------------- */
  function loop(ts) {
    var dt = Math.min(0.05, (ts - lastTime) / 1000 || 0);
    lastTime = ts;
    if (running && map && builtScene) { drive(dt); updateTraffic(dt); updateCamera(); }
    requestAnimationFrame(loop);
  }

  function drive(dt) {
    if (keys.up)        speed += ACCEL * dt;
    else if (keys.down) speed -= BRAKE * dt;
    else                speed -= Math.sign(speed) * DRAG * dt;
    if (keys.space)     speed -= Math.sign(speed) * BRAKE * 1.6 * dt;

    speed = Math.max(-MAX_SPEED * 0.35, Math.min(MAX_SPEED, speed));
    if (Math.abs(speed) < 0.15) speed = 0;

    if (speed !== 0) {
      var steer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
      var grip = 1 - Math.min(0.55, Math.abs(speed) / MAX_SPEED);
      heading = (heading + steer * TURN_RATE * grip * dt * Math.sign(speed) + 360) % 360;
      var np = dest(pos.lng, pos.lat, speed * dt, heading);
      pos.lng = np[0]; pos.lat = np[1];
    }

    if (playerCar) {
      playerCar.setCoords([pos.lng, pos.lat, 0]);
      playerCar.setRotation({ x: 0, y: 0, z: -heading });
    }

    el.speedValue.textContent = Math.abs(Math.round(speed * 3.6));
    el.gearLabel.textContent = speed > 0.5 ? 'D' : (speed < -0.5 ? 'R' : 'N');
  }

  function updateTraffic(dt) {
    for (var i = 0; i < traffic.length; i++) {
      var t = traffic[i];
      // advance the car along its own direction
      t.ahead += t.dir * t.speed * dt;
      // recycle when it passes far behind or too far ahead
      var rel = t.ahead;
      if (rel < -60 || rel > 320) { spawnTraffic(t, false); continue; }
      placeTraffic(t);
    }
  }

  function updateCamera() {
    var cam = map.getFreeCameraOptions();
    if (camMode === 'first') {
      cam.position = mapboxgl.MercatorCoordinate.fromLngLat([pos.lng, pos.lat], 2.3);
      var look = dest(pos.lng, pos.lat, 30, heading);
      cam.lookAtPoint(look, 1.5);
    } else {
      var behind = dest(pos.lng, pos.lat, 13, (heading + 180) % 360);
      cam.position = mapboxgl.MercatorCoordinate.fromLngLat(behind, 7);
      cam.lookAtPoint([pos.lng, pos.lat], 1.6);
    }
    map.setFreeCameraOptions(cam);
  }

  /* ---------------- screens ---------------- */
  function showGame() { el.start.classList.add('hidden'); el.game.classList.remove('hidden'); running = true; }
  function stop() {
    running = false;
    el.game.classList.add('hidden');
    el.start.classList.remove('hidden');
    keys = {}; speed = 0;
  }
  function setStatus(m) { el.startStatus.textContent = m; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
