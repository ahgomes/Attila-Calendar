const validateApi = require('./validate');

module.exports = {
    /**
     * Converts a string into a number.
     *
     * @param {string} str The string to be converted
     *
     * @returns {number} Returns the initial string {str} converted as a number. Note: possible output types include: integer, float, -INFINITY, +INFINITY
     *
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
     * Converts a date string and a time string into a date object.
     *
     * @param {string} date_str The date string to be converted in the form 'MM/DD/YYYY'
     * @param {string} time_str The time string to be converted in the form 'HH:MM'
     *
     * @returns {Date} Returns a date object using the date {date_str} and the time {time_str}
     *
     * @throws Errors when {date_str} is not in the form 'MM/DD/YYYY'
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

        const dateArray = date_str.split('/');
        if (
            dateArray.length !== 3 ||
            dateArray[0].length !== 2 ||
            dateArray[1].length !== 2 ||
            dateArray[2].length !== 4
        )
            throw `Error: Date '${date_str}' must be in the form 'MM/DD/YYYY'.`;

        const month = validateApi.isValidNumber(
            this.stringToNumber(dateArray[0]),
            true
        );
        if (month < 1 || month > 12)
            throw `Error: Month '${month}' must be in the range 1-12 inclusive.`;

        const year = validateApi.isValidNumber(
            this.stringToNumber(dateArray[2]),
            true
        );
        if (year < 1000) throw `Error: Year '${year}' must be positive.`;

        const validDays = [
            31, // Jan
            // Feb
            new Date(year, 1, 29).getUTCMonth() === 1 ? 29 : 28,
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
            this.stringToNumber(dateArray[1]),
            true
        );
        if (day < 1 || day > validDays[month - 1])
            throw `Error: Day '${day}' must be in the range 1-${
                validDays[month - 1]
            } inclusive.`;

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

        return new Date(year, month - 1, day, hours, minutes);
    },
};
