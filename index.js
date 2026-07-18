const searchButton = document.getElementById('searchButton');
const searchInputBox = document.getElementById('searchBox');
let cards = [
     cityLabel = document.getElementById('cityLabel'),
     tempPara = document.getElementById('tempP'),
     feelPara = document.getElementById('feelP'),
     skyPara = document.getElementById('skyP'),
     humPara = document.getElementById('humP'),
     windPara = document.getElementById('windP'),
     prePara = document.getElementById('preP'),
     dayPara = document.getElementById('dayP'),
     timePara = document.getElementById('timeP'),
     sunrisePara = document.getElementById('sunriseP'),
     sunsetPara = document.getElementById('sunsetP')
]

const API_KEY = "d11f62c86af0689b83f21ce6c1325331";
function getToday () {
    let today = new Date();
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    let day = days[today.getDay()];
    return day;
}
function getTime () {
    let now = new Date();
    let time = now.toLocaleDateString([], {
        hour: "2-digit",
        minute : "2-digit"
    });
    return time;
}
function unixToCityTime(unixTime, timezoneOffset) {

    let cityDate = new Date((unixTime + timezoneOffset) * 1000);

    return cityDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
    });

}
async function getSuggestions (search) {
    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=7&appid=${API_KEY}`;
    if (search.length < 3) {
        return;
    }
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    let cities = data;
    let suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = "";
    if (cities.length === 0) {
            suggestions.style.display = "none";
            return;
    }
    cities.forEach(city => {
        let div = document.createElement('div');
        div.textContent = `${city.name}, ${city.country}`;
        div.className = "suggestion";
        div.addEventListener('click', function() {
            searchInputBox.value = city.name;
            suggestions.innerHTML = "";
            suggestions.style.display = "none";
            searchButton.click();
            });
        suggestions.appendChild(div);
        });
        
    suggestions.style.display = "block";
};
async function getGraph (search) {
    if (window.weatherChart) {
        window.weatherChart.destroy();
    }
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${API_KEY}&units=metric`;
    let response = await fetch(url);
    let data = await response.json();
    times = [];
    temps = [];
    for (let i=0; i<8; i++) {
        times.push(data.list[i].dt_txt.slice(11,16))
        temps.push(data.list[i].main.temp);
    }
    console.table(
    data.list.slice(0, 8).map(item => ({
        time: item.dt_txt,
        temp: item.main.temp
    }))
);
   window.weatherChart = new Chart(document.getElementById("forecastChart"), {

    type: "line",

    data: {

        labels: times,

        datasets: [{

            label: "Temperature",

            data: temps,

            borderColor: "#FFD54F",

            backgroundColor: "rgba(255, 213, 79, 0.20)",

            borderWidth: 4,

            fill: true,

            tension: 0.45,

            pointRadius: 5,

            pointHoverRadius: 8,

            pointHitRadius: 15,

            pointBackgroundColor: "#FFD54F",

            pointBorderColor: "#FFFFFF",

            pointBorderWidth: 2

        }]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

            duration: 1200,

            easing: "easeOutQuart"

        },

        interaction: {

            intersect: false,

            mode: "index"

        },

        plugins: {

            legend: {

                display: false

            },

            tooltip: {

                backgroundColor: "rgba(20,20,20,0.9)",

                titleColor: "#FFD54F",

                bodyColor: "#FFFFFF",

                borderColor: "#FFD54F",

                borderWidth: 1,

                padding: 12,

                displayColors: false,

                callbacks: {

                    label: function(context) {

                        return context.parsed.y + "°C";

                    }

                }

            }

        },

        scales: {

            x: {

                ticks: {

                    color: "#FFFFFF",

                    font: {

                        size: 13,

                        weight: "bold"

                    }

                },

                grid: {

                    color: "rgba(255,255,255,0.08)",

                    drawBorder: false

                },

                border: {

                    display: false

                }

            },

            y: {

                beginAtZero: false,

                ticks: {

                    color: "#FFFFFF",

                    font: {

                        size: 13,

                        weight: "bold"

                    },

                    callback: function(value) {

                        return value + "°";

                    }

                },

                grid: {

                    color: "rgba(255,255,255,0.08)",

                    drawBorder: false

                },

                border: {

                    display: false

                }

            }

        }

    }

});
}
async function getForecast (city, paras) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    let forecast = [];
    for (let i=0; i<data.list.length; i++) {
        if (data.list[i].dt_txt.includes("12:00:00")){
            forecast.push(data.list[i]);
        }
    }
    let labels = [
        "Today",
        "Tommorow",
        "In 2 days",
        "In 3 days",
        "In 4 days"
    ];
    let forecastCards = document.querySelectorAll('.forecastCard')
    for (let i =0; i < forecast.length; i++) {
        forecastCards[i].innerHTML = `
            <h1>${labels[i]}</h1>
            <img src="https://openweathermap.org/img/wn/${forecast[i].weather[0].icon}@2x.png">
            <p>${forecast[i].main.temp}°C</p>
        `;
    }
}
async function getWeather(cards, search) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${API_KEY}&units=metric`;
    try{
        let response = await fetch(url);
        let data = await response.json();
        getForecast(data.name);
        getGraph(data.name);
        let time = getTime();
        let day = getToday();
        let sunrise = unixToCityTime(data.sys.sunrise, data.timezone);
        let sunset = unixToCityTime(data.sys.sunset, data.timezone);
        console.log(data)
        if (data.cod === "404") {
            alert("Please Put a valid City Name!")
            return;
        }
        let values = [
            data.name,
            data.main.temp,
            data.main.feels_like,
            data.weather[0].main,
            data.main.humidity,
            data.wind.speed,
            data.main.pressure,
            day,
            time,
            sunrise,
            sunset
        ]
        for (let i = 0; i<cards.length; i++) {
            cards[i].textContent = values[i];
        }
        switch (data.weather[0].main) {
            case "Clear" :
                document.documentElement.style.background =
                    "linear-gradient(135deg, #4FACFE, #00F2FE, #38BDF8, #FDE68A)";
                document.getElementById('searchButton').style.background =
                    "linear-gradient(135deg, #4FACFE, #00F2FE, #38BDF8, #FDE68A)";
                break;
            case "Clouds" :
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #DCE3E8, #BCC8D3, #8C9DAF, #5C6B7A)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #DCE3E8, #BCC8D3, #8C9DAF, #5C6B7A)";
                break;
            case "Rain" :
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #1F3B4D, #365D73, #5D7B91, #8AA5B8)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #1F3B4D, #365D73, #5D7B91, #8AA5B8)";
                break;
            case "Drizzle" :
                document.documentElement.style.background =
                    "linear-gradient(135deg, #6C7A89, #8CA0B3, #AFC3D4, #D5E3EC)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #6C7A89, #8CA0B3, #AFC3D4, #D5E3EC)";
                break;
            case "Thunderstorm" :
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #1A1A2E, #16213E, #3A3A5A, #6D6D8C)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #1A1A2E, #16213E, #3A3A5A, #6D6D8C)";
                break;
            case "Snow" :
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #F8FBFF, #EAF4FA, #C7DCEB, #AABED1)";
                document.getElementById('searchButton').style.background =
                    "linear-gradient(135deg, #F8FBFF, #EAF4FA, #C7DCEB, #AABED1)";
                break;
            case "Mist" :
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #ECEFF1, #CFD8DC, #B0BEC5, #90A4AE)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #ECEFF1, #CFD8DC, #B0BEC5, #90A4AE)";
                break;
            case "Fog":
            case "Haze":
            case "Smoke":
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #F2F2F2, #D6D6D6, #B8B8B8, #909090)";
                document.getElementById('searchButton').style.background =
                    "linear-gradient(135deg, #F2F2F2, #D6D6D6, #B8B8B8, #909090)";
                break; 
            case "Dust":
            case "Sand":
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #E4CDA7, #C8A97E, #A87D55, #805D3A)";
                document.getElementById('searchButton').style.background =
                    "linear-gradient(135deg, #E4CDA7, #C8A97E, #A87D55, #805D3A)";
                break;
            case "Ash":
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #606060, #4B4B4B, #373737, #1F1F1F)";
                document.getElementById('searchButton').style.background =
                    "linear-gradient(135deg, #606060, #4B4B4B, #373737, #1F1F1F)";
                break;
            case "Squall":
                document.documentElement.style.background = 
                    "linear-gradient(135deg, #5A6C7D, #7890A8, #9FB7CB, #D6E4ED)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #5A6C7D, #7890A8, #9FB7CB, #D6E4ED)";
                break;
            case "Tornado":
                document.documentElement.style.background =
                    "linear-gradient(135deg, #2A2A2A, #4D4D4D, #6B6B6B, #A0A0A0)";
                document.getElementById('searchButton').style.background = 
                    "linear-gradient(135deg, #2A2A2A, #4D4D4D, #6B6B6B, #A0A0A0)";
                break;
        }
        let iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById('weatherIcon').src = iconUrl;
    } catch (error) {
        alert("Something went wrong:", error)
    }
}
searchButton.addEventListener('click', function() {
    let searchValue = searchInputBox.value; 
    if (document.getElementById('suggestion')) {
        document.getElementById('suggestions').innerHTML = "";
    }
       getWeather(cards, searchValue)
})
searchInputBox.addEventListener('input', function() {
    getSuggestions(searchInputBox.value);
})
searchInputBox.addEventListener('focus', function() {
    searchInputBox.select();
})
searchInputBox.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        searchButton.click();
    }
})