window.$ = window.jQuery = require('jquery');

$( document ).ready(function() {
  const DATA_URL = 'https://proxy.hxlstandard.org/data.objects.json?dest=data_edit&strip-headers=on&force=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vSuwMFCg_aLAghw4CzGeL5xpGimXi4k4dFmqpvlIAt4wzZYU8GnmRANLT6dHOZwe0FpFmQ4r_Bd7iyy%2Fpub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv';
  const isMobile = $(window).width()<767? true : false;
  let data = [];

  function getData() {
    d3.json(DATA_URL).then(function(d) {
      console.log(d);
      data = d;
      initMap();
      initPanel();
    });
  }

  function initMap() {
    const zoomLevel = (isMobile) ? 1 : 2;
    const minZoomLevel = (isMobile) ? 0 : 1.8;
    const centerPos = (isMobile) ? [42, 5] : [62, 5];

    //init mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoiaHVtZGF0YSIsImEiOiJja2FvMW1wbDIwMzE2MnFwMW9teHQxOXhpIn0.Uri8IURftz3Jv5It51ISAA';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/humdata/ckaoa6kf53laz1ioek5zq97qh',
      center: [62, 5],
      minZoom: minZoomLevel,
      zoom: zoomLevel,
      attributionControl: false
    });

    // add map controls
    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();

    map.on('load', function() {
      // create popup
      const popup = new mapboxgl.Popup({
        anchor: 'top',
        closeButton: false,
        closeOnClick: false
      });

      //init map markers
      for (const marker of data) {
        let coords = { lat: Number(marker['#geo+lat']), lon: Number(marker['#geo+lon']) };
        let typeClass = marker['#metadata+icon'];
        let statusClass = 'development';
        if (marker['#status+name'].toLowerCase().includes('activated')) statusClass = 'activated';
        if (marker['#status+name'].toLowerCase().includes('endorsed')) statusClass = 'endorsed';

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = `url(https://baripembo.github.io/viz-anticipatory-action-map/assets/markers/marker_${statusClass}.svg)`;

        
        el.classList.add(statusClass);
        el.classList.add(typeClass);
        

        el.addEventListener('mouseover', () => {
          //scroll to country in panel
          let element = document.getElementById(marker["#country+name"]);
          element.parentNode.scrollTop = element.offsetTop - 15;

          //show map popup
          map.getCanvas().style.cursor = 'pointer';
          let popupText = `<div class="label ${statusClass}">${marker["#country+name"]}<div class="type">${marker["#event+name"]}</div></div>`;
          popup.setLngLat(coords).setHTML(popupText).addTo(map);
        });

        el.addEventListener('mouseout', () => {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });

        //add markers to the map
        new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);
      }
    });
  }

  function initPanel() {
    let content = '';
    for (const country of data) {
      let activations = country['#value+spend'].replace('|', '<br>');
      content += `<h2 id="${country['#country+name']}">${country['#country+name']}</h2>`;
      content += '<table>';
      content += `<tr><td>Shock: </td><td>${country['#event+name']}</td></tr>`;
      content += `<tr><td>Trigger Indicators: </td><td>${country['#indicator+text']}</td></tr>`;
      content += `<tr><td>Status: </td><td>${country['#status+name']}</td></tr>`;
      content += `<tr><td>Last activations: </td><td>${activations}</td></tr>`;
      content += `<tr><td>Analysis code: </td><td><a href="${country['#project+url']}" target="_blank">Link</a></td></tr>`;
      content += '</table>'
    }
    $('#panel .panel-inner').html(content);
  }

  function initTracking() {
    //initialize mixpanel
    let MIXPANEL_TOKEN = '';
    mixpanel.init(MIXPANEL_TOKEN);
    mixpanel.track('page view', {
      'page title': document.title,
      'page type': 'datavis'
    });
  }

  getData();
  //initTracking();
});