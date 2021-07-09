const apiKeyWeather = "5625cdfe827ac03309267096dd7f69e5";
const apiKeyRapid = "2c939cec1amshd319966eb7fd8cbp18aca7jsn44e7a7947bb8";

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getOpenWeather);
    } else { 
        alert("Geolocalização não suportada por este navegador.");
    }
}

function getOpenWeather(position) {
    fetch('https://api.openweathermap.org/data/2.5/weather?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&appid='+apiKeyWeather+'&lang=pt_br&units=metric')
    .then((response) => {

        return response.json()
    })
    .then((data) => {
        if(data.cod == 200) //sucesso
        {            
            // Exibe
            document.getElementById("Cidade").innerHTML = data.name;
            document.getElementById("Temperatura").innerHTML = arredondarDecimal(data.main.temp);            
            document.getElementById("spanDescricao").innerHTML = data.weather[0].description;
            document.getElementById("iconeTempo").src = "http://openweathermap.org/img/wn/"+data.weather[0].icon+"@2x.png";
            document.getElementById("spanSensacao").innerHTML = arredondarDecimal(data.main.feels_like);
            document.getElementById("spanVento").innerHTML = arredondarDecimal(data.wind.speed);
            document.getElementById("spanUmidade").innerHTML = data.main.humidity;

            // Data
            var diaEData = retornarData();
            document.getElementById("DiaSemana").innerHTML = diaEData.diaSemana.toUpperCase();
            document.getElementById("Data").innerHTML = diaEData.data;

            // Temperatura mínima e máxima
            getMinMax(position.coords.latitude, position.coords.longitude);
        }
        else
        {
        }
    })
    .catch((err) => {

        console.log(err);
        
        console.log('oi');
        document.getElementById('alertaCidadeNaoEncontrada').style.visibility = "visible";            
    })
}

function arredondarDecimal(valor){
    return Math.round(valor * 10) / 10;
}

function getMinMax(lat, lon){
    fetch('https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=current,minutely,hourly,alerts&appid='+apiKeyWeather+'&lang=pt_br&units=metric')
    .then((response) => {
        
        return response.json()
    })
    .then((data) => {

        if(typeof data.daily !== 'undefined') //sucesso
        {
            // Exibe
            document.getElementById("spanTempMax").innerHTML = arredondarDecimal(data.daily[0].temp.max);            
            document.getElementById("spanTempMin").innerHTML = arredondarDecimal(data.daily[0].temp.min);     
        }
        else
        {
        }
    })
    .catch((err) => {

        console.log(err);
    })
}

const buscaCidade = document.getElementById('txtBuscaCidade');

let timer = null;

const inputHandler = function(e) {

    // Debounce
    clearTimeout(timer);
    timer = setTimeout(function(){        

        document.getElementById('alertaCidadeNaoEncontrada').style.visibility = "hidden";  

        if (e.target.value && e.target.value.length >= 3) {
            // Retorna lista de cidades, limite de 10, com o prefixo digitado
            fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=10&minPopulation=10000&namePrefix="+e.target.value+"&languageCode=pt&types=CITY", {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": apiKeyRapid,
                    "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
                }
            })
            .then(response => {
                return response.json()
            })
            .then((data) => {
                        
                if(typeof data.data !== 'undefined')
                {    
                    removerSugestoes();          

                    data.data.forEach(element => {
                        
                        // Adiciona a cidade como sugestão
                        adicionarSugestao(element.city, element.country);
                    });
                    

                }
            })
            .catch(err => {
                console.error(err);
            });
        }
    }, 350);
}

buscaCidade.addEventListener('input', inputHandler);

function adicionarSugestao(cidade, paisCodigo) {

    const div = document.createElement('div');
  
    div.className = 'sugestaoCidade';
  
    div.innerHTML = `
      <button type="button" class="btn btn-default btn-block" style="text-align:left" onclick="selecionarSugestao('`+cidade+`', '`+paisCodigo+`')">`+cidade+`, `+paisCodigo+`</button>
    `;
  
    document.getElementById('divSugestoes').appendChild(div);
  }
  
function removerSugestoes() {

    var sugestoes = document.getElementsByClassName('sugestaoCidade');

    while(sugestoes[0]) {
        sugestoes[0].parentNode.removeChild(sugestoes[0]);
    }
}

function selecionarSugestao(cidade, paisCodigo) {
    
    document.getElementById("txtBuscaCidade").value = cidade+", "+paisCodigo;

    getLatitudeLongitude(cidade);

    removerSugestoes();
}

function getLatitudeLongitude(cidade) {

    fetch('https://api.openweathermap.org/data/2.5/weather?q='+cidade+'&appid='+apiKeyWeather+'&lang=pt_br&units=metric')
    .then((response) => {

        return response.json()
    })
    .then((data) => {
        if(data.cod == 200) //sucesso
        {
            //console.log(data);
            // Preenche array com as coordenas
            var position = new Object();
            position.coords = new Object();
            position.coords.longitude = data.coord.lon;
            position.coords.latitude = data.coord.lat;
    
            // Preenche o card
            getOpenWeather(position);
        }
        else
        {            
            document.getElementById('alertaCidadeNaoEncontrada').style.visibility = "visible";            
        }

    })
    .catch((err) => {

        console.log(err);
    })
}

function retornarData() {

    var diaEData = new Object();
    diaEData.diaSemana = new Date().toLocaleDateString('pt-br', { weekday: 'long' });
    diaEData.data      = new Date().toLocaleDateString('pt-br', { month: 'long', day: 'numeric' });

    return diaEData;
}

document.querySelector('form').onkeypress = checkEnter;

function checkEnter(e){
    e = e || event;
    var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
    return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
   }