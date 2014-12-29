var task = {
    checked: null,
    date: null,
    message: null,
    identifier: null,
    finished: null
},
    uniqueID = 0;

function Task(checked, date, message, id, finished) {
    this.checked = checked;
    this.date = date;
    this.message = message;
    this.identifier = id;
    this.finished = finished;
}
Task.prototype = task;


function changePathname(link) {
    var url = window.location.pathname,
        pathnameBeforeFile = url.substring(0, url.lastIndexOf( '/' )+1);

    if ( link != undefined ) {
        history.pushState(link, null, pathnameBeforeFile + link);
    } else {
        history.pushState(null, null, url.substring(0, url.lastIndexOf( '/' )+1));
    }
}

function changeBodyClass(newClass) {
    if ( $( 'body' ).hasClass( newClass ) ) {
        return false;
    }

    $( 'body' ).removeClass().addClass( newClass );
}

window.onload = function() {

    window.setTimeout(function() {
        window.addEventListener( 'popstate', function(e) {
            if ( e.state == 'toDo' || e.state == 'done' ) {
                changeBodyClass(e.state);
            } else {
                $( 'body' ).removeClass();
            }
        }, false);
    }, 1);

    $( '#allTasks' ).bind( 'click', function(e) {
        $( 'body' ).removeClass();

        changePathname();

        return false;
    });

    $( '#done' ).bind( 'click', function() {
        changeBodyClass( 'done' );

        changePathname( 'done' );

        return false;
    });

    $( '#toDo' ).bind( 'click', function() {
        changeBodyClass( 'toDo' );

        changePathname( 'toDo' );

        return false;
    });

    var taskArray = [],
        idsArray = [];

    for ( var i = 0; i < localStorage.length; i++ ) {
        var key = Number(localStorage.key(i));

        if ( key % 1 === 0 ) {
            idsArray.push(key);
            taskArray.push(JSON.parse(localStorage[key]));
        }
    }

    if ( isFinite(String(Math.max.apply(0, idsArray)))) {
        uniqueID = Math.max.apply(0, idsArray);
    }

    $( '#template' ).tmpl(taskArray).appendTo( '#taskList' );

    document.getElementById( 'what' ).focus();

    document.getElementById( 'createTask' ).onclick = processForms;

    $(function($){
        $.datepicker.regional['ru'] = {
            closeText: 'Закрыть',
            prevText: '&#x3c;Пред',
            nextText: 'След&#x3e;',
            currentText: 'Сегодня',
            monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн',
                'Июл','Авг','Сен','Окт','Ноя','Дек'],
            dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
            dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
            dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
            weekHeader: 'Не',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''};
        $.datepicker.setDefaults($.datepicker.regional['ru']);
    });

    $( '.todoApplication' ).on( 'focus', '.input', function() {
        $( '.input' ).datepicker({
            minDate: '-0y'
        });
    });

    $( '#taskList' ).on( 'focus', '.input', function() {
        $( '.input' ).datepicker({
            minDate: '-0y'
        });
    });

    $( '#taskList' ).on( 'change', 'input[type=checkbox]', function() {
        var listItem = $( this ).parents().eq(4),
            index = $( listItem ).attr( 'id' ),
            taskObject = JSON.parse(localStorage[index]);

        if ( $( listItem ).hasClass( 'finished' ) ) {
            $( listItem ).removeClass( 'finished' );
            $( this ).attr( 'checked', false);
            taskObject.finished = '';
            taskObject.checked = '';
        } else {
            $( listItem ).toggleClass( 'finished' );
            $( this ).attr( 'checked', true);
            taskObject.finished = 'finished';
            taskObject.checked = 'checked';
        }

        localStorage[index] = JSON.stringify(taskObject);
    });


    $( '#taskList' ).on( 'click', '.text td:nth-child(4)', function() {
        var listItem = $( this ).parents().eq(3);

        var task = ($( listItem ).find( '.text tr td:nth-child(3)' ).text().trim()),
            date = ($( listItem ).find( '.text tr td:nth-child(2)' ).text().trim());

        $( listItem ).find( 'table:first-child' ).attr( 'show', 'no' );
        $( listItem ).find( 'table:last-child' ).attr( 'show', 'yes' );

        $( listItem ).find( '.edit tr td:first-child input' ).val(date);
        $( listItem ).find( '.edit tr td:nth-child(2) input' ).val(task);

        return false;
    });

    $( '#taskList' ).on( 'click', '#editDone', function() {
        var listItem = $( this ).parents().eq(4),
            isChecked = (function() {
                if ( $( listItem ).find( '.checkbox' ).prop( 'checked' ) ) {
                    return 'checked'
                }
                return ''
            })(),
            newDate = $( listItem ).find( '.edit tr td:first-child input' ).val(),
            newTask = $( listItem ).find( '.edit tr td:nth-child(2) input' ).val(),
            currentID = $( listItem ).attr( 'id' ),
            finished = (function() {
                if ( $( listItem ).hasClass( 'finished' ) ) {
                    return 'finished';
                }

                return '';
            })(),
            taskObject = new Task(isChecked, newDate, newTask, currentID, finished);

        $( listItem ).find( '.text tr td:nth-child(2)' ).text(newDate);
        $( listItem ).find( '.text tr td:nth-child(3)' ).text(newTask);

        $( listItem ).find( 'table:first-child' ).attr( 'show', 'yes' );
        $( listItem ).find( 'table:last-child' ).attr( 'show', 'no' );

        localStorage[taskObject.identifier] = JSON.stringify(taskObject);

        document.getElementById( 'what' ).focus();

        return false;
    });

    $( '#taskList' ).on( 'click', '.text td:nth-child(5)', function() {
        var listItem = $( this ).parents().eq(3),
            listItemID = $( this ).parents().eq(3).attr( 'id' );

        localStorage.removeItem(listItemID);
        $( listItem ).remove();

        return false;
    });
};

function validateMessage(string) {
    if ( string.search(/[A-zА-яЁё0-9]{3,}/i) == -1 ) {
        return {
            wrong: true,
            error: 'Нужно не менее трех символов'
        };
    }

    return false;
}

function validateDate(date) {
    var datePattern = date.match(/([0-3][0-9])\.([0-1][0-2])\.(\d{4})/),
        wrongDate = {
            wrong: true,
            error: 'Введите дату'
        };

    if ( datePattern == null ) {
        return wrongDate;
    }

    return false;
}

function clearText(element) {
    element.innerHTML = '';
}

function fillWithText(element, text) {
    element.innerHTML = text;
}

function processForms() {
    var what = document.getElementById( 'what' ),
        when = document.getElementById( 'when' ),
        messageForm = validateMessage(what.value),
        dateForm = validateDate(when.value),
        textErrorField = document.getElementById( 'textError' ),
        dateErrorField = document.getElementById( 'dateError' );

    if ( messageForm.wrong || dateForm.wrong ) {
        if ( messageForm.wrong ) {
            fillWithText(textErrorField, messageForm.error);
        } else {
            clearText(textErrorField);
        }

        if ( dateForm.wrong ) {
            fillWithText(dateErrorField, dateForm.error);
        } else {
            clearText(dateErrorField);
        }

        return false;
    }

    clearText(textErrorField);
    clearText(dateErrorField);

    uniqueID += 1;

    var taskObject = new Task( '', when.value, what.value, uniqueID, '' );

    $( '#template' ).tmpl([taskObject]).appendTo( '#taskList' );

    localStorage[taskObject.identifier] = JSON.stringify(taskObject);

    what.value ='';
    when.value = '';

    return false;
}
