'use strict';

const prefixDir = '';

Date.prototype.getWeekNumber = function () {
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

var monthNames = ['Jan','Fev','Mar','Avr','Mai','Jui','Juil','Aou','Sep','Oct','Nov','Dec'];
var jours = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
var monthDays = (focusYear) => [31, (((focusYear % 4 == 0) && (focusYear % 100 != 0)) || (focusYear % 400 == 0) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var today = new Date(Date.now());
var thisDayName = jours[today.getDay()];
var thisDay = today.getDate();
var thisWeek = today.getWeekNumber();
var thisMonth = today.getMonth();
var thisMonthName = monthNames[thisMonth];
var thisYear = today.getFullYear();
thisYear <= 200 ? thisYear += 1900 : null;

/*
console.log(today);
console.log(thisDayName);
console.log(thisDay);
console.log(thisWeek);
console.log(thisMonth);
console.log(thisMonthName);
console.log(thisYear);
*/

var focusDate = new Date(Date.now() - 24 * 3600000 * (today.getDay() - (today.getDay() === 0 ? -6 : 1)));

function updateCalendar (focusDateLun, idE) {
    let yearFocus = (focusDateLun.getFullYear() <= 200 ? focusDateLun.getFullYear() + 1900 : focusDateLun.getFullYear());
    document.getElementById('exampleModalLongTitle').textContent = yearFocus + ' Semaine ' + focusDateLun.getWeekNumber();

    let headJours = document.getElementById('jours');
    Array.from(headJours.children).forEach(function (jour, index) {
        if (index != 0) {
            let day = focusDateLun.getDate() + index - 1;
            let month = monthNames[(focusDateLun.getMonth() + (day > monthDays(yearFocus)[focusDateLun.getMonth()] ? 1 : 0)) % 12];
            (day > monthDays(yearFocus)[focusDateLun.getMonth()] ? day -= monthDays(yearFocus)[focusDateLun.getMonth()] : null);
            jour.innerHTML = jours[index % 7] + '<br/>' + (day) + ' ' + (month);
        }
    });

    fetch(prefixDir + '/api/creneau/allbyid', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Element: idE,}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(response => response.json())
    .then(function (crenDatas) {
        let tbody = document.getElementById('calendrier_body').firstElementChild.lastElementChild;
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        for (let i = 0; i < 24; i += 1) {
            let tr = document.createElement('tr');

            let th = document.createElement('th');
            th.setAttribute('id', 'heure-' + (i < 10 ? '0' : '') + i + ':00');
            th.textContent = (i < 10 ? '0' : '') + i + ':00';
            tr.appendChild(th);

            for (let j = 0; j < 7; j += 1) {
                // j+1 % 7

                let td = document.createElement('td');
                td.innerHTML = '<br/><br/>';

                let cren_Over = crenDatas.find(cren => {
                    return (Date.parse(cren.date_heure_debut) + 3600000 <= Date.parse(new Date(yearFocus, focusDateLun.getUTCMonth(), focusDateLun.getUTCDate() + j, i - focusDateLun.getTimezoneOffset()/60))
                        && Date.parse(cren.date_heure_fin) + 3600000 >= Date.parse(new Date(yearFocus, focusDateLun.getUTCMonth(), focusDateLun.getUTCDate() + j, i + 1 - focusDateLun.getTimezoneOffset()/60)));
                });

                if (cren_Over) {
                    td.style.backgroundColor = 'red';
                }

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }
    })
    .catch(err => console.error(err));
}

document.getElementById('contcalendar').firstElementChild.addEventListener('click', () => updateCalendar(focusDate, 1));
document.getElementById('btn_min').addEventListener('click', () => {
    focusDate.setTime(focusDate.getTime() - 7 * 24 * 3600000);
    updateCalendar(focusDate, 1);
});
document.getElementById('btn_plus').addEventListener('click', () => {
    focusDate.setTime(focusDate.getTime() + 7 * 24 * 3600000);
    updateCalendar(focusDate, 1);
});