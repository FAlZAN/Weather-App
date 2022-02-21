//auto detect location using geolocation & display current weather data
function geoLocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);

    function showPosition(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      //reverseGeoCoding by using lat, lon and convert it to city names
      reverseGeoCode(latitude, longitude);

      //fetches current weather
      currentWeather(latitude, longitude);

      //fetches weekly and hourly weather
      weeklyWeather(latitude, longitude);

      moreDetail(latitude, longitude);
    }
  }
}

//reverseGeoCoding by using lat, lon and convert it to city names
function reverseGeoCode(latitude, longitude) {
  //coords to city/place name
  const opencageApiKey = "";

  let reverseUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${opencageApiKey}`;
  fetch(reverseUrl, {
    method: "GET",
    "Content-Type": "application/json",
  })
    .then((response) => response.json())
    .then((reversedData) => {
      const city = reversedData.results[0].components.city;
      const suburb = reversedData.results[0].components.suburb;
      const stateDistrict = reversedData.results[0].components.state_district;
      const state = reversedData.results[0].components.state;

      city == undefined && suburb == undefined
        ? (document.querySelector(
            ".city-name"
          ).innerText = `${stateDistrict}, ${state}`)
        : (document.querySelector(
            ".city-name"
          ).innerText = `${suburb}, ${city}`);
    });
}

//fetches current weather
function currentWeather(latitude, longitude) {
  //fetching current weather using latitude and longitude
  const owApiKey = "";

  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${owApiKey}`;
  fetch(url, {
    method: "GET",
    "Content-Type": "application/json",
  })
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(".wc-text").innerText = data.weather[0].main;
      document.querySelector(".temp .deg").innerText = Math.round(
        Math.floor(data.main.temp)
      );
      document.querySelector(".high-low .high").innerText = Math.round(
        Math.floor(data.main.temp_max)
      );
      document.querySelector(".high-low .low").innerText = Math.round(
        Math.floor(data.main.temp_min)
      );
      document.querySelector(".realfeel span").innerText = Math.round(
        Math.floor(data.main.feels_like)
      );
    });
}

//fetches weekly and hourly weather
function weeklyWeather(latitude, longitude) {
  //weekly weather
  const owApiKey = "";

  let weeklyUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${owApiKey}`;
  fetch(weeklyUrl, {
    method: "GET",
    "Content-Type": "application/json",
  })
    .then((response) => response.json())
    .then((weeklyData) => {
      //extra-data
      const humidity = weeklyData.current.humidity;
      const uv = weeklyData.current.uvi;
      let uvi;
      uv < 1
        ? (uvi = 0)
        : uv <= 2
        ? (uvi = "Low")
        : uv <= 5
        ? (uvi = "Moderate")
        : uv <= 7
        ? (uvi = "High")
        : uv <= 10
        ? (uvi = "Very High")
        : (uvi = "Extreme");
      const visibility = weeklyData.current.visibility;
      const visibility_km = visibility / 1000;
      const pressure = weeklyData.current.pressure;

      document.querySelector(".section-1 .humidity span").innerText = humidity;
      document.querySelector(".section-1 .uv span").innerText = uvi;
      document.querySelector(
        ".section-2 .visibility span"
      ).innerText = `${visibility_km} km`;
      document.querySelector(".section-2 .pressure span").innerText = pressure;

      for (let element = 0; element <= 6; element++) {
        const wcIcon = weeklyData.daily[element].weather[0].icon;

        //date and time conversion
        const unix_timestamp = weeklyData.daily[element].dt;
        const date = new Date(unix_timestamp * 1000).toString();
        let day = date.slice(0, 3);

        //daily data 1st tile
        document.querySelector(`.daily-0 .day`).innerText = "Today";
        document.querySelector(
          ".daily-0 .icon img"
        ).src = `/icon/weather/${wcIcon}.svg`;
        /*for default icons by openweathermap
           document.querySelector(
             `.daily-0 .icon img`
           ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
         */
        document.querySelector(`.daily-0 .condition`).innerText =
          weeklyData.daily[0].weather[0].main;

        //daily data rest tile
        document.querySelector(`.daily-${element} .day`).innerText = day;
        document.querySelector(
          `.daily-${element} .icon img`
        ).src = `/icon/weather/${wcIcon}.svg`;
        /* for default icons by openweathermap
         document.querySelector(
           `.daily-${element} .icon img`
         ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
         */
        document.querySelector(`.daily-${element} .condition`).innerText =
          weeklyData.daily[element].weather[0].main;
      }

      for (let element = 1; element <= 12; element++) {
        const timeStamp = new Date(weeklyData.hourly[element].dt * 1000);
        const hour = timeStamp.getHours();
        const hours = hour % 12 || 12;
        hour >= 12 ? (period = "PM") : (period = "AM");
        const minute = timeStamp.getMinutes();
        const time = `${hours}:${minute} ${period}`;
        const wcIcon = weeklyData.hourly[element].weather[0].icon;
        const temp = Math.round(Math.floor(weeklyData.hourly[element].temp));

        document.querySelector(`.hourly-data .data${element} .hour`).innerText =
          time;
        document.querySelector(
          `.hourly-data .data${element} .icon img`
        ).src = `/icon/weather/${wcIcon}.svg`;
        /*
         document.querySelector(
           `.hourly-data .data${element} .icon img`
         ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
         */
        document.querySelector(`.hourly-data .data${element} .temp`).innerHTML =
          temp + "<span>°</span>";
      }
    });
}

function moreDetail(latitude, longitude) {
  for (let element = 0; element <= 6; element++) {
    document
      .querySelector(`.daily-${element}`)
      .addEventListener("click", () => {
        document
          .querySelector(`.daily-${element} .caret`)
          .classList.toggle("caret-active");
        document
          .querySelector(".more-details")
          .classList.toggle("more-details-active");

        const owApiKey = "";
        let weeklyUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${owApiKey}`;
        fetch(weeklyUrl, {
          method: "GET",
          "Content-Type": "application/json",
        })
          .then((response) => response.json())
          .then((data) => {
            const time =
              new Date().getHours() >= 12 ? new Date().getHours() - 12 : 12;
            //capitalizing every word in string
            const weather = data.daily[element].weather[0].description;
            const weatherArray = weather.split(" ");
            for (let element = 0; element < weatherArray.length; element++) {
              weatherArray[element] =
                weatherArray[element].charAt(0).toUpperCase() +
                weatherArray[element].slice(1);
            }
            const weather_joined = weatherArray.join(" ");

            let temp;
            time < 12
              ? (temp = data.daily[element].temp.morn)
              : time > 12
              ? (temp = data.daily[element].temp.day)
              : time >= 5
              ? (temp = data.daily[element].temp.eve)
              : (temp = data.daily[element].temp.night);
            const rounded_temp = Math.round(Math.floor(temp));
            const wind = Math.round(
              (data.daily[element].wind_speed * (60 * 60)) / 1000
            );
            const pressure = data.daily[element].pressure;
            const humidity = data.daily[element].humidity;
            const uv = data.daily[element].uvi;
            let uvi;
            uv < 1
              ? (uvi = 0)
              : uv <= 2
              ? (uvi = "Low")
              : uv <= 5
              ? (uvi = "Moderate")
              : uv <= 7
              ? (uvi = "High")
              : uv <= 10
              ? (uvi = "Very High")
              : (uvi = "Extreme");

            const sunrise = new Date(data.daily[element].sunrise * 1000);
            const sunriseMinute =
              sunrise.getMinutes() < 10
                ? "0" + sunrise.getMinutes()
                : sunrise.getMinutes();
            const sunrise_data = `${sunrise.getHours()}:${sunriseMinute}`;
            const sunset = new Date(data.daily[element].sunset * 1000);
            const sunset_data = `${
              sunset.getHours() >= 12 ? sunset.getHours() - 12 : 12
            }:${sunset.getMinutes()}`;

            document.querySelector(".weather .title").innerText =
              weather_joined;
            document.querySelector(
              ".weather .data"
            ).innerHTML = `${rounded_temp}<sup>°</sup>C`;
            document.querySelector(".wind .data").innerText = `${wind}km/h`;
            document.querySelector(
              ".pressure .data"
            ).innerText = `${pressure} hPa`;
            document.querySelector(
              ".humidity .data"
            ).innerText = `${humidity}%`;
            document.querySelector(".uv .data").innerText = uvi;
            document.querySelector(
              ".sunrise .data"
            ).innerText = `${sunrise_data} AM`;
            document.querySelector(
              ".sunset .data"
            ).innerText = `${sunset_data} PM`;
          });
      });
  }
}

//fetching weather data using geolocation lat & lon on loading of body
document.body.onload = () => {
  console.log("body loaded");
  geoLocate();
};

//search bar functionality
document.querySelector(".search-bar form").addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = document.getElementById("cityName");
  cityName.blur();
});

let submitBtn = document.getElementById("submit");
submitBtn.addEventListener("click", () => {
  const cityName = document.getElementById("cityName").value;

  const url = `https://api.ipgeolocation.io/astronomy?apiKey=&location=${cityName}`;
  fetch(url, {
    method: "GET",
    "Content-Type": "application/json",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const latitude = data.location.latitude;
      const longitude = data.location.longitude;
      const owApiKey = "";

      //
      const reverseUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=`;
      fetch(reverseUrl, {
        method: "GET",
        "Content-Type": "application/json",
      })
        .then((response) => response.json())
        .then((reversedData) => {
          console.log(reversedData);
          const city = reversedData.results[0].components.city;
          const suburb = reversedData.results[0].components.suburb;
          const stateDistrict =
            reversedData.results[0].components.state_district;
          const state = reversedData.results[0].components.state;

          city == undefined && suburb == undefined
            ? (document.querySelector(
                ".city-name"
              ).innerText = `${stateDistrict}, ${state}`)
            : (document.querySelector(
                ".city-name"
              ).innerText = `${suburb}, ${city}`);
        });
      //

      //weather of city by cityname using lat and lon
      let secUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=`;
      fetch(secUrl, {
        method: "GET",
        "Content-Type": "application/json",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          //
          const wcText = data.weather[0].main;
          document.querySelector(".wc-text").innerText = wcText;
          const wcIcon = data.weather[0].icon;
          document.querySelector(
            ".daily-0 .icon img"
          ).src = `/icon/weather/${wcIcon}.svg`;
          /**(document.querySelector(
            ".wc-icon img"
          ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
          **/
          //
          document.querySelector(".temp .deg").innerText = Math.round(
            Math.floor(data.main.temp)
          );
          document.querySelector(".high-low .high").innerText = Math.round(
            Math.floor(data.main.temp_max)
          );
          document.querySelector(".high-low .low").innerText = Math.round(
            Math.floor(data.main.temp_min)
          );
          document.querySelector(".realfeel span").innerText = Math.round(
            Math.floor(data.main.feels_like)
          );
        });

      //weekly data
      let weeklyUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${owApiKey}`;
      fetch(weeklyUrl, {
        method: "GET",
        "Content-Type": "application/json",
      })
        .then((response) => response.json())
        .then((weeklyData) => {
          console.log(weeklyData);
          const humidity = weeklyData.current.humidity;
          const uv = weeklyData.current.uvi;
          let uvi;
          uv < 1
            ? (uvi = 0)
            : uv <= 2
            ? (uvi = "Low")
            : uv <= 5
            ? (uvi = "Moderate")
            : uv <= 7
            ? (uvi = "High")
            : uv <= 10
            ? (uvi = "Very High")
            : (uvi = "Extreme");
          const visibility = weeklyData.current.visibility;
          const visibility_km = visibility / 1000;
          const pressure = weeklyData.current.pressure;

          document.querySelector(".section-1 .humidity span").innerText =
            humidity;
          document.querySelector(".section-1 .uv span").innerText = uvi;
          document.querySelector(
            ".section-2 .visibility span"
          ).innerText = `${visibility_km}km`;
          document.querySelector(".section-2 .pressure span").innerText =
            pressure;

          for (let element = 1; element <= 6; element++) {
            const wcIcon = weeklyData.daily[element].weather[0].icon;

            //date and time conversion
            const unix_timestamp = weeklyData.daily[element].dt;
            const date = new Date(unix_timestamp * 1000).toString();
            let day = date.slice(0, 3);

            //daily data 1st tile
            document.querySelector(`.daily-0 .day`).innerText = "Today";
            document.querySelector(
              ".daily-0 .icon img"
            ).src = `/icon/weather/${wcIcon}.svg`;
            /**
            document.querySelector(
              `.daily-0 .icon img`
            ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
            */
            document.querySelector(`.daily-0 .condition`).innerText =
              weeklyData.daily[0].weather[0].main;

            //daily data rest tile
            document.querySelector(`.daily-${element} .day`).innerText = day;
            document.querySelector(
              `.daily-${element} .icon img`
            ).src = `/icon/weather/${wcIcon}.svg`;
            /**
            document.querySelector(
              `.daily-${element} .icon img`
            ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
            **/
            document.querySelector(`.daily-${element} .condition`).innerText =
              weeklyData.daily[element].weather[0].main;
          }

          for (let element = 1; element <= 12; element++) {
            const timeStamp = new Date(weeklyData.hourly[element].dt * 1000);
            const hour = timeStamp.getHours();
            hours = hour % 12 || 12;
            const minute = timeStamp.getMinutes();
            const time = `${hours}:${minute}`;
            const wcIcon = weeklyData.hourly[element].weather[0].icon;
            const temp = Math.round(
              Math.floor(weeklyData.hourly[element].temp)
            );

            document.querySelector(
              `.hourly-data .data${element} .hour`
            ).innerText = time;
            document.querySelector(
              `.hourly-data .data${element} .icon img`
            ).src = `/icon/weather/${wcIcon}.svg`;
            /**
            document.querySelector(
              `.hourly-data .data${element} .icon img`
            ).src = `http://openweathermap.org/img/wn/${wcIcon}@4x.png`;
            */
            document.querySelector(
              `.hourly-data .data${element} .temp`
            ).innerHTML = temp + "<span>°</span>";
          }
        });
    });
});
