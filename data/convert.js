const validateApi = require('./validate');

module.exports = {
    /**
     * Converts a string into a number.
     *
     * @param {string} str The string to be converted
     *
     * @returns {number} Returns the initial string {str} converted as a number. Note: possible output types include: integer, float, -INFINITY, +INFINITY
     *
     * @throws Errors when {str} is not a string
     * @throws Errors when {str} cannot be converted into a number
     */
    stringToNumber(str) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        str = validateApi.isValidString(str, true);

        const num = Number(str);
        if (Number.isNaN(num))
            throw `Error: String '${str}' cannot be converted into a number.`;
        return num;
    },

    /**
     * Converts a string in the form 'YYYY-MM-DD' into an object of its components.
     *
     * @param {string} date_str The string to be converted
     *
     * @returns {Object} Returns the object {value: {date_str} trimmed, month: MM, day: DD, year: YYYY} with each component parsed as a number
     *
     * @throws Errors when {date_str} is not a string
     * @throws Errors when {date_str} is not in the form 'YYYY-MM-DD'
     * @throws Errors when the month in {date_str} is not in the range 1-12 inclusive
     * @throws Errors when the year in {date_str} is not greater than or equal to 1000
     * @throws Errors when the day in {date_str} does not correspond to the month and year
     */
    dateStringToObject(date_str) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        date_str = validateApi.isValidString(date_str, true);

        const dateArray = date_str.split('-');
        if (
            dateArray.length !== 3 ||
            dateArray[0].length !== 4 ||
            dateArray[1].length !== 2 ||
            dateArray[2].length !== 2
        )
            throw `Error: Date '${date_str}' must be in the form 'YYYY-MM-DD'.`;

        const month = validateApi.isValidNumber(
            this.stringToNumber(dateArray[1]),
            true
        );
        if (month < 1 || month > 12)
            throw `Error: Month '${month}' must be in the range 1-12 inclusive.`;

        const year = validateApi.isValidNumber(
            this.stringToNumber(dateArray[0]),
            true
        );
        if (year < 1000)
            throw `Error: Year '${year}' must be greater than or equal to 1000.`;

        const validDays = [
            31, // Jan
            new Date(year, 1, 29).getUTCMonth() === 1 ? 29 : 28, // Feb
            31, // Mar
            30, // Apr
            31, // May
            30, // Jun
            31, // Jul
            31, // Aug
            30, // Sep
            31, // Oct
            30, // Nob
            31, // Dec
        ];

        const day = validateApi.isValidNumber(
            this.stringToNumber(dateArray[2]),
            true
        );
        if (day < 1 || day > validDays[month - 1])
            throw `Error: Day '${day}' must be in the range 1-${
                validDays[month - 1]
            } inclusive.`;

        return { value: date_str, month, day, year };
    },

    /**
     * Converts a string in the form 'HH:MM' into an object of its components.
     *
     * @param {string} time_str The string to be converted
     *
     * @returns {Object} Returns the object {value: {time_str} trimmed, hours: HH, minutes: MM} with each component parsed as a number
     *
     * @throws Errors when {time_str} is not a string
     * @throws Errors when {time_str} is not in the form 'HH:MM'
     * @throws Errors when the hours in {time_str} is not in the range 0-23 inclusive
     * @throws Errors when the minutes in {time_str} is not in the range 0-59 inclusive
     */
    timeStringToObject(time_str) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        time_str = validateApi.isValidString(time_str, true);

        const timeArray = time_str.split(':');
        if (
            timeArray.length !== 2 ||
            timeArray[0].length !== 2 ||
            timeArray[1].length !== 2
        )
            throw `Error: Time '${time_str}' must be in the form 'HH:MM'.`;

        const hours = validateApi.isValidNumber(
            this.stringToNumber(timeArray[0]),
            true
        );
        if (hours < 0 || hours > 23)
            throw `Error: Hour '${hours}' must be in the range 0-23 inclusive.`;

        const minutes = validateApi.isValidNumber(
            this.stringToNumber(timeArray[1]),
            true
        );
        if (minutes < 0 || minutes > 59)
            throw `Error: Minutes '${minutes}' must be in the range 0-59 inclusive.`;

        return { value: time_str, hours, minutes };
    },

    /**
     * Converts a date string and a time string into a date object.
     *
     * @param {string} date_str The date string to be converted in the form 'YYYY-MM-DD'
     * @param {string} time_str The time string to be converted in the form 'HH:MM'
     *
     * @returns {Date} Returns a date object using the date {date_str} and the time {time_str}. Note: The timezone is stored in UTC
     *
     * @throws Errors when {date_str} is not a string
     * @throws Errors when {time_str} is not a string
     * @throws Errors when {date_str} is not in the form 'YYYY-MM-DD'
     * @throws Errors when the month in {date_str} is not in the range 1-12 inclusive
     * @throws Errors when the year in {date_str} is not greater than or equal to 1000
     * @throws Errors when the day in {date_str} does not correspond to the month and year
     * @throws Errors when {time_str} is not in the form 'HH:MM'
     * @throws Errors when the hours in {time_str} is not in the range 0-23 inclusive
     * @throws Errors when the minutes in {time_str} is not in the range 0-59 inclusive
     */
    stringToDate(date_str, time_str) {
        validateApi.checkNumberOfArgs(arguments.length, 2, 2);

        date_str = validateApi.isValidString(date_str, true);
        time_str = validateApi.isValidString(time_str, true);

        const dateObj = this.dateStringToObject(date_str);
        const month = dateObj.month,
            day = dateObj.day,
            year = dateObj.year;

        const timeObj = this.timeStringToObject(time_str);
        const hours = timeObj.hours,
            minutes = timeObj.minutes;

        return new Date(year, month - 1, day, hours, minutes);
    },

    /**
     * Converts a date object into a date string.
     *
     * @param {Date} date The date object to be converted
     *
     * @returns {string} Returns the date string of {date} in the form 'YYYY-MM-DD'. Note: The timezone is stored in local time
     *
     * @throws Errors when {date} is not a date object
     */
    dateToDateString(date) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        date = validateApi.isValidDate(date);

        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        const year = `${date.getFullYear()}`.padStart(4, '0');

        return `${year}-${month}-${day}`;
    },

    /**
     * Converts a date object into a time string.
     *
     * @param {Date} date The date object to be converted
     *
     * @returns {string} Returns the time string of {date} in the form 'HH:MM'. Note: The timezone is stored in local time
     *
     * @throws Errors when {date} is not a date object
     */
    dateToTimeString(date) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        date = validateApi.isValidDate(date);

        const hours = `${date.getHours()}`.padStart(2, '0');
        const minutes = `${date.getMinutes()}`.padStart(2, '0');

        return `${hours}:${minutes}`;
    },

    /**
     * Converts a date object into a readable string.
     *
     * @param {Date} date The date object to be converted
     *
     * @returns {string} Returns the readable string of {date} in the form 'MM/DD/YYYY @ HH:MM (TIMEZONE)'. Note: The timezone is stored in local time
     *
     * @throws Errors when {date} is not a date object
     */
    dateToReadableString(date) {
        validateApi.checkNumberOfArgs(arguments.length, 1, 1);

        date = validateApi.isValidDate(date);

        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        let hours = date.getHours() % 12;
        hours = !hours ? 12 : hours;
        const minutes = `${date.getMinutes()}`.padStart(2, '0');

        const meridian = date.getHours() < 12 ? 'AM' : 'PM';

        /*
        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local time';
        */

        return `${month}/${day}/${year} @ ${hours}:${minutes} ${meridian}`;
    },

    /**
     * Converts objects in an event into strings to make it more readable.
     *
     * @param {Object} event The event to be prettified
     * @param {boolean} showDelete Determines whether comments are displayed with a link to delete the comment
     * @param {string} accesor The username of the user who wants to access the event
     *
     * @returns {Object} Returns the initial event prettified
     *
     * @throws Errors when {event} is not an object, or is null
     * @throws Errors when {showDelete} is not a boolean
     * @throws Errors when {accesor} is not a string, or is an empty string
     */
    prettifyEvent(event, showDelete, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        event = validateApi.isValidObject(event);
        showDelete = validateApi.isValidBoolean(showDelete);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        event.deadline = this.dateToReadableString(new Date(event.deadline));
        event.comments = event.comments.map((elem) =>
            this.prettifyComment(elem, showDelete, accesor)
        );

        return event;
    },

    /**
     * Converts objects in a comment into strings to make it more readable.
     *
     * @param {Object} comment The comment to be prettified
     * @param {boolean} showDelete Determines whether comments are displayed with a link to delete itself
     * @param {string} accesor The username of the user who wants to access the comment
     *
     * @returns {Object} Returns the initial comment prettified
     *
     * @throws Errors when {comment} is not an object, or is null
     * @throws Errors when {showDelete} is not a boolean
     */
    prettifyComment(comment, showDelete, accesor) {
        validateApi.checkNumberOfArgs(arguments.length, 3, 3);

        comment = validateApi.isValidObject(comment);
        showDelete = validateApi.isValidBoolean(showDelete);
        accesor = validateApi.isValidString(accesor, true).toLowerCase();

        comment.createdOn = this.dateToReadableString(
            new Date(comment.createdOn)
        );
        comment.commentExists = comment.comment.trim().length > 0;
        comment.showDelete = showDelete
            ? accesor === comment.owner.toLowerCase()
            : showDelete;

        return comment;
    },

    /**
     * Converts an event to an event view to be rendered in an event widget.
     *
     * @param {Object} event The event to be converted
     * @param {boolean} showView Determines whether the event is displayed with a link to view itself
     * @param {boolean} showEdit Determines whether the event is displayed with a link to edit itself
     * @param {boolean} showDelete Determines whether the event is displayed with a link to delete itself
     *
     * @returns {Object} Returns the initial event as an event view
     *
     * @throws Errors when {event} is not an object, or is null
     * @throws Errors when {showView} is not a boolean
     * @throws Errors when {showEdit} is not a boolean
     * @throws Errors when {showDelete} is not a boolean
     */
    eventToEventView(event, showView, showEdit, showDelete) {
        validateApi.checkNumberOfArgs(arguments.length, 4, 4);

        event = validateApi.isValidObject(event);
        showView = validateApi.isValidBoolean(showView);
        showEdit = validateApi.isValidBoolean(showEdit);
        showDelete = validateApi.isValidBoolean(showDelete);

        return {
            titleExists: event.title.trim().length > 0,
            descExists: event.description.trim().length > 0,
            noCommentsExist: !event.comments.length,
            priorityColor: `event-priority-${event.priority}`,
            showView,
            showEdit,
            showDelete,
            event,
        };
    },
};
