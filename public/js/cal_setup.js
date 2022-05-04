const days_of_week = [ 'sunday', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday', 'saturday' ];

const weekday = (y, m, d) => {
    return new Date(y, m, d).getDay();
};

const month_end = (y, m) => {
    return new Date(y, m + 1, 0).getDate();
};

const convert_format = date_str => { // MM/DD/YYYY UTC-5 -> YYYY-MM-DD
    let [m, d, y] = date_str.slice(0, 10).split('/');
    return [y, m, d].join('-');
};

const TODAY = new Date();
let current = new Date();

function create_thgroup() {
    let group = $('<div>').addClass('th-group');

    days_of_week.forEach((day, i) => {
        $('<h2>')
            .attr('id', `th-${i}`)
            .attr('data-day', days_of_week[i])
            .html(day.slice(0,3))
            .appendTo(group);
    });

    group.appendTo('#cal');
}

function create_rows(n) {
    for (let i = 0; i <= n; i++) {
        let row = $('<div>').addClass('row').attr('id', `tr-${i}`);
        for (let j = 0; j < 7; j++) {
            $('<div>')
                .addClass('cell')
                .addClass(`td-${days_of_week[j]}`)
                .attr('id', `td-${(i < 1 ? '0' : '')
                    + (i * 7 + j).toString(7)}`)
                .append($('<ol>').addClass('events'))
                .appendTo(row);
        }
        row.appendTo('#cal');
    }
}

function fill_cal(curr) {
    let last = new Date(curr);
    last.setDate(0);

    $('#cal-title').html(curr.toLocaleDateString('en-us', {
        month: 'long', year: 'numeric'}));

    let curr_start = weekday(curr.getFullYear(), curr.getMonth(), 1);
    let curr_end = month_end(curr.getFullYear(), curr.getMonth());
    let last_end = last.getDate();

    let next = new Date(curr);
    next.setDate(curr_end + 1);

    let format_str = (date) => {
        let y = date.getFullYear();
            m = date.getMonth() + 1;
        return [y, (m < 10 ? '0' + m : m)].join('-');
    };

    let curr_str_part = format_str(curr),
        last_str_part = format_str(last),
        next_str_part = format_str(next);

    let row_count = (curr_start + curr_end - 1).toString(7)[0];
    create_rows(row_count);

    let i = 0, date, str_part;
    let on_curr = false;
    if (curr_start) {
        date = last_end - curr_start + 1;
        str_part = last_str_part;
    } else {
        on_curr = true;
        date = 1;
        str_part = curr_str_part;
    }

    for (; i < (row_count + 1) * 7; i++) {
        let cell = $(`#td-${(i < 7 ? '0' : '') + i.toString(7)}`);
        cell.attr('data-date', `${str_part}-${(date < 10 ? '0' + date : date)}`)
            .prepend($('<h2>').text(date));

        if (i < curr_start) cell.addClass('last');
        else if (i >= curr_start + curr_end) cell.addClass('next');

        if (on_curr && curr.valueOf() == TODAY.valueOf()
                && date == curr.getDate()) {
            cell.addClass('today');
        }


        if (i == curr_start - 1) {
            str_part = curr_str_part;
            on_curr = true;
            date = 1;
        } else if (i == curr_start + curr_end - 1) {
            str_part = next_str_part;
            date = 1;
            on_curr = false;
        } else date++;
    }

    fill_events(data);
}

/* dummy data */
let data = [{date: '04/17/2022, 12:16:35 AM', title: 'event'},
            {date: '03/17/2022, 12:16:35 AM', title: 'event'},
            {date: '03/31/2022, 12:16:35 AM', title: 'event'},
            {date: '04/16/2022, 12:16:35 AM', title: 'event'},
            {date: '04/16/2022, 12:16:35 AM', title: 'event'},
            {date: '04/16/2022, 12:16:35 AM', title: 'event'},
            {date: '04/16/2022, 12:16:35 AM', title: 'event'},
            {date: '04/16/2022, 12:16:35 AM', title: 'event'}];

function fill_events(event_data) {
    $.each(event_data, (i, el) => {
        let data_date = convert_format(el.date);
        $('<li>')
            .text(el.title)
            .appendTo(`.cell[data-date=${data_date}] .events`)
    });
}

function update_cal(date) {
    $('#cal .row').remove();
    fill_cal(date);
}

$('#btn-today').click(_ => {
    current = new Date(TODAY);
    update_cal(current);
});

$('#btn-last').click(_ => {
    current.setMonth(current.getMonth() - 1);
    update_cal(current);
});

$('#btn-next').click(_ => {
    current.setMonth(current.getMonth() + 1);
    update_cal(current);
});

$(document).ready(_ => {
    create_thgroup();
    fill_cal(current);
});
