// глобальные переменные

const phoneForms = document.querySelectorAll('#pickup-phone-field, #delivery-phone-field');
const phoneFields = document.querySelectorAll('#phone');

const delPhoneForm = document.querySelector('#delivery-phone-field'),
      delPhoneField = document.querySelector('#delivery-phone-field #phone'),
      pickPhoneForm = document.querySelector('#pickup-phone-field'),
      pickPhoneField = document.querySelector('#pickup-phone-field #phone');


const delForm = document.querySelector('#deliveryForm'),
        delFields = document.querySelectorAll('#delivery-address-field, #delivery-date-field, #delivery-input-card-number, #delivery-phone-field'),
        delOrderBtn = document.querySelector('#deliveryForm .form__submit-btn'),
        delOrderHint = document.querySelector('#del-hint'),
        pickForm = document.querySelector('#pickupForm'),
        pickFields = document.querySelectorAll('#pickup-input-card-number, #pickup-phone-field'),
        pickOrderBtn = document.querySelector('#pickupForm .form__submit-btn'),
        pickOrderHint = document.querySelector('#pick-hint');
let unfilled = [];

const pickupButton = document.querySelector('.tab[data-tab="pickup"]'),
      deliveryButton = document.querySelector('.tab[data-tab="delivery"]');

let deliveryAdressField = document.querySelector('#delivery-address');

let cardFields;
let cardNumberDiv;

let now = new Date(),
    nowYear = now.getFullYear(),
    dateField = document.querySelector('[type="date"]');

//---------------------------Выбор между самовывозом и доставкой-----------------------------
( function() {    

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
    
    function transferRadioButtons() {
        if (!pickupButton.classList.contains("active")) {
            let chosenCity = document.querySelector('#pickup-cities input[name="city"]:checked').value;
            // console.log(`В самовывозе был выбран город ${chosenCity}`);
            document.querySelector(`#delivery-cities input[value='${chosenCity}']`).checked = true;
        }
        if (!deliveryButton.classList.contains("active")) {
            let chosenCity = document.querySelector('#delivery-cities input[name="city"]:checked').value;
            // console.log(`В доставке был выбран город ${chosenCity}`);
            document.querySelector(`#pickup-cities input[value='${chosenCity}']`).checked = true;
        }
        if (!pickupButton.classList.contains("active")) {
            let paymentMethod = document.querySelector('input[name="pickup-payment-method"]:checked').value;            
            // console.log(`В самовывозе был выбран метод оплаты ${paymentMethod}`);
            document.querySelector(`#deliveryForm input[value='${paymentMethod}']`).checked = true;
        }
        if (!deliveryButton.classList.contains("active")) {
            let paymentMethod = document.querySelector('input[name="delivery-payment-method"]:checked').value;
            // console.log(`В доставке был выбран метод оплаты ${paymentMethod}`);
            document.querySelector(`#pickupForm input[value='${paymentMethod}']`).checked = true;
        }
    }

    function showPickupFunctional() {
        cardFields = document.querySelectorAll('#pickup-input-card-number input');
        cardNumberDiv = document.querySelector('#pickup-input-card-number');
        deliveryButton.classList.remove('active');
        pickupButton.classList.add('active');
        document.querySelector('.tabs-block__pick-up').hidden = false;



        document.querySelector('.tabs-block__item-delivery').hidden = true;


        
        transferRadioButtons();

        transferPhoneValues();
        validatePhone(pickPhoneForm, pickPhoneField);

        transferCardNumberToPickup();
        activateCardFields();
        
        validateCardNumber(getCardNumber());

        lookForUnfilled(pickFields, pickOrderBtn, pickOrderHint);
    }
    function showDeliveryFunctional() {
        cardFields = document.querySelectorAll('#delivery-input-card-number input');
        cardNumberDiv = document.querySelector('#delivery-input-card-number');
        pickupButton.classList.remove('active');
        deliveryButton.classList.add('active');
        document.querySelector('.tabs-block__item-delivery').hidden = false;
        document.querySelector('.tabs-block__pick-up').hidden = true;
        
        transferRadioButtons();
        
        transferPhoneValues();
        validatePhone(delPhoneForm, delPhoneField);
        
        transferCardNumberToDelivery();
        activateCardFields();
        
        validateDeliveryAdress(deliveryAdressField.value);
        
        validateCardNumber(getCardNumber());

        validateDate();
        lookForUnfilled(delFields, delOrderBtn, delOrderHint);
    }
    // showDeliveryFunctional();
    showPickupFunctional(); // функционал самовывоза включён по-умолчанию
    pickupButton.onclick = showPickupFunctional; // вкл. функционал самовывоза
    // pickupButton.onclick = transferRadioButtons;
    deliveryButton.onclick = showDeliveryFunctional; // вкл. функционал доставки
}() ); // самовызывающаяся анонимная ф-я

//---------------------------Самовывоз: Города и карта----------------------------------------------
// ( function() {
    let inputs = document.querySelectorAll('input');
    let pickupCityNames = document.querySelectorAll('#pickup-cities input');    
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
// }() ); // самовызывающаяся анонимная ф-я

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
// очищает номер карты, используется после нажатия кнопки "заказать"
function clearCardNumber(field) {
    let cardFields = field.querySelectorAll('input');
    cardFields.forEach(cardField => {
        cardField.value = '';
    });
}

//проверка номера карты, внутри запускает функцию с алгоритмом Луна
function validateCardNumber(cardNumber) {
    if (cardNumber.length < 16) {
        cardNumberDiv.classList.add("input-wrapper--error");
        cardNumberDiv.classList.remove("input-wrapper--success");
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
// const phoneForms = document.querySelectorAll('#pickup-phone-field, #delivery-phone-field');
// const phoneFields = document.querySelectorAll('#phone');

// const delPhoneForm = document.querySelector('#delivery-phone-field'),
//       delPhoneField = document.querySelector('#delivery-phone-field #phone'),
//       pickPhoneForm = document.querySelector('#pickup-phone-field'),
//       pickPhoneField = document.querySelector('#pickup-phone-field #phone');
phoneFields.forEach(field => {
    let form = field.parentElement;
    field.addEventListener('input', () => {
        validatePhone(form, field);
        phonePlus7(field);
    });
    field.addEventListener('focus', () => {
        validatePhone(form, field);
        phonePlus7(field);
    });
});

function validatePhone(phoneForm, phoneField) {
    let result = phoneField.value.match(/\+\d{11}\b/);   
    
    if (result) {        
        phoneForm.classList.remove("input-wrapper--error");
        phoneForm.classList.add("input-wrapper--success");        
    } else {
        phoneForm.classList.remove("input-wrapper--success");
        phoneForm.classList.add("input-wrapper--error");        
    }
}

function phonePlus7(field) {
    console.log(field.value);
    if (field.value.length <= 2) {
        field.value = "+7";
    }
    localStorage.setItem('phone', field.value); // сохраняем инпут в лок. хранилище
}

// ------------------------- Доставка: дата доставки -------------------------------------
dateField.oninput = validateDate;

function validateDate() {
    let dateValue = dateField.value;
    if (dateCheck(dateValue)) {
        dateField.parentElement.classList.remove("input-wrapper--error");
        dateField.parentElement.classList.add("input-wrapper--success");
    } else {
        dateField.parentElement.classList.remove("input-wrapper--success");
        dateField.parentElement.classList.add("input-wrapper--error");
    }
}

// проверка на корректность формата даты
function dateCheck(dateValue) {
    if (dateValue.match(/^\d{4}[./-]\d{2}[./-]\d{2}$/)) {
        let day = +dateValue.slice(8);
        let month = +dateValue.slice(5, 7);
        let year = +dateValue.slice(0, 4);
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && (year === nowYear || year === nowYear + 1)) {
            return dateBusinessConditionsCheck(dateValue);
        } 
        else {
            return false;
        }
    }
}

// дополнительная проверка на бизнес-условия
function dateBusinessConditionsCheck(dateValue) {    
    let x = new Date(dateValue);
    x.setHours(0, 0, 0, 0);

    let nowPlusOneDay = new Date();
    nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1);
    nowPlusOneDay.setHours(0, 0, 0, 0);

    let nowPlusSevenDays = new Date();
    nowPlusSevenDays.setDate(nowPlusSevenDays.getDate() + 7);
    nowPlusSevenDays.setHours(0, 0, 0, 0);

    if (x >= nowPlusOneDay && x <= nowPlusSevenDays) {
        return true;
    } else {
        return false;
    }
}

//--------------------------------Доставка: ввод адреса доставки---------------------
// установка статусов на поле
function validateDeliveryAdress(deliveryAdress) {
    if (deliveryAdress.length > 0) {
        deliveryAdressField.parentElement.classList.remove("input-wrapper--error");
        deliveryAdressField.parentElement.classList.add("input-wrapper--success");
    } else {
        deliveryAdressField.parentElement.classList.remove("input-wrapper--success");
        deliveryAdressField.parentElement.classList.add("input-wrapper--error");
    }
}
// обработчик событий на ввод
deliveryAdressField.addEventListener('input', (e) => {
    // let deliveryAdress = deliveryAdressField.value;
    validateDeliveryAdress(deliveryAdressField.value);
});

//--------------------------------Доставка: ползунок времени доставки---------------------
let thumb = document.querySelector('.js_range-slider-thumb');
let area = document.querySelector('.js_range-slider-thumb-area');
const thumbTooltip = document.querySelector('.range-slider-tooltip');
// всего шагов будет 21, так как шаг по бизнес-условиям у нас равен 20 минутам,
// в часе три шага, в диапазоне времени доставки семь часов. 3*7=21.
let step = 0;
let minutes;
// массивы с номерами шагов, соотв. 20 и 40 минутам.
const arr20mins = [1, 4, 7, 10, 13, 16, 19];
const arr40mins = [2, 5, 8, 11, 14, 17, 20];
// итоговая интересующая нас переменная со временем доставки, уходит на сервер.
let delTime = '10:00 - 12:00';

thumb.onmousedown = function (e) {
    thumb.ondragstart = function() {
        return false;
    };
    let leftEdge = document.querySelector('.js_range-slider-thumb-area').getBoundingClientRect().left;
    let thumbLeft = thumb.getBoundingClientRect().left;
    // Переопределение StepPx сделал потому, что пользователь может изменить
    // масштаб страницы и тогда изменятся все пиксельные размеры, что грозит
    // поломкой функционала.
    let stepPx = Math.round(area.offsetWidth / 21);
    let shiftX = e.pageX - thumbLeft;

    document.onmousemove = function(e) {
        // console.log(thumbLeft);
        // формула считает новое левое положение бегунка
        let newLeft = e.pageX - leftEdge - shiftX;
        // console.log(`newLeft = ${newLeft}`);
        // если новое положение бегунка преодолело барьер шага,
        // значит номер шага надо изменить на новый 
        if ( Math.floor(newLeft / stepPx) !== step ) {
            // определяем номер шага от 1 до 21
            step = Math.floor(newLeft / stepPx);
            // устанавливаем границы для бегунка
            if (step > 21) {step = 21;}
            if (step < 0) {step = 0;}
            moveThumb(stepPx);
        }
        // при поднятии кнопки мыши убираем обработчики
        document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };    
};

document.addEventListener('keydown', (e) => {
    let stepPx = Math.round(area.offsetWidth / 21);
    if (e.shiftKey && e.code == 'ArrowRight') {
        step += 1;
        moveThumb(stepPx);
    }
    if (e.shiftKey && e.code == 'ArrowLeft') {
        step -= 1;
        moveThumb(stepPx);
    }
});

function moveThumb(stepPx) {
    if (step > 21) {step = 21;}
    else if (step < 0) {step = 0;}
    // определяем минуты исходя из номера шага
    if (step % 3 === 0) {minutes = '00';}
    else if (arr20mins.includes(step)) {minutes = '20';}
    else if (arr40mins.includes(step)) {minutes = '40';}
    // определяем часы
    let hours = Math.floor(step * 20 / 60);
    // склеиваем итоговое время доставки
    delTime = (10 + hours) + ':' + minutes + ' - ' + (12 + hours) + ':' + minutes;
    // вносим изменения в подсказку над бегунком
    thumbTooltip.textContent = `${delTime}`;
    // двигаем бегунок на цену одного шага в пикселях
    thumb.style.left = step * stepPx + 'px';
}

//----------------------------Вкл кнопку "заказать" и проверка заполненности полей ---------------------

window.onload = function () {
    lookForUnfilled(delFields, delOrderBtn, delOrderHint);
    lookForUnfilled(pickFields, pickOrderBtn, pickOrderHint);
};

delForm.oninput = function () {
    lookForUnfilled(delFields, delOrderBtn, delOrderHint);
};

pickForm.oninput = function() {
    lookForUnfilled(pickFields, pickOrderBtn, pickOrderHint);
};

function lookForUnfilled(inputFields, orderBtn, orderHint) {
    // status = true если все поля зелёные. false, если поля красные\серые.
    let status;
    for (let field of inputFields) {
        let fieldName = field.children[0].textContent;
        // console.log('Начало цикла. Проверка ', fieldName);
        if (field.style.display === 'none') {
            // console.log('Поле скрыто. Запускаю проверку следующего поля.');
            continue;
        }        
        // ищем незаполненные поля, либо содержащие ошибку
        if (!field.classList.contains('input-wrapper--success')) {
            // console.log("Поле не зелёное. Устанавливаю status = false");
            status = false;
            orderBtn.disabled = true;
            // незаполненные поля добавляем в массив (если их ещё там нет)
            if (!unfilled.includes(fieldName)) {unfilled.push(fieldName);}
        }
        // если же поле позеленело, то ...
        else if (field.classList.contains('input-wrapper--success')) {
            // console.log("Поле зелёное! Проверяю unfilled...");
            // ...удаляем из массива незаполненных имя того поля
            if (unfilled.includes(fieldName)) {unfilled.splice(unfilled.indexOf(fieldName), 1);}
            // ...и проверяем, осталось ли в массиве хоть что-то. если массив пустой, status = true.
            // console.log(`Длина unfilled сейчас ${unfilled.length}`);
            if (unfilled.length === 0) {status = true;}
            // console.log(`unfilled = ${unfilled}, status = ${status}`);
            // console.log(`Найдено зелёное поле. fieldName = ${fieldName}`);
        }
    }
    if (pickupButton.classList.contains("active")) {
        // let addresses = document.querySelectorAll('#pickupAdresses input');
        let checked = document.querySelector('#pickupAdresses input:checked');
        let fieldName = 'Адрес пункта выдачи заказов';
        if (!checked) {
            status = false;
            // незаполненные поля добавляем в массив (если их ещё там нет)
            if (!unfilled.includes(fieldName)) {unfilled.push(fieldName);}
        }
        if (checked) {
            if (unfilled.includes(fieldName)) {unfilled.splice(unfilled.indexOf(fieldName), 1);}
            if (unfilled.length === 0) {status = true;}
        }     
    }
    // в зависимости от статуса вкл\откл кнопка "ЗАКАЗАТЬ"
    if (status === true) {orderBtn.disabled = false;}
    if (status === false) {orderBtn.disabled = true;}
    // console.log('Весь цикл завершён. status теперь', status);
    // console.log('-------------------------------------------------------------');

    // ОБРАБОТКА МАССИВА НЕЗАПОЛНЕННЫХ ПОЛЕЙ
    // оборачиваем каждый элемент массива в спан
    for (let i = 0; i < unfilled.length; ++i) {
        unfilled[i] = `<span>${unfilled[i]}</span>`;
    }

    let message;        
    if (unfilled.length > 1) {
        // склеиваем массив в одну строку, добавляем запятые-разделители, понижаем регистр букв
        message = unfilled.reduce((msg, piece) => `${msg.toLowerCase()}, ${piece.toLowerCase()}`);
        let x = message.lastIndexOf(',');
        // заменяем последнюю запятую на " и"
        message = message.substring(0, x) + ' и' + message.substring(x + 1);
        orderHint.previousElementSibling.hidden = false;
    } 
    else if (unfilled.length === 1) {
        message = unfilled[0].toLowerCase();
        orderHint.previousElementSibling.hidden = false;
    }
    else if (unfilled.length === 0) {
        message = "";
        orderHint.previousElementSibling.hidden = true;
    }
    // добавляем готовое сообщение на страницу
    orderHint.innerHTML = message;
    // очищаем массив незаполненных
    unfilled = [];
}

// Предыдущий вариант без чекпоинтов, с попиксельным сдвигом, вставлять внутрь маусмува
// if (newLeft < 0) newLeft = 0;
// rightEdge это ширина доступной ползунку зоны движения
// if (newLeft > rightEdge) newLeft = rightEdge;        
// thumb.style.left = newLeft + 'px';

// function handleMouseClick(event) {
//     console.log('Вы нажали на элемент:', event.target);
// }  
//   // Добавляем обработчик события
//   window.addEventListener('click', handleMouseClick);
  
  // Убираем обработчик события
//   window.removeEventListener('click', handleMouseClick);

// рабочие варианты как двигать ползунок:
// thumb.style.transform = `translateX(${left + "px"})`;
// thumb.style.left = left + 23 + 'px';

//---------------------------Отправка заказа на сервер----------------------------------------------
// const phoneForms = document.querySelectorAll('#pickup-phone-field, #delivery-phone-field');
// const phoneFields = document.querySelectorAll('#phone');

// const delPhoneForm = document.querySelector('#delivery-phone-field'),
//       delPhoneField = document.querySelector('#delivery-phone-field #phone'),
//       pickPhoneForm = document.querySelector('#pickup-phone-field'),
//       pickPhoneField = document.querySelector('#pickup-phone-field #phone');


// const delForm = document.querySelector('#deliveryForm'),
//         delFields = document.querySelectorAll('#delivery-address-field, #delivery-date-field, #delivery-input-card-number, #delivery-phone-field'),
//         delOrderBtn = document.querySelector('#deliveryForm .form__submit-btn'),
//         delOrderHint = document.querySelector('#del-hint'),
//         pickForm = document.querySelector('#pickupForm'),
//         pickFields = document.querySelectorAll('#pickup-input-card-number, #pickup-phone-field'),
//         pickOrderBtn = document.querySelector('#pickupForm .form__submit-btn'),
//         pickOrderHint = document.querySelector('#pick-hint');

// pickupCardNumberDiv = document.querySelector('#pickup-input-card-number'),    
// deliveryCardNumberDiv = document.querySelector('#delivery-input-card-number');        

const pickupAllFieldsWithData = 
      document.querySelectorAll
      ('#pickup-cities, #pickupAdresses, #pickup-payment, #pickup-input-card-number, #pickup-phone-field'),
      deliveryAllFieldsWithData = 
      document.querySelectorAll
      ('#delivery-cities, #delivery-address-field, #delivery-date-field, #delivery-time, #delivery-payment, #delivery-input-card-number, #delivery-phone-field');


pickOrderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // getAndResetData(pickupAllFieldsWithData, pickOrderHint);
    sendData(pickupAllFieldsWithData, pickOrderBtn, pickOrderHint);
});

delOrderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // getAndResetData(deliveryAllFieldsWithData, delOrderHint);
    sendData(deliveryAllFieldsWithData, delOrderBtn, delOrderHint);
});

async function sendData(inputFields, orderBtn, hintArea) {
    orderBtn.disabled = true;
    orderBtn.textContent = 'Отправка заказа...';
    await fetch ('https://fake-json-shop-heroku.herokuapp.com/requests', {
        method: 'POST',
        body: JSON.stringify(getAndResetData(inputFields, hintArea)),
        headers: {
            'Content-type': 'application/json'
        }        
    })
    .then(response => response.json())
    .then(json => console.log('ответ от сервера: ', json));
    orderBtn.textContent = 'Заказать';
    orderBtn.disabled = false;
}

function getAndResetData(inputFields, hintArea) {
    let data = {};
    for (let field of inputFields) {
        if (field.style.display === 'none') {
            // console.log('Поле скрыто. Запускаю проверку следующего поля.');
            continue;
        }
        
        let fieldName = field.children[0].textContent;
        // console.log('Начало цикла. Проверка ', fieldName);
        switch(fieldName) {
            case 'Город': 
                data[fieldName] = field.querySelector('input[name="city"]:checked').value;
                // field.querySelector('input[name="city"]:checked').checked = false;
                field.querySelector('input:first-of-type').checked = true;
                break;
            case 'Адрес пункта выдачи заказов': 
                data[fieldName] = field.querySelector('input[name="led-address"]:checked').value;
                field.querySelector('input[name="led-address"]:checked').checked = false;
                createPickupPoints('led');
                break;
            case 'Номер карты': 
                data[fieldName] = getCardNumber();
                clearCardNumber(field);
                break;
            case 'Время доставки':
                data[fieldName] = delTime;
                moveThumb(0);
                delTime = '10:00 - 12:00';
                thumbTooltip.textContent = '10:00 - 12:00';
                break;
            case 'Способ оплаты':
                data[fieldName] = field.querySelector('div input:checked').value;
                // сброс значения
                field.querySelector('input:first-of-type').checked = true;
                if (pickupButton.classList.contains("active")) {
                    let x = document.querySelector('#pickup-input-card-number');
                    x.style.cssText = "display: flex";
                    // x.classList.remove("input-wrapper--success");
                    // x.classList.remove("input-wrapper--error");
                } else {
                    document.querySelector('#delivery-input-card-number').style.cssText = "display: flex";
                }
                break;
            case 'Адрес':
            case 'Дата доставки':
            case 'Номер телефона':
                data[fieldName] = field.querySelector('input').value;
                field.querySelector('input').value = '';
                break;
        }
    }

    for (let field of inputFields) {
        field.classList.remove("input-wrapper--success");
        field.classList.remove("input-wrapper--error");
    }
    localStorage.removeItem('phone');
    hintArea.textContent = "Заказ отправлен! Ожидайте звонка оператора.";

    console.log(data);
    return data;
}






