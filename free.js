/* ============================================================
   StreetRacer (free edition)
   - Top-down driving on OpenStreetMap (Leaflet) — no API key
   - Postcode/place lookup via Nominatim — no API key
   - Optional street-view driving via Mapillary — free token
   ============================================================ */

(function () {
  'use strict';

  var el = {
    start:       document.getElementById('start'),
    game:        document.getElementById('game'),
    mapDiv:      document.getElementById('map'),
    panoDiv:     document.getElementById('pano'),
    car:         document.getElementById('car'),
    searchForm:  document.getElementById('searchForm'),
    placeInput:  document.getElementById('placeInput'),
    randomBtn:   document.getElementById('randomBtn'),
    famousBtn:   document.getElementById('famousBtn'),
    backBtn:     document.getElementById('backBtn'),
    respawnBtn:  document.getElementById('respawnBtn'),
    startStatus: document.getElementById('startStatus'),
    placeLabel:  document.getElementById('placeLabel'),
    speedValue:  document.getElementById('speedValue'),
    gearLabel:   document.getElementById('gearLabel'),
    modeMap:     document.getElementById('modeMap'),
    modeStreet:  document.getElementById('modeStreet'),
    tokenRow:    document.getElementById('tokenRow'),
    tokenInput:  document.getElementById('tokenInput')
  };

  var FAMOUS = [
    { name: 'London',        lat: 51.50094, lng: -0.12466 },
    { name: 'New York',      lat: 40.75889, lng: -73.98513 },
    { name: 'Paris',         lat: 48.85837, lng: 2.29448 },
    { name: 'Tokyo',         lat: 35.65858, lng: 139.74543 },
    { name: 'San Francisco', lat: 37.80869, lng: -122.41610 },
    { name: 'Rome',          lat: 41.89021, lng: 12.49231 },
    { name: 'Sydney',        lat: -33.85678, lng: 151.21527 },
    { name: 'Barcelona',     lat: 41.40363, lng: 2.17435 },
    { name: 'Amsterdam',     lat: 52.37316, lng: 4.89066 },
    { name: 'Dubai',         lat: 25.19720, lng: 55.27441 },
    { name: 'Singapore',     lat: 1.28346, lng: 103.86070 },
    { name: 'Berlin',        lat: 52.51628, lng: 13.37770 },
    { name: 'Bengaluru',     lat: 12.97560, lng: 77.60565 },
    { name: 'Cape Town',     lat: -33.90689, lng: 18.42064 }
  ];

  // ---- state ----
  var mode = 'map';                 // 'map' | 'street'
  var map, mvViewer;
  var pos = { lat: 51.5, lng: -0.12 };
  var heading = 0;                  // degrees, 0 = north
  var speed = 0;                    // m/s
  var keys = {};
  var lastTime = 0;
  var running = false;

  var MAX_SPEED = 55;               // m/s  (~200 km/h)
  var ACCEL = 22;                   // m/s^2
  var BRAKE = 40;
  var DRAG = 6;
  var TURN_RATE = 130;              // deg/sec at full lock

  /* ---------------- INIT ---------------- */
  function init() {
    map = L.map('map', {
      zoomControl: false, attributionControl: true,
      dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
      boxZoom: false, keyboard: false, touchZoom: false
    }).setView([pos.lat, pos.lng], 17);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // restore a saved Mapillary token
    var saved = localStorage.getItem('mly_token');
    if (saved) el.tokenInput.value = saved;

    wireUI();
    requestAnimationFrame(loop);
  }

  function wireUI() {
    el.searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = el.placeInput.value.trim();
      if (!q) { setStatus('Type a postcode, zip, pincode or place name first.'); return; }
      geocode(q);
    });

    el.randomBtn.addEventListener('click', goRandom);
    el.famousBtn.addEventListener('click', function () {
      var c = FAMOUS[(Math.random() * FAMOUS.length) | 0];
      startAt(c.lat, c.lng, c.name);
    });

    el.backBtn.addEventListener('click', stop);
    el.respawnBtn.addEventListener('click', goRandom);

    el.modeMap.addEventListener('click', function () { setMode('map'); });
    el.modeStreet.addEventListener('click', function () { setMode('street'); });

    el.tokenInput.addEventListener('change', function () {
      localStorage.setItem('mly_token', el.tokenInput.value.trim());
    });

    window.addEventListener('keydown', function (e) {
      var k = norm(e.key); if (!k) return;
      keys[k] = true;
      if (k === 'r' && running) goRandom();
      if (['up', 'down', 'left', 'right', 'space'].indexOf(k) !== -1) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) {
      var k = norm(e.key); if (k) keys[k] = false;
    });

    Array.prototype.forEach.call(document.querySelectorAll('.touch__btn'), function (b) {
      var k = b.getAttribute('data-key');
      var down = function (e) { e.preventDefault(); keys[k] = true; };
      var up = function (e) { e.preventDefault(); keys[k] = false; };
      b.addEventListener('touchstart', down, { passive: false });
      b.addEventListener('touchend', up);
      b.addEventListener('mousedown', down);
      b.addEventListener('mouseup', up);
      b.addEventListener('mouseleave', up);
    });
  }

  function setMode(m) {
    mode = m;
    el.modeMap.classList.toggle('is-active', m === 'map');
    el.modeStreet.classList.toggle('is-active', m === 'street');
    el.tokenRow.classList.toggle('hidden', m !== 'street');
  }

  function norm(key) {
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case ' ': return 'space';
      case 'r': case 'R': return 'r';
      default: return null;
    }
  }

  /* ---------------- LOCATION ---------------- */
  function geocode(query) {
    setStatus('Searching “' + query + '”…');
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' +
              encodeURIComponent(query);
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.length) {
          startAt(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
        } else {
          setStatus('Couldn’t find “' + query + '”. Try a nearby town or a full postcode.');
        }
      })
      .catch(function () { setStatus('Lookup failed (network). Check your connection and retry.'); });
  }

  function goRandom() {
    // Top-down tiles exist everywhere, but bias to populated latitudes for nicer roads.
    var lat = Math.random() * 120 - 50;
    var lng = Math.random() * 360 - 180;
    setStatus('Dropping you somewhere random…');
    reverseName(lat, lng);
    startAt(lat, lng, null);
  }

  function reverseName(lat, lng) {
    var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' +
              lat + '&lon=' + lng;
    fetch(url).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.display_name) el.placeLabel.textContent = d.display_name;
        else el.placeLabel.textContent = lat.toFixed(3) + ', ' + lng.toFixed(3);
      })
      .catch(function () {});
  }

  function startAt(lat, lng, label) {
    pos = { lat: lat, lng: lng };
    heading = 0; speed = 0;
    el.placeLabel.textContent = label || (lat.toFixed(3) + ', ' + lng.toFixed(3));
    setStatus('');

    if (mode === 'street') { startStreet(lat, lng); }
    else { startMap(lat, lng); }
  }

  /* ---------------- TOP-DOWN (free) ---------------- */
  function startMap(lat, lng) {
    el.panoDiv.classList.add('hidden');
    el.mapDiv.classList.remove('hidden');
    el.car.classList.remove('hidden');
    showGame();
    setTimeout(function () {
      map.invalidateSize();
      map.setView([lat, lng], 17, { animate: false });
    }, 60);
  }

  /* ---------------- STREET VIEW (Mapillary) ---------------- */
  function startStreet(lat, lng) {
    var token = el.tokenInput.value.trim();
    if (!token) { setStatus('Add a free Mapillary token to use street view, or switch to top-down.'); return; }
    localStorage.setItem('mly_token', token);
    setStatus('Finding street imagery near you…');

    var d = 0.01; // ~1km bbox
    var bbox = (lng - d) + ',' + (lat - d) + ',' + (lng + d) + ',' + (lat + d);
    var url = 'https://graph.mapillary.com/images?access_token=' + encodeURIComponent(token) +
              '&fields=id&bbox=' + bbox + '&limit=1';

    fetch(url).then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.data && data.data.length) {
          openMapillary(token, data.data[0].id);
        } else {
          setStatus('No Mapillary photos near there. Try a big city, or use top-down mode.');
        }
      })
      .catch(function () { setStatus('Mapillary request failed — check the token, or use top-down mode.'); });
  }

  function openMapillary(token, imageId) {
    el.mapDiv.classList.add('hidden');
    el.car.classList.add('hidden');
    el.panoDiv.classList.remove('hidden');
    el.panoDiv.innerHTML = '';
    showGame();

    try {
      mvViewer = new mapillary.Viewer({
        accessToken: token,
        container: 'pano',
        imageId: imageId,
        component: { cover: false }
      });
      setStatus('');
    } catch (err) {
      setStatus('Could not start the Mapillary viewer. Use top-down mode instead.');
    }
  }

  // In street mode, W/S step to the next/previous photo along the road.
  var stepCooldown = 0;
  function streetStep(dt) {
    stepCooldown -= dt;
    if (stepCooldown > 0 || !mvViewer || !mapillary.NavigationDirection) return;
    var dir = null;
    if (keys.up)   dir = mapillary.NavigationDirection.Next;
    if (keys.down) dir = mapillary.NavigationDirection.Prev;
    if (dir !== null) {
      mvViewer.moveDir(dir).then(function () {}).catch(function () {});
      stepCooldown = 0.5;
      el.speedValue.textContent = keys.up ? 30 : 0;
      el.gearLabel.textContent = keys.up ? 'D' : 'R';
    } else {
      el.speedValue.textContent = 0;
      el.gearLabel.textContent = 'N';
    }
  }

  /* ---------------- GAME LOOP ---------------- */
  function loop(t) {
    var dt = Math.min(0.05, (t - lastTime) / 1000 || 0);
    lastTime = t;
    if (running) {
      if (mode === 'street') streetStep(dt);
      else drive(dt);
    }
    requestAnimationFrame(loop);
  }

  function drive(dt) {
    // throttle / brake
    if (keys.up)        speed += ACCEL * dt;
    else if (keys.down) speed -= BRAKE * dt;
    else                speed -= Math.sign(speed) * DRAG * dt;

    if (keys.space) speed -= Math.sign(speed) * BRAKE * 1.5 * dt;

    speed = Math.max(-MAX_SPEED * 0.4, Math.min(MAX_SPEED, speed));
    if (Math.abs(speed) < 0.2) speed = 0;

    // steering — only when moving, scaled down at speed for stability
    if (speed !== 0) {
      var steer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
      var grip = 1 - Math.min(0.6, Math.abs(speed) / MAX_SPEED);
      heading = (heading + steer * TURN_RATE * grip * dt * Math.sign(speed) + 360) % 360;
    }

    // integrate position
    if (speed !== 0) {
      var rad = heading * Math.PI / 180;
      var dist = speed * dt;                       // metres this frame
      var dLat = (dist * Math.cos(rad)) / 111320;
      var dLng = (dist * Math.sin(rad)) / (111320 * Math.cos(pos.lat * Math.PI / 180));
      pos.lat += dLat;
      pos.lng += dLng;
      map.setView([pos.lat, pos.lng], map.getZoom(), { animate: false });
    }

    // rotate car sprite to heading
    el.car.style.transform = 'translate(-50%, -50%) rotate(' + heading + 'deg)';

    // HUD
    el.speedValue.textContent = Math.abs(Math.round(speed * 3.6));
    el.gearLabel.textContent = speed > 0.5 ? 'D' : (speed < -0.5 ? 'R' : 'N');
  }

  /* ---------------- SCREENS ---------------- */
  function showGame() {
    el.start.classList.add('hidden');
    el.game.classList.remove('hidden');
    running = true;
  }
  function stop() {
    running = false;
    el.game.classList.add('hidden');
    el.start.classList.remove('hidden');
    keys = {}; speed = 0;
    if (mvViewer) { try { mvViewer.remove(); } catch (e) {} mvViewer = null; }
  }
  function setStatus(m) { el.startStatus.textContent = m; }

  // boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
