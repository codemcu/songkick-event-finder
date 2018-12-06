(function(){

  const urlBase = 'https://api.songkick.com/api/3.0/';

  /**
   * @description convierte un día a formato local, (wednesday -> miércoles)
   * @param {string} date - fecha formato (2018-12-07)
   * @return {Function} capitalizeFirstLetter
   */
  function convertDay(date) {
    let day = new Date(date).toLocaleDateString('es-ES', {weekday: 'long'});
    return capitalizeFirstLetter(day);
  }

  /**
   * @description capitaliza el día de la semana
   * @param {string} day, día de semana
   * @return {string} string
   */
  function capitalizeFirstLetter(day) {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  /**
   * @description convierte la fecha del evento a formato local
   * @param {string} date - fecha formato (2018-12-07)
   * @param {string} type - (día, mes o año)
   * @returns {string | number} string en el caso de que el type sea mount y number si no
   */
  function splitDate(date, type) {
    const fullDate = new Date(date);
    if (type === 'year') {
      return fullDate.getFullYear();
    } else if (type === 'month') {
      return capitalizeFirstLetter(new Date(date).toLocaleDateString('es-ES', {month: 'long'}));
    } else if (type === 'day') {
      return fullDate.getDate();
    }
  }

  /**
   * @description quita los dos ceros finales a la hora del evento (19:30:00)
   * @param {string} time, hora del evento
   * @return {string} hora sin los dos ceros finales (19:30)
   * @see https://github.com/rwaldron/idiomatic.js/
   */
  function formatTime (time) {
    if (time == null) { // take advantage of == type coercion
      return 'Hora por confirmar';
    } else {
      const colon = time.lastIndexOf(':');
      return time.slice(0, colon);
    }
  }

  /**
   * @description cierra el modal (display: none)
   * @param {target: string} $event - elemento del DOM que será 'display: none'
   * @return void
   */
  function closeModal($event) {
    console.log($event.target.parentElement.parentElement.style.display = 'none');
  }

  /**
   * @description muestra u oculta el spinner con css dependiendo de si el state es show o no
   * @param {string} si es show, aplica 'block' a display, en otro caso, 'none'
   * @return void
   */
  function toggleSpinner(state) {
    const spinner = document.querySelector('.spinner');
    let css = spinner.style;
    (state === 'show') ? css.display = 'block' : css.display = 'none' ;
  }
  /**
   * @description crea un nodeElement y le asigna una clase de CSS
   * @param {string} tagName - nombre de la etiqueta
   * @param {string} className - nombre de la clase de CSS
   * @return {HTMLElement}
   */
  function createTagAndSetStyle(tagName, className) {
    const tag = document.createElement(tagName);
    tag.classList.add(className);
    return tag;
  }

  /**
   * @description busca la ubicación del evento en los mapas de Google Maps
   * @param {string} idEvent - id que servirá para obtener las coordenadas del evento
   * @param data.results.venue: array - array de todas las direcciones
   * @param event.street - dirección del evento para el DOM
   * @param google.maps.Map - API google maps
   * @param google.maps.Marker - API google maps
   * @return void
   */
  function searchLocation(idEvent) {

    const eventDetails = document.querySelector('.event-details');

    const divModal = document.createElement('DIV');
    divModal.setAttribute('class', 'modal');
    divModal.style.display = 'block';
    eventDetails.appendChild(divModal);

    const modal = document.querySelector('.modal');
    const divModalContent = document.createElement('DIV');
    divModalContent.setAttribute('class', 'modal-content');
    modal.appendChild(divModalContent);

    const modalContent = document.querySelector('.modal-content');

    const span = document.createElement('SPAN');
    span.setAttribute('class', 'close');
    span.addEventListener('click', closeModal, false);
    span.textContent = 'X';
    modalContent.appendChild(span);

    const h1 = document.createElement('H1');
    modalContent.appendChild(h1);

    const h3 = document.createElement('H3');
    modalContent.appendChild(h3);

    const p1 = document.createElement('P');
    const p2 = document.createElement('P');
    const p3 = document.createElement('P');
    modalContent.appendChild(p1);
    modalContent.appendChild(p2);
    modalContent.appendChild(p3);

    const divMap = document.createElement('DIV');
    divMap.setAttribute('id', 'map');
    divMap.style.display = 'block';
    modalContent.appendChild(divMap);

    const path = 'venues/ ' + idEvent + '.json?apikey=' + config.API_SK;
    const url = urlBase + path;

    callApis(url, function (data) {

      console.log(data);

      const event = data.results.venue;

      if (event.lat !== null && event.lng !== null) {

        divModal.querySelector('h1').textContent = event.displayName;
        divModal.querySelector('h3').textContent = event.street + ' - ' + event.zip;
        let pes = divModal.querySelectorAll('p');
        pes[0].textContent = event.phone;
        pes[1].textContent = event.website;
        pes[2].textContent = event.city.country.displayName;

        const location = {lat: event.lat, lng: event.lng};
        const map = new google.maps.Map(divMap, {
          zoom: 12,
          center: location
        });
        const marker = new google.maps.Marker({
          position: location,
          map: map,
          title: event.street
        });
      } else {
        divModal.firstElementChild.children[1].textContent = 'No podemos mostrar la ubicación en el mapa';
      }
    });

  }

  /**
   * @description crea una lista con todos los detalles de los eventos del artista
   * @param {number} id - id del artista para buscar todos sus eventos relacionados
   * @param data.totalEntries - numero total de resultados
   * @param tem.start.date - fecha. Parametro para la función splitDate
   * @return void
   */
  function artistDetails(id) {

    toggleSpinner('show');

    const path = 'artists/' + id + '/calendar.json?apikey=' + config.API_SK;
    const url = urlBase + path;

    callApis(url, function (data) {

      toggleSpinner('hide');

      const listOfEvents = data.results.event;

      const container = document.querySelector('.container');
      container.innerHTML = '';

      const eventDetails = createTagAndSetStyle('DIV', 'event-details');
      container.appendChild(eventDetails);

      const eventTotalSpan = createTagAndSetStyle('SPAN', 'event-total');
      eventTotalSpan.textContent = data.totalEntries + ' resultados encontrados';
      eventDetails.appendChild(eventTotalSpan);

      const ul = document.createElement('UL');
      ul.setAttribute('id', 'events');
      eventDetails.appendChild(ul);

      listOfEvents.forEach(function (item) {

        _createStructureEventDetail(item, ul);

      });

    });
  }

  /**
   * @description crea la estructura con los detalles de cada evento divido por filas, (fecha, ciudad, y botón para buscarlo en el google maps)
   * @param {Object} item - contiene los detalles del evento seleccionado
   * @param {HTMLElement} ul - nodo contenedor
   * @return void
   * @private
   */
  function _createStructureEventDetail(item, ul) {
    const li = document.createElement('LI');

    const div1 = createTagAndSetStyle('DIV', 'event-date');
    const eventDateYear = createTagAndSetStyle('DIV', 'event-date-year');
    const eventDateMonth = createTagAndSetStyle('DIV', 'event-date-month');
    const eventDateDay = createTagAndSetStyle('DIV', 'event-date-day');

    const div2 = createTagAndSetStyle('DIV', 'event-date-details');
    const eventDetailsHour = createTagAndSetStyle('DIV', 'event-date-details-hour');
    const eventDetailsVenue = createTagAndSetStyle('DIV', 'event-date-details-venue');
    const eventCityCountry = createTagAndSetStyle('DIV', 'event-date-city-country');

    const div3 = createTagAndSetStyle('DIV', 'event-location');
    const button = document.createElement('BUTTON');
    button.appendChild(document.createTextNode('Buscar en el mapa'));

    div1.appendChild(eventDateDay);
    div1.appendChild(eventDateMonth);
    div1.appendChild(eventDateYear);

    div2.appendChild(eventDetailsHour);
    div2.appendChild(eventDetailsVenue);
    div2.appendChild(eventCityCountry);

    div3.appendChild(button);

    li.appendChild(div1);
    li.appendChild(div2);
    li.appendChild(div3);
    ul.appendChild(li);

    eventDateYear.textContent = splitDate(item.start.date, 'year');
    eventDateMonth.textContent = splitDate(item.start.date, 'month');
    eventDateDay.textContent = splitDate(item.start.date, 'day');

    eventDetailsHour.textContent = convertDay(item.start.date) + ' - ' + formatTime(item.start.time);
    eventDetailsVenue.textContent = item.venue.displayName;
    eventCityCountry.textContent = item.location.city;
    button.addEventListener('click', function () {
      searchLocation(item.venue.id);
      button.disabled = true;
    }, false);
  }

  /**
   * @description crea la la lista de artistas (ul > li) que coincidan con la búsqueda
   * @param {Response} data - respuesta del servidor
   * @param data.results.artist - contiene el array con todos los artistas
   * @param data.totalEntries - numero total de artistas encontrados
   * @return void
   */
  function createListArtist(data) {

    toggleSpinner('show');
    const arrayResults = data.results.artist;
    const totalEntries = data.totalEntries;

    const container = document.querySelector('.container');

    const events = createTagAndSetStyle('DIV', 'events');
    container.appendChild(events);

    const listArtist = createTagAndSetStyle('DIV', 'list-artist');
    events.appendChild(listArtist);

    const listArtistNoEvents = createTagAndSetStyle('DIV', 'list-artist-noEvents');
    events.appendChild(listArtistNoEvents);

    const ul = document.createElement('UL');
    const ulNoEvents = document.createElement('UL');

    const spanTotalEntries = createTagAndSetStyle('SPAN', 'total-entries');
    let spanText = document.createTextNode(totalEntries + ' resultados coinciden con tu búsqueda');
    spanTotalEntries.appendChild(spanText);
    listArtist.appendChild(spanTotalEntries);

    if (arrayResults && arrayResults.length > 0) {

      listArtist.appendChild(ul);
      listArtistNoEvents.appendChild(ulNoEvents);

      arrayResults.forEach(function (artist) {

        _orderListArtistByEvents(artist, ul, ulNoEvents);

      });
    } else {
      toggleSpinner('hide');
    }

  }

  /**
   * @description coloca más arriba los artistas con número total de eventos > 0 y debajo los que no
   * @param {Object} artist - contiene el nombre y el id del artista
   * @param {HTMLElement} ul - contenedor para los artistas con numero de eventos > 0
   * @param {HTMLElement} ulNoEvents - contenedor para los artidtas cuyo número de eventos sea = 0
   * @return void
   * @private
   */
  function _orderListArtistByEvents (artist, ul, ulNoEvents) {
    const path = 'artists/' + artist.id + '/calendar.json?apikey=' + config.API_SK;
    const url = urlBase + path;

    callApis(url, function (event) {

      toggleSpinner('hide');

      if (event.totalEntries > 0) {

        const li = createTagAndSetStyle('LI', 'list-artist-link');
        const text = document.createTextNode(artist.displayName);
        li.appendChild(text);
        ul.insertBefore(li, ul.firstChild);

        const small = document.createElement('SMALL');
        const totalEvents = document.createTextNode(event.totalEntries + ' eventos encontrados');
        small.appendChild(totalEvents);
        li.appendChild(small);

        document.querySelector('.list-artist-link').addEventListener('click', function () {
          artistDetails(artist.id);
        }, false);

      } else {
        const li = document.createElement('LI');
        const text = document.createTextNode(artist.displayName);
        li.appendChild(text);
        ulNoEvents.appendChild(li);

        const small = document.createElement('SMALL');
        const totalEvents = document.createTextNode(event.totalEntries + ' eventos encontrados');
        small.appendChild(totalEvents);
        li.appendChild(small);
      }
    });
  }

  /**
   * @description coge el texto del input y le pasa ese valor a callApis para hacer una llamada AJAX
   * @param {Element} input - input tipo tagName
   * @param {Function} callback nque se ejecutará cuando el servidor responda con un 200
   * @param {number} delay - delay para el disparador de la función
   * @return void
   */
  function searchEvents(input, callback, delay) {
    const path = 'search/artists.json?apikey=' + config.API_SK + '&query=';
    const url = urlBase + path;

    const container = document.querySelector('.container');
    container.innerHTML = '';

    let timer = null;
    input.onkeyup = function ($event) {
      let string = '';
      const condition = $event.which >= 48 && $event.which <= 90 || $event.which === 8 || $event.which === 13;
      if (condition) {
        if ($event.target.value.length > 3) {
          string = $event.target.value;
          if (timer) {
            window.clearTimeout(timer);
          }
          timer = window.setTimeout(function () {
            timer = null;
            callback(url + string, function (data) {

              container.innerHTML = '';
              createListArtist(data);

            });
          }, delay);
        } else if ($event.target.value === '') {
          container.innerHTML = '';
        }

      }

    };
    input = null;
  }

  /**
   * @description interfaz standard de XMLHttpRequest, podría no funcionar en navegadores antiguos
   * @param {string} url - dirección de la API
   * @param {Function} callback - función que se ejecutará después de recibir una respuesta satisfactoria del servidor
   * @param xhr.resultsPage - contiene una key expecífica de la respuesta del servidor para pintar resultados
   */
  function callApis(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {

        if (xhr.status >= 200 && xhr.status <= 300 ) {
          xhr = JSON.parse(xhr.responseText);
          let data = xhr.resultsPage;
          callback(data);
        } else {
          const container = document.querySelector('.container');
          container.innerHTML = `Error: ${xhr.status}`;
        }
      }
    };
    xhr.send();
  }

  /**
   * @description Selecciono el elemento HTML (input) que me servirá para inicializar la aplicación de búsqueda de eventos
   */
  let inputText = document.querySelector('.inputSearch');
  searchEvents(inputText, callApis, 400);
})();