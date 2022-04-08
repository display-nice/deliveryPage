//---------------------------Выбор между самовывозом и доставкой-----------------------------
( function(){
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
}() ); // самовызывающаяся анонимная ф-я

//---------------------------Самовывоз: Города и карта----------------------------------------------
(function () {
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
        // console.log(array);
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
        // console.log(deliveryPoints);
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
        // console.log(ledDeliveryPoints); 
        // включаем все кнопки после загрузки данных по городам
        inputs.forEach(input => {
            input.disabled = false;
        });
        // console.log(citiesObject);
        document.querySelector('#pick-up-led').click(); // имитируем клик по Питеру, чтобы он встал по-умолчанию
    };
    getCitiesData('https://fake-json-shop-heroku.herokuapp.com/db');

    // получаем айдишник города по клику на город и передаём его дальше
    pickupCityNames.forEach(city => {
        city.addEventListener('click', (event) => {
            cityID = event.target.value;
            // console.log(cityID);
            createPickupPoints(cityID);
        });
    });    
}() ); // самовызывающаяся анонимная ф-я

//---------------------------Переключение типа оплаты----------------------------------------------
( function() {
    const pickupCardButton = document.querySelector('#pickup-payment-card'),
        pickupCashButton = document.querySelector('#pickup-payment-cash'),
        pickupCardNumberDiv = document.querySelector('#pickup-input-card-number'),

        deliveryCardButton = document.querySelector('#delivery-payment-card'),
        deliveryCashButton = document.querySelector('#delivery-payment-cash'),
        deliveryCardNumberDiv = document.querySelector('#delivery-input-card-number');        
    
    let payPickupWithCash = function() {        
        pickupCardNumberDiv.style.cssText = "display: none";
    };
    let payPickupWithCard = function() {
        pickupCardNumberDiv.style.cssText = "display: flex";
    };
    let payDeliveryWithCash = function() {        
        deliveryCardNumberDiv.style.cssText = "display: none";
    };
    let payDeliveryWithCard = function() {
        deliveryCardNumberDiv.style.cssText = "display: flex";
    };

    pickupCardButton.onclick = payPickupWithCard;
    pickupCashButton.onclick = payPickupWithCash;
    deliveryCardButton.onclick = payDeliveryWithCard;
    deliveryCashButton.onclick = payDeliveryWithCash;
    // pickupCardButtons.forEach(button => {
    //     button.onclick = payPickupWithCard;
    // });

    // pickupCashButtons.forEach(button => {
    //     button.onclick = payPickupWithCash;
    // });

    // cashButton.onclick = payWithCash;
    // cardButton.onclick = payWithCard;
}() );

//---------------------------Номер банковской карты ----------------------------------------------
let cardField1 = document.querySelector('#card-fields-1');
let cardField2 = document.querySelector('#card-fields-2');
let cardField3 = document.querySelector('#card-fields-3');
let cardField4 = document.querySelector('#card-fields-4');
let cardFields = document.querySelectorAll('#pickup-input-card-number input');
let cardNumberDiv = document.querySelector('#pickup-input-card-number');


function goToNextField(currentField) {
    let k = +currentField.slice(12);
    let i = +currentField.slice(12) + 1;
    if (i < 5) {
        let nextFieldID = currentField.replace(k, i);    
        let nextField = document.querySelector(`#${nextFieldID}`);
        nextField.focus();
    }
}
function goToPrevField(currentField) {
    let k = +currentField.slice(12);
    let i = +currentField.slice(12) - 1;
    if (i > 0) {
        let prevBlockID = currentField.replace(k, i);    
        let prevBlock = document.querySelector(`#${prevBlockID}`);
        prevBlock.focus();
        prevBlock.selectionStart = prevBlock.value.length;
    }
}

cardFields.forEach(field => {
    field.addEventListener('input', (e) => {
        if (e.target.value.length == 4) {
            goToNextField(e.target.id);    
        }
    });
    
    field.addEventListener('keydown', (e) => {
        if (e.code == 'Backspace') {
            if (e.target.value.length == 0) {
                goToPrevField(e.target.id);
            }
        }
    });
    field.addEventListener('input', (e) => {
        if (cardField1.value.length == 4 && cardField2.value.length == 4 && cardField3.value.length == 4 && cardField4.value.length == 4) {
            let cardNumber = '';
            cardFields.forEach(field => {
                cardNumber += field.value; 
            });
            if (!validateCreditCard(cardNumber)){
                cardNumberDiv.classList.add("input-wrapper--error");
            }
            if (validateCreditCard(cardNumber)) {
                cardNumberDiv.classList.add("input-wrapper--success");
            }
        } else {
            if (cardNumberDiv.classList.contains("input-wrapper--error")) {
                cardNumberDiv.classList.remove("input-wrapper--error");
            }
            if (cardNumberDiv.classList.contains("input-wrapper--success")) {
                cardNumberDiv.classList.remove("input-wrapper--success");
            }
        }
    });
});
// let cardNumber = '';
// let someNumber = 5536;
// console.log(typeof(cardNumber+someNumber));

let imei1 = '5536913754881494';
let imei2 = '1111111111111111';
// let imei3 = [5, 5, 3, 6, 9, 1, 3, 7, 5, 4, 8, 8, 1, 4, 9, 4];
// let imei4 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

// takes the form field value and returns true on valid number
function validateCreditCard(value) {
    if (!value) {
        return false;
    }
    // accept only digits, dashes or spaces
        if (/[^0-9-\s]+/.test(value)) return false;
    
    // The Luhn Algorithm. It so pretty.
    var nCheck = 0, nDigit = 0, bEven = false;
    value = value.replace(/\D/g, "");

    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
            nDigit = parseInt(cDigit, 10);

        if (bEven) {
            if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) == 0;
}


// console.log(`Вывод первой формулы: ${luhnValidate(imei4)}`);
// console.log(`Вывод второй формулы: ${validateCreditCard(imei1)}`);

