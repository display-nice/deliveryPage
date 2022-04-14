// глобальные переменные

const phoneFields = document.querySelectorAll('#phone');

let cardNumberGlobal;
let cardFields;
let cardNumberDiv;


//---------------------------Выбор между самовывозом и доставкой-----------------------------
( function() {    
    let pickupButton = document.querySelector('.tab[data-tab="pickup"]');
    let deliveryButton = document.querySelector('.tab[data-tab="delivery"]');

    //трансфер номера телефона сделан не прямой, а через localStorage просто потому, что так захотелось.
    function transferPhoneValues() {
        phoneFields.forEach(field => {
            field.value = localStorage.getItem('phone');
        });
    }

    //прямой трансфер номера карты из доставки в самовывоз
    function transferCardNumberToDelivery() {
        document.querySelector('#deliver-crd-1').value = document.querySelector('#card-fields-1').value;
        document.querySelector('#deliver-crd-2').value = document.querySelector('#card-fields-2').value;
        document.querySelector('#deliver-crd-3').value = document.querySelector('#card-fields-3').value;
        document.querySelector('#deliver-crd-4').value = document.querySelector('#card-fields-4').value;
    }
    //прямой трансфер номера карты из самовывоза в доставку
    function transferCardNumberToPickup() {
        document.querySelector('#card-fields-1').value = document.querySelector('#deliver-crd-1').value;
        document.querySelector('#card-fields-2').value = document.querySelector('#deliver-crd-2').value;
        document.querySelector('#card-fields-3').value = document.querySelector('#deliver-crd-3').value;
        document.querySelector('#card-fields-4').value = document.querySelector('#deliver-crd-4').value;
    }    

    function showPickupFunctional() {
        cardFields = document.querySelectorAll('#pickup-input-card-number input');
        cardNumberDiv = document.querySelector('#pickup-input-card-number');
        deliveryButton.classList.remove('active');
        pickupButton.classList.add('active');
        document.querySelector('.tabs-block__pick-up').hidden = false;
        document.querySelector('.tabs-block__item-delivery').hidden = true;
        
        transferPhoneValues();
        transferCardNumberToPickup();
        activateCardFields();
        cardNumberGlobal = getCardNumber();
        validateCardNumber(cardNumberGlobal);
    }
    function showDeliveryFunctional() {
        cardFields = document.querySelectorAll('#delivery-input-card-number input');
        cardNumberDiv = document.querySelector('#delivery-input-card-number');
        pickupButton.classList.remove('active');
        deliveryButton.classList.add('active');
        document.querySelector('.tabs-block__item-delivery').hidden = false;
        document.querySelector('.tabs-block__pick-up').hidden = true;
        
        transferPhoneValues();
        transferCardNumberToDelivery();
        activateCardFields();
        // storedCardNumberGlobal = getStoredCardNumber();
        cardNumberGlobal = getCardNumber();
        validateCardNumber(cardNumberGlobal);
        // getStoredCardNumber();
    }
    showPickupFunctional(); // функционал самовывоза включён по-умолчанию
    pickupButton.onclick = showPickupFunctional; // вкл. функционал самовывоза
    deliveryButton.onclick = showDeliveryFunctional; // вкл. функционал доставки
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
// главный узел обработки номера карты, запускает всё
function activateCardFields() {
    cardFields.forEach(function(field, i) {
        field.addEventListener('input', (e) => {
            // localStorage.setItem(`card${i+1}`, field.value); // кладём в локхран значение каждого поля карты    
            if (e.target.value.length == 4) {
                goToNextField(e.target.id);    
            }
            let cardNumber = getCardNumber();            
            validateCardNumber(cardNumber);
        });
    });
    
    // функционал бэкспейса на полях с кусками номера карты
    cardFields.forEach(field => {    
        field.addEventListener('keydown', (e) => {
            if (e.code == 'Backspace') {            
                if (e.target.value.length == 0) {
                    goToPrevField(e.target.id);
                }
            }
        });
    });
}

// получает следующее поле и ставит на нём фокус
function goToNextField(currentField) {
    let k = +currentField.slice(12);
    let i = +currentField.slice(12) + 1;
    if (i < 5) {
        let nextFieldID = currentField.replace(k, i);    
        let nextField = document.querySelector(`#${nextFieldID}`);
        nextField.focus();
    }
}

// получает предыдущее поле и ставит на нём фокус
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

// собирает из четырёх полей карты один номер карты в виде строки
function getCardNumber() {
    let cardNumber = '';
    cardFields.forEach(field => {
        cardNumber += field.value; 
    });
    return cardNumber;
}

//проверка номера карты, внутри запускает функцию с алгоритмом Луна
function validateCardNumber(cardNumber) {
    if (cardNumber.length < 16) {
        cardNumberDiv.classList.add("input-wrapper--error");
    } else {
        if (!luhnAlgorythm(cardNumber)){
            // console.log(`Номер не валиден.`);
            
            cardNumberDiv.classList.remove("input-wrapper--success");
            cardNumberDiv.classList.add("input-wrapper--error");
        }
        if (luhnAlgorythm(cardNumber)) {
            // console.log(`Проверка пройдена`);
            
            cardNumberDiv.classList.remove("input-wrapper--error");
            cardNumberDiv.classList.add("input-wrapper--success");
            
        } 
    }
}

// алгоритм Луна, возвращает true\false
function luhnAlgorythm(value) {
    if (!value) {
        return false;
    }
    // accept only digits, dashes or spaces
        if (/[^0-9-\s]+/.test(value)) {
            return false;
        }
        
        // The Luhn Algorithm. It so pretty.
        var nCheck = 0, nDigit = 0, bEven = false;
        value = value.replace(/\D/g, "");
        
        for (var n = value.length - 1; n >= 0; n--) {
            var cDigit = value.charAt(n);        
            nDigit = parseInt(cDigit, 10);

            if (bEven) {
                if ((nDigit *= 2) > 9) {
                    nDigit -= 9;
            }
        }

        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) == 0;
}

// --------------------------------- Номера телефонов ------------------------------------------
const phoneForms = document.querySelectorAll('#phone-form');

phoneFields.forEach(field => {
    field.addEventListener('input', (e) => {
        if (field.value == "") {
            field.value = "+7";
        }
        
        localStorage.setItem('phone', e.target.value); // сохраняем инпут в лок. хранилище
        
        if (field.value.length >= 12) {
            if (validatePhone(e.target.value)) {
                phoneForms.forEach(form => {
                    form.classList.remove("input-wrapper--error");
                    form.classList.add("input-wrapper--success");
                });
            } else {
                phoneForms.forEach(form => {
                    form.classList.remove("input-wrapper--success");
                form.classList.add("input-wrapper--error");
            });
        }
    } else {
        phoneForms.forEach(form => {
                form.classList.remove("input-wrapper--success");
            });
        }
    });    
});

function validatePhone(value) {
    let result = value.match(/\+\d{11}\b/);
    if (result) {
        return true;
    } else {
        return false;
    }
}

// //---------------------------Самовывоз: Города и карта----------------------------------------------
// (function () {
//     let displayedMap = document.querySelector('#map2gis');
//     let inputs = document.querySelectorAll('input');
//     let pickupCityNames = document.querySelectorAll('.pickup-city-name');
//     let citiesObject;
//     let deliveryPoints;
//     let cityID;
//     let ledDeliveryPoints;

//     // Показывает сразу все точки самовывоза на карте
//     let showPickupPointsOnMap = function() {    
//         let array = []; // создаём пустой массив для координат
//         deliveryPoints.forEach(object => { // записываем в него координаты всех точек доставки
//             array.push(object['coordinates']); // получается массив с массивами
//         });
//         // console.log(array);
//         DG.then(function() { // DG.then - специальный объект АПИ 2ГИС, все методы для карты работают ТОЛЬКО в нём
//             let allCityMarkers = DG.featureGroup(); // объявляем переменную для группы маркеров
//             allCityMarkers.removeFrom(map); // удаляем с карты все ранее созданные маркеры
//             array.forEach(coordinates => { // разбираем массив с координатами
//                 DG.marker([coordinates[0], coordinates[1]]).addTo(allCityMarkers);
//             });
//             allCityMarkers.addTo(map); // добавляем все маркеры на карту
//             map.fitBounds(allCityMarkers.getBounds()); // умещаем все точки на карте сразу
//             map.zoomOut(1); // уменьшаем масштаб эквивалентно 1 нажатию кнопки "минус"
//         });
//     };

//     // Управляет передвижением карты по клику мыши на точку доставки
//     let moveToPoint = function() {
//         let pickupPointsButtons = document.querySelectorAll('#pickupAdresses input');
//         for (let i of pickupPointsButtons) { // навешиваем передвижение карты на каждую созданную кнопку с адресом
//             i.addEventListener('click', (event) => {                             
//                 let coordinates = deliveryPoints.find(item => item.address == event.target.value).coordinates;
//                 // console.log(coordinates);
//                 DG.then(function() {
//                     map.panTo([coordinates[0], coordinates[1]]); // передвигает карту к конкретному адресу
//                     map.setZoomAround([coordinates[0], coordinates[1]], 15); // устанавливает зум размера 15 на конкретный адрес
//                 });
//             }); 
//         }
//     };

//     // Создаёт кнопки с адресами по клику на город
//     let createPickupPoints = function (cityID) {
//         let pickupAdressesBlock = document.querySelector('#pickupAdresses');
//         pickupAdressesBlock.innerHTML = '<h4>Адрес пункта выдачи заказов</h4>';        
//         deliveryPoints = citiesObject.cities.find(item => item["city-id"] == cityID)["delivery-points"];        
//         // console.log(deliveryPoints);
//         for (let i = 0; i < deliveryPoints.length; ++i) {                   
//             pickupAdressesBlock.insertAdjacentHTML('beforeend', `
//             <input id="pick-up-led-address-${i+1}" type="radio" name="led-address" value="${deliveryPoints[i].address}"/>
//             <label for="pick-up-led-address-${i+1}" >${deliveryPoints[i].address}</label>
//             `);
//         }
//         showPickupPointsOnMap();
//         moveToPoint();  
//     };

//     // Отключаем все кнопки на время загрузки данных по городам
//     // Тут можно сделать что угодно: например, повесить сообщение для пользователя "Загрузка"
//     // Или покрасить кнопки в серый на время загрузки
//     inputs.forEach(input => {
//         input.disabled = true;
//     });

//     // Фетч-запрос получает данные по городам и записывает их в глобальный citiesObject
//     let getCitiesData = async (url) => {
//         let citiesData = await fetch(url);
//         if (!citiesData.ok) { // этот иф отлавливает ошибки статуса по HTTP (т.к. сам фетч не считает их за ошибки)
//             throw new Error(`Не могу принести ${url}, статус: ${citiesData.status}`);
//         }    
//         citiesObject = await citiesData.json();
//         ledDeliveryPoints = citiesObject.cities.find(item => item["city-id"] == "led")["delivery-points"];
//         // console.log(ledDeliveryPoints); 
//         // включаем все кнопки после загрузки данных по городам
//         inputs.forEach(input => {
//             input.disabled = false;
//         });
//         // console.log(citiesObject);
//         document.querySelector('#pick-up-led').click(); // имитируем клик по Питеру, чтобы он встал по-умолчанию
//     };
//     getCitiesData('https://fake-json-shop-heroku.herokuapp.com/db');

//     // получаем айдишник города по клику на город и передаём его дальше
//     pickupCityNames.forEach(city => {
//         city.addEventListener('click', (event) => {
//             cityID = event.target.value;
//             // console.log(cityID);
//             createPickupPoints(cityID);
//         });
//     });    
// }() ); // самовызывающаяся анонимная ф-я


