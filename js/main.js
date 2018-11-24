function searchEvents(input, callback, delay) {
  const api = {
    API_ARTIST: 'https://api.songkick.com/api/3.0/search/artists.json?apikey='+ config.API_SK +'&query='
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

(function() {
  let inputText = document.querySelector('.inputSearch');
  searchEvents(inputText, callApis, 400);
})();