(function(){

  const urlBase = 'https://api.songkick.com/api/3.0/';

  function convertDay(date) {
    let day = new Date(date).toLocaleDateString('es-ES', {weekday: 'long'});
    return capitalizeDay(day);
  }

  function capitalizeDay(day) {
    let array = day.split('');
    const firstLetter = day[0].toUpperCase();
    array.splice(0, 1, firstLetter);
    return array.join('');
  }

  function splitDate(date, type) {
    const splitter = date.split('-');
    if (type === 'year') {
      return splitter[0];
    } else if (type === 'month') {
      let day = new Date(date).toLocaleDateString('es-ES', {month: 'long'});
      return capitalizeDay(day);
    } else {
      return splitter[2];
    }
  }

  function formatTime (time) {
    if (time == null) { // take advantage of == type coercion
      return 'Hora por confirmar';
    } else {
      const colon = time.lastIndexOf(':');
      return time.slice(0, colon);
    }
  }

  function closeModal($event) {
    console.log($event.target.parentElement.parentElement.style.display = 'none');
  }

  function toggleSpinner(state) {
    const spinner = document.querySelector('.spinner');
    let css = spinner.style;
    (state === 'show') ? css.display = 'block' : css.display = 'none' ;
  }

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

  function artistDetails(id) {

    toggleSpinner('show');

    const path = 'artists/' + id + '/calendar.json?apikey=' + config.API_SK;
    const url = urlBase + path;

    callApis(url, function (data) {

      toggleSpinner('false');

      const listOfEvents = data.results.event;

      const container = document.querySelector('.container');
      container.innerHTML = '';

      const eventDetails = document.createElement('DIV');
      eventDetails.setAttribute('class', 'event-details');
      container.appendChild(eventDetails);

      const eventTotalSpan = document.createElement('SPAN');
      eventTotalSpan.setAttribute('class', 'event-total');
      eventTotalSpan.textContent = data.totalEntries + ' resultados encontrados';
      eventDetails.appendChild(eventTotalSpan);

      const ul = document.createElement('UL');
      ul.setAttribute('id', 'events');
      eventDetails.appendChild(ul);

      listOfEvents.forEach(function (item) {

        const li = document.createElement('LI');

        const div1 = document.createElement('DIV');
        div1.setAttribute('class', 'event-date');
        const eventDateYear = document.createElement('DIV');
        eventDateYear.setAttribute('class', 'event-date-year');
        const eventDateMonth = document.createElement('DIV');
        eventDateMonth.setAttribute('class', 'event-date-month');
        const eventDateDay = document.createElement('DIV');
        eventDateDay.setAttribute('class', 'event-date-day');

        const div2 = document.createElement('DIV');
        div2.setAttribute('class', 'event-date-details');
        const eventDetailsHour = document.createElement('DIV');
        eventDetailsHour.setAttribute('class', 'event-date-details-hour');
        const eventDetailsVenue = document.createElement('DIV');
        eventDetailsVenue.setAttribute('class', 'event-date-details-venue');
        const eventCityCountry = document.createElement('DIV');
        eventCityCountry.setAttribute('class', 'event-date-city-country');

        const div3 = document.createElement('DIV');
        div3.setAttribute('class', 'event-location');
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
      });

    });
  }
  
  function createListArtist(data) {

    toggleSpinner('show');

    const container = document.querySelector('.container');
    const events = document.createElement('DIV');
    events.setAttribute('class', 'events');
    container.appendChild(events);

    const listArtist = document.createElement('DIV');
    listArtist.setAttribute('class', 'list-artist');
    events.appendChild(listArtist);

    const listArtistNoEvents = document.createElement('DIV');
    listArtistNoEvents.setAttribute('class', 'list-artist-noEvents');
    events.appendChild(listArtistNoEvents);

    const arrayResults = data.results.artist;
    const totalEntries = data.totalEntries;

    const ul = document.createElement('UL');
    const ulNoEvents = document.createElement('UL');

    const spanTotalEntries = document.createElement('SPAN');
    let spanText = document.createTextNode(totalEntries + ' resultados coinciden con tu búsqueda');
    spanTotalEntries.appendChild(spanText);
    spanTotalEntries.classList.add('total-entries');
    listArtist.appendChild(spanTotalEntries);

    if (arrayResults && arrayResults.length > 0) {

      listArtist.appendChild(ul);
      listArtistNoEvents.appendChild(ulNoEvents);

      arrayResults.forEach(function (artist) {

        const path = 'artists/' + artist.id + '/calendar.json?apikey=' + config.API_SK;
        const url = urlBase + path;

        callApis(url, function (event) {

          toggleSpinner('false');

          if (event.totalEntries > 0) {

            const li = document.createElement('LI');
            const text = document.createTextNode(artist.displayName);
            li.appendChild(text);
            ul.insertBefore(li, ul.firstChild);

            const small = document.createElement('SMALL');
            const totalEvents = document.createTextNode(event.totalEntries + ' eventos encontrados');
            small.appendChild(totalEvents);
            li.appendChild(small);

            li.classList.add('list-artist-link');

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
      });
    } else {
      toggleSpinner('false');
    }
  }

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

  let inputText = document.querySelector('.inputSearch');
  searchEvents(inputText, callApis, 400);
})();