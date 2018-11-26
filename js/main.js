(function () {
  function artistDetails(id) {

    const spinner = document.querySelector('.spinner');
    spinner.style.display = 'block';

    callApis('https://api.songkick.com/api/3.0/artists/' + id + '/calendar.json?apikey=' + config.API_SK, function (data) {
      console.log(data);

      spinner.style.display = 'none';

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
          //TODO searchLocation(item.venue.id);
        }, false);
      });

    });
  }


  function createListArtist(data) {

    const spinner = document.querySelector('.spinner');
    spinner.style.display = 'block';

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

        callApis('https://api.songkick.com/api/3.0/artists/' + artist.id + '/calendar.json?apikey=' + config.API_SK, function (event) {

          spinner.style.display = 'none';

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
      spinner.style.display = 'none';
    }
  }

  function searchEvents(input, callback, delay) {
    const api = {
      API_ARTIST: 'https://api.songkick.com/api/3.0/search/artists.json?apikey=' + config.API_SK + '&query='
    };
    const container = document.querySelector('.container');
    container.innerHTML = '';

    let timer = null;
    input.onkeyup = function ($event) {
      let string = '';
      const condition = $event.which >= 48 && $event.which <= 90 || $event.which === 8;
      if (condition) {
        if ($event.target.value.length > 3) {
          string = $event.target.value;
          if (timer) {
            window.clearTimeout(timer);
          }
          timer = window.setTimeout(function () {
            timer = null;
            callback(api.API_ARTIST + string, function (data) {

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

        if (xhr.status === 200) {
          xhr = JSON.parse(xhr.responseText);
          let data = xhr.resultsPage;
          callback(data);
        }
      }
    };
    xhr.send();
  }


  let inputText = document.querySelector('.inputSearch');
  searchEvents(inputText, callApis, 400);
})();