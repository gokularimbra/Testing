/* ============================================================
   StreetRacer — open-world driving in real Google Street View
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM ----
  var el = {
    start:        document.getElementById('start'),
    game:         document.getElementById('game'),
    pano:         document.getElementById('pano'),
    minimap:      document.getElementById('minimap'),
    searchForm:   document.getElementById('searchForm'),
    placeInput:   document.getElementById('placeInput'),
    randomBtn:    document.getElementById('randomBtn'),
    famousBtn:    document.getElementById('famousBtn'),
    backBtn:      document.getElementById('backBtn'),
    respawnBtn:   document.getElementById('respawnBtn'),
    startStatus:  document.getElementById('startStatus'),
    placeLabel:   document.getElementById('placeLabel'),
    speedValue:   document.getElementById('speedValue'),
    gearLabel:    document.getElementById('gearLabel'),
    fatal:        document.getElementById('fatal'),
    fatalMsg:     document.getElementById('fatalMsg')
  };

  // ---- Google services ----
  var panorama, miniMap, miniMarker, geocoder, svService;
  var ready = false;

  // ---- Driving state ----
  var keys = {};            // currently-held control keys
  var heading = 0;          // direction the car faces (degrees)
  var speed = 0;            // km/h (display)
  var moveCooldown = 0;     // frames until we may hop to the next pano
  var lastTime = 0;

  // Famous, Street-View-rich city centres for the "random famous city" button
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
    { name: 'Las Vegas',     lat: 36.11470, lng: -115.17280 },
    { name: 'Singapore',     lat: 1.28346, lng: 103.86070 },
    { name: 'Toronto',       lat: 43.64256, lng: -79.38705 },
    { name: 'Berlin',        lat: 52.51628, lng: 13.37770 },
    { name: 'Bengaluru',     lat: 12.97560, lng: 77.60565 },
    { name: 'Cape Town',     lat: -33.90689, lng: 18.42064 }
  ];

  /* ------------------------------------------------------------
     INIT — called by the Google Maps script tag (callback=initGame)
     ------------------------------------------------------------ */
  window.initGame = function initGame() {
    geocoder  = new google.maps.Geocoder();
    svService = new google.maps.StreetViewService();

    panorama = new google.maps.StreetViewPanorama(el.pano, {
      visible: false,
      addressControl: false,
      showRoadLabels: true,
      linksControl: true,        // show the navigation arrows
      panControl: false,
      zoomControl: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      clickToGo: true
    });

    miniMap = new google.maps.Map(el.minimap, {
      zoom: 16,
      disableDefaultUI: true,
      gestureHandling: 'none',
      clickableIcons: false,
      mapTypeId: 'roadmap'
    });
    miniMarker = new google.maps.Marker({
      map: miniMap,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 5,
        fillColor: '#ff2d55',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 1.5,
        rotation: 0
      }
    });

    // Keep our heading in sync when the player drags to look around.
    panorama.addListener('pov_changed', function () {
      heading = panorama.getPov().heading;
    });
    panorama.addListener('position_changed', updateMiniMap);

    ready = true;
    wireUI();
    requestAnimationFrame(loop);
  };

  /* ------------------------------------------------------------
     UI WIRING
     ------------------------------------------------------------ */
  function wireUI() {
    el.searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = el.placeInput.value.trim();
      if (!q) { setStatus('Type a postcode, zip, pincode or place name first.'); return; }
      goToQuery(q);
    });

    el.randomBtn.addEventListener('click', goToRandom);
    el.famousBtn.addEventListener('click', function () {
      var c = FAMOUS[(Math.random() * FAMOUS.length) | 0];
      setStatus('Loading ' + c.name + '…');
      findPanoNear(c.lat, c.lng, 200, c.name);
    });

    el.backBtn.addEventListener('click', showStart);
    el.respawnBtn.addEventListener('click', goToRandom);

    // Keyboard
    window.addEventListener('keydown', function (e) {
      var k = norm(e.key);
      if (!k) return;
      keys[k] = true;
      if (k === 'r' && !el.game.classList.contains('hidden')) goToRandom();
      if (['up', 'down', 'left', 'right'].indexOf(k) !== -1) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) {
      var k = norm(e.key);
      if (k) keys[k] = false;
    });

    // Touch controls
    Array.prototype.forEach.call(document.querySelectorAll('.touch__btn'), function (b) {
      var k = b.getAttribute('data-key');
      var press = function (e) { e.preventDefault(); keys[k] = true; };
      var release = function (e) { e.preventDefault(); keys[k] = false; };
      b.addEventListener('touchstart', press, { passive: false });
      b.addEventListener('touchend', release);
      b.addEventListener('mousedown', press);
      b.addEventListener('mouseup', release);
      b.addEventListener('mouseleave', release);
    });
  }

  function norm(key) {
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case 'r': case 'R': return 'r';
      default: return null;
    }
  }

  /* ------------------------------------------------------------
     LOCATION RESOLUTION
     ------------------------------------------------------------ */
  function goToQuery(query) {
    if (!ready) { setStatus('Map still loading, one sec…'); return; }
    setStatus('Searching “' + query + '”…');
    geocoder.geocode({ address: query }, function (results, st) {
      if (st === 'OK' && results[0]) {
        var loc = results[0].geometry.location;
        findPanoNear(loc.lat(), loc.lng(), 1000, results[0].formatted_address);
      } else if (st === 'ZERO_RESULTS') {
        setStatus('Couldn’t find “' + query + '”. Try a different postcode or city.');
      } else if (st === 'REQUEST_DENIED') {
        setStatus('Geocoding API denied. Enable the “Geocoding API” in Google Cloud for this key.');
      } else {
        setStatus('Search failed (' + st + '). Try again.');
      }
    });
  }

  function goToRandom() {
    if (!ready) return;
    setStatus('Finding a random road with Street View…');
    attemptRandom(0);
  }

  // Random points are mostly ocean/empty, so we retry until Street View exists.
  function attemptRandom(tries) {
    if (tries > 25) {
      // Fall back to a guaranteed famous city.
      var c = FAMOUS[(Math.random() * FAMOUS.length) | 0];
      findPanoNear(c.lat, c.lng, 200, c.name);
      return;
    }
    // Bias toward populated latitudes (-55..70) for better hit rate.
    var lat = Math.random() * 125 - 55;
    var lng = Math.random() * 360 - 180;
    svService.getPanorama({
      location: { lat: lat, lng: lng },
      radius: 50000,
      source: google.maps.StreetViewSource.OUTDOOR
    }, function (data, status) {
      if (status === 'OK') {
        landOnPano(data, null);
      } else {
        attemptRandom(tries + 1);
      }
    });
  }

  function findPanoNear(lat, lng, radius, label) {
    svService.getPanorama({
      location: { lat: lat, lng: lng },
      radius: radius,
      source: google.maps.StreetViewSource.OUTDOOR
    }, function (data, status) {
      if (status === 'OK') {
        landOnPano(data, label);
      } else {
        // Try again with a wider net before giving up.
        svService.getPanorama({ location: { lat: lat, lng: lng }, radius: 5000 },
          function (d2, s2) {
            if (s2 === 'OK') landOnPano(d2, label);
            else setStatus('No Street View imagery near there. Try a nearby town or “Random”.');
          });
      }
    });
  }

  function landOnPano(data, label) {
    panorama.setPano(data.location.pano);
    panorama.setPov({ heading: 0, pitch: 0 });
    panorama.setZoom(0);
    panorama.setVisible(true);
    heading = 0;
    speed = 0;

    el.placeLabel.textContent = label || data.location.description || 'Unknown road';
    showGame();
    setStatus('');
    // Resize maps now that they're visible.
    setTimeout(function () {
      google.maps.event.trigger(panorama, 'resize');
      google.maps.event.trigger(miniMap, 'resize');
      updateMiniMap();
    }, 60);
  }

  /* ------------------------------------------------------------
     DRIVING LOOP
     ------------------------------------------------------------ */
  function loop(t) {
    var dt = Math.min(0.05, (t - lastTime) / 1000 || 0);
    lastTime = t;

    if (!el.game.classList.contains('hidden') && panorama && panorama.getVisible()) {
      drive(dt);
    }
    requestAnimationFrame(loop);
  }

  function drive(dt) {
    // Steering: rotate the point of view.
    var turn = 0;
    if (keys.left)  turn -= 1;
    if (keys.right) turn += 1;
    if (turn !== 0) {
      heading = (heading + turn * 90 * dt + 360) % 360;
      var pov = panorama.getPov();
      panorama.setPov({ heading: heading, pitch: pov.pitch });
    }

    // Throttle: build/decay speed for a nice speedometer + control hop rate.
    var target = 0;
    if (keys.up)   target = 60;
    if (keys.down) target = -25;
    speed += (target - speed) * Math.min(1, dt * 3);
    if (Math.abs(speed) < 0.5) speed = 0;

    // Update HUD
    el.speedValue.textContent = Math.abs(Math.round(speed));
    el.gearLabel.textContent = speed > 1 ? 'D' : (speed < -1 ? 'R' : 'N');

    // Hop to the next/previous panorama in the direction we're facing.
    moveCooldown -= dt;
    if (moveCooldown <= 0 && Math.abs(speed) > 5) {
      var dir = speed > 0 ? heading : (heading + 180) % 360;
      hop(dir);
      // Faster speed -> hop more often (shorter cooldown).
      moveCooldown = Math.max(0.12, 0.9 - Math.abs(speed) / 80);
    }
  }

  // Move to the linked panorama whose direction best matches `dir`.
  function hop(dir) {
    var links = panorama.getLinks();
    if (!links || !links.length) return;
    var best = null, bestDelta = 999;
    for (var i = 0; i < links.length; i++) {
      var d = angleDelta(dir, links[i].heading);
      if (d < bestDelta) { bestDelta = d; best = links[i]; }
    }
    // Only move if there's actually a road roughly that way (within 55°).
    if (best && bestDelta < 55) {
      panorama.setPano(best.pano);
    }
  }

  function angleDelta(a, b) {
    var d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  function updateMiniMap() {
    if (!panorama) return;
    var pos = panorama.getPosition();
    if (!pos) return;
    miniMap.setCenter(pos);
    miniMarker.setPosition(pos);
    miniMarker.setIcon({
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5, fillColor: '#ff2d55', fillOpacity: 1,
      strokeColor: '#fff', strokeWeight: 1.5, rotation: heading
    });
  }

  /* ------------------------------------------------------------
     SCREEN SWITCHING
     ------------------------------------------------------------ */
  function showGame() {
    el.start.classList.add('hidden');
    el.game.classList.remove('hidden');
  }
  function showStart() {
    el.game.classList.add('hidden');
    el.start.classList.remove('hidden');
    if (panorama) panorama.setVisible(false);
    speed = 0;
    keys = {};
  }
  function setStatus(msg) { el.startStatus.textContent = msg; }
})();
