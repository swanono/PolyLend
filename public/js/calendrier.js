'use strict';

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

    fetch('/api/reservation/allbyElem', {
        credentials: 'same-origin',
        method: 'POST',
        body: JSON.stringify({id_Element: idE,}),
        headers: new Headers({'Content-type': 'application/json'}),
    })
    .then(response => response.json())
    .then(r => {if (!r.errno) {return r;} else {throw r;}})
    .then(function (reservData) {
        fetch('/api/creneau/allbyid', {
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({id_Element: idE,}),
            headers: new Headers({'Content-type': 'application/json'}),
        })
        .then(response => response.json())
        .then(r => {if (!r.errno) {return r;} else {throw r;}})
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
                    let tdDate = new Date(yearFocus, focusDateLun.getMonth(), focusDateLun.getDate() + j, i - focusDateLun.getTimezoneOffset()/60);

                    let td = document.createElement('td');
                    td.style.position = 'relative';
                    td.style.height = '4em';
                    td.style.verticalAlign = 'top';

                    let reserv_Over = reservData.find(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate) + 3600000);
                    });

                    if (reserv_Over && reserv_Over.validation !== -1) {
                        let divOver = document.createElement('div');
                        divOver.style.position = 'absolute';
                        divOver.style.zIndex = 1;
                        divOver.style.width = '99%';
                        divOver.style.height = '99%';
                        divOver.style.backgroundColor = reserv_Over.validation === 1 ? 'red' : 'orange';
                        td.appendChild(divOver);
                    }

                    let reserv_End = reservData.find(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000);
                    });

                    if (reserv_End && reserv_End.validation !== -1) {
                        let divEnd = document.createElement('div');
                        divEnd.style.position = 'absolute';
                        divEnd.style.zIndex = 1;
                        divEnd.setAttribute('date_fin', '' + (Date.parse(reserv_End.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000));
                        divEnd.style.width = '99%';
                        divEnd.style.height = (Date.parse(reserv_End.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 - Date.parse(tdDate))/36000 + '%';
                        divEnd.style.backgroundColor = reserv_End.validation === 1 ? 'red' : 'orange';
                        td.appendChild(divEnd);
                    }
                    
                    let reserv_In = reservData.filter(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000);
                    });

                    reserv_In.forEach(reserv => {
                        if (reserv_In.validation !== -1) {
                            let divIn = document.createElement('div');
                            divIn.style.position = 'absolute';
                            divIn.style.zIndex = 1;
                            divIn.setAttribute('date_fin', '' + (Date.parse(reserv_In.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000));
                            divIn.style.width = '99%';
                            divIn.style.height = (Date.parse(reserv.date_heure_fin) - Date.parse(reserv.date_heure_debut))/36000 + '%';
                            divIn.style.top = ((Date.parse(reserv.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 - Date.parse(tdDate))/36000) + '%';
                            divIn.style.backgroundColor = reserv_In.validation === 1 ? 'red' : 'orange';
                            td.appendChild(divIn);
                        }
                    });

                    let reserv_Begin = reservData.find(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate) + 3600000);
                    });

                    if (reserv_Begin && reserv_Begin.validation !== -1) {
                        let divBegin = document.createElement('div');
                        divBegin.style.position = 'absolute';
                        divBegin.style.zIndex = 1;
                        divBegin.style.width = '99%';
                        divBegin.style.height = (Date.parse(tdDate) + 3600000 - (Date.parse(reserv_Begin.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000))/36000 + '%';
                        divBegin.style.top = ((Date.parse(reserv_Begin.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 - Date.parse(tdDate))/36000) + '%';
                        divBegin.style.backgroundColor = reserv_Begin.validation === 1 ? 'red' : 'orange';
                        td.appendChild(divBegin);
                    }

                    ////////

                    let cren_Over = crenDatas.find(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate) + 3600000);
                    });

                    if (cren_Over && cren_Over.validation !== -1) {
                        let divOver = document.createElement('div');
                        divOver.style.position = 'absolute';
                        divOver.style.width = '99%';
                        divOver.style.height = '99%';
                        divOver.style.backgroundColor = 'green';
                        td.appendChild(divOver);
                    }

                    let cren_End = crenDatas.find(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000);
                    });

                    if (cren_End && cren_End.validation !== -1) {
                        let divEnd = document.createElement('div');
                        divEnd.style.position = 'absolute';
                        divEnd.setAttribute('date_fin', '' + (Date.parse(cren_End.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000));
                        divEnd.style.width = '99%';
                        divEnd.style.height = (Date.parse(cren_End.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 - Date.parse(tdDate))/36000 + '%';
                        divEnd.style.backgroundColor = 'green';
                        td.appendChild(divEnd);
                    }
                    
                    let cren_In = crenDatas.filter(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000);
                    });

                    cren_In.forEach(reserv => {
                        if (cren_In.validation !== -1) {
                            let divIn = document.createElement('div');
                            divIn.style.position = 'absolute';
                            divIn.setAttribute('date_fin', '' + (Date.parse(cren_In.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000));
                            divIn.style.width = '99%';
                            divIn.style.height = (Date.parse(reserv.date_heure_fin) - Date.parse(reserv.date_heure_debut))/36000 + '%';
                            divIn.style.top = ((Date.parse(reserv.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 - Date.parse(tdDate))/36000) + '%';
                            divIn.style.backgroundColor = 'green';
                            td.appendChild(divIn);
                        }
                    });

                    let cren_Begin = crenDatas.find(cren => {
                        return (Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate)
                            && Date.parse(cren.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 <= Date.parse(tdDate) + 3600000
                            && Date.parse(cren.date_heure_fin) - focusDateLun.getTimezoneOffset()*60000 >= Date.parse(tdDate) + 3600000);
                    });

                    if (cren_Begin && cren_Begin.validation !== -1) {
                        let divBegin = document.createElement('div');
                        divBegin.style.position = 'absolute';
                        divBegin.style.width = '99%';
                        divBegin.style.height = (Date.parse(tdDate) + 3600000 - (Date.parse(cren_Begin.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000))/36000 + '%';
                        divBegin.style.top = ((Date.parse(cren_Begin.date_heure_debut) - focusDateLun.getTimezoneOffset()*60000 - Date.parse(tdDate))/36000) + '%';
                        divBegin.style.backgroundColor = 'green';
                        td.appendChild(divBegin);
                    }

                    tr.appendChild(td);
                }

                tbody.appendChild(tr);
            }
        })
        .catch(err => console.error(err));
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