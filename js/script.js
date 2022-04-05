
//---------------------------Выбор между самовывозом и доставкой-----------------------------
let deliveryType = document.querySelector('.tab');
let pickupButton = document.querySelector('.tab[data-tab="pickup"]');
let deliveryButton = document.querySelector('.tab[data-tab="delivery"]');

function showPickupFunctional() {
    deliveryButton.classList.remove('active');
    pickupButton.classList.add('active');
    document.querySelector('.tabs-block__pick-up').hidden = false;
    document.querySelector('.tabs-block__item-delivery').hidden = true;
}
function showDeliveryFunctional() {
    pickupButton.classList.remove('active');
    deliveryButton.classList.add('active');
    document.querySelector('.tabs-block__item-delivery').hidden = false;
    document.querySelector('.tabs-block__pick-up').hidden = true;
}
showPickupFunctional(); // функционал самовывоза включён по-умолчанию
pickupButton.onclick = showPickupFunctional; // вкл. функционал самовывоза
deliveryButton.onclick = showDeliveryFunctional; // вкл. функционал доставки

//---------------------------Города и карта----------------------------------------------
let displayedMap = document.querySelector('#map2gis');
let inputs = document.querySelectorAll('input');
let pickupCityNames = document.querySelectorAll('.pickup-city-name');
let citiesObject;
let deliveryPoints;
let cityID;
let ledDeliveryPoints;

// Показывает сразу все точки самовывоза на карте
let showPickupPointsOnMap = function() {    
    let array = []; // создаём пустой массив для координат
    deliveryPoints.forEach(object => { // записываем в него координаты всех точек доставки
        array.push(object['coordinates']); // получается массив с массивами
    });
    console.log(array);
    DG.then(function() { // DG.then - специальный объект АПИ 2ГИС, все методы для карты работают ТОЛЬКО в нём
        let allCityMarkers = DG.featureGroup(); // объявляем переменную для группы маркеров
        allCityMarkers.removeFrom(map); // удаляем с карты все ранее созданные маркеры
        array.forEach(coordinates => { // разбираем массив с координатами
            DG.marker([coordinates[0], coordinates[1]]).addTo(allCityMarkers);
        });
        allCityMarkers.addTo(map); // добавляем все маркеры на карту
        map.fitBounds(allCityMarkers.getBounds()); // умещаем все точки на карте сразу
        map.zoomOut(1); // уменьшаем масштаб эквивалентно 1 нажатию кнопки "минус"
    });
};

// Управляет передвижением карты по клику мыши на точку доставки
let moveToPoint = function() {
    let pickupPointsButtons = document.querySelectorAll('#pickupAdresses input');
    for (let i of pickupPointsButtons) { // навешиваем передвижение карты на каждую созданную кнопку с адресом
        i.addEventListener('click', (event) => {                             
            let coordinates = deliveryPoints.find(item => item.address == event.target.value).coordinates;
            // console.log(coordinates);
            DG.then(function() {
                map.panTo([coordinates[0], coordinates[1]]); // передвигает карту к конкретному адресу
                map.setZoomAround([coordinates[0], coordinates[1]], 15); // устанавливает зум размера 15 на конкретный адрес
            });
        }); 
    }
};

// Создаёт кнопки с адресами по клику на город
let createPickupPoints = function (cityID) {
    let pickupAdressesBlock = document.querySelector('#pickupAdresses');
    pickupAdressesBlock.innerHTML = '<h4>Адрес пункта выдачи заказов</h4>';        
    deliveryPoints = citiesObject.cities.find(item => item["city-id"] == cityID)["delivery-points"];        
    console.log(deliveryPoints);
    for (let i = 0; i < deliveryPoints.length; ++i) {                   
        pickupAdressesBlock.insertAdjacentHTML('beforeend', `
        <input id="pick-up-led-address-${i+1}" type="radio" name="led-address" value="${deliveryPoints[i].address}"/>
        <label for="pick-up-led-address-${i+1}" >${deliveryPoints[i].address}</label>
        `);
    }
    showPickupPointsOnMap();
    moveToPoint();  
};

// Отключаем все кнопки на время загрузки данных по городам
// Тут можно сделать что угодно: например, повесить сообщение для пользователя "Загрузка"
// Или покрасить кнопки в серый на время загрузки
inputs.forEach(input => {
    input.disabled = true;
});

// Фетч-запрос получает данные по городам и записывает их в глобальный citiesObject
let getCitiesData = async (url) => {
    let citiesData = await fetch(url);
    if (!citiesData.ok) { // этот иф отлавливает ошибки статуса по HTTP (т.к. сам фетч не считает их за ошибки)
        throw new Error(`Не могу принести ${url}, статус: ${citiesData.status}`);
    }    
    citiesObject = await citiesData.json();
    ledDeliveryPoints = citiesObject.cities.find(item => item["city-id"] == "led")["delivery-points"];
    console.log(ledDeliveryPoints); 
    // включаем все кнопки после загрузки данных по городам
    inputs.forEach(input => {
        input.disabled = false;
    });
    console.log(citiesObject);
    document.querySelector('#pick-up-led').click(); // имитируем клик по Питеру, чтобы он встал по-умолчанию
};
getCitiesData('https://fake-json-shop-heroku.herokuapp.com/db');

// получаем айдишник города по клику на город и передаём его дальше
pickupCityNames.forEach(city => {
    city.addEventListener('click', (event) => {
        cityID = event.target.value;
        console.log(cityID);
        createPickupPoints(cityID);
    });
});
// fetch('https://fake-json-shop-heroku.herokuapp.com/db')
// .then(response => {
//     citiesObject = response.json();
//     console.log(citiesObject);
//     inputs.forEach(input => {
//         input.disabled = false;
//     });
// });