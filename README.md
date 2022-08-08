# deliveryPage
Страница оплаты и выбора типа доставки для интернет-магазина

Особенности проекта:

    * Кроссбраузерная вёрстка под ПК;
    * CSS: модульная структура, переменные, БЭМ, Flexbox;
    * Чистый Javascript ES6 без фреймворков и библиотек;
    * Карта и точки на API 2GIS. Выбранный адрес отображается на карте;
    * Адреса точек в городе приходят с сервера в JSON через Fetch-запрос;
    * Различные способы валидации: html, регулярные выражения, алгоритм Луна для номера карты;
    * Номер карты: при заполнении одного поля фокус перемещается в следующее;
    * Время доставки выбирается удобным и классным бегунком;
    * При переключении "доставка\самовывоз" в форме сохраняются данные для каждого режима;
    * Собранные данные упаковываются в JSON и уходят на сервер через Fetch (POST-запрос);
