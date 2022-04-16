const { ObjectId } = require('mongodb');

module.exports = {
    /**
     * Checks if the number of arguments passed into your function matches the expected argument count.
     *
     * @param {number} numArgs The number of arguments that is passed into your function
     * @param {number} minNumArgs The minimum number of arguments that is expected by your function
     * @param {number} maxNumArgs The maximum number of arguments that is expected by your function
     * @returns {void} Returns void
     *
     * @throws Errors when {numArgs} < {minNumArgs}, or when {numArgs} > {maxNumArgs}
     */
    checkNumberOfArgs(numArgs, minNumArgs, maxNumArgs) {
        if (numArgs < minNumArgs)
            throw `Error: Expected minimum of ${minNumArgs} arg(s) but received ${numArgs}.`;
        if (numArgs > maxNumArgs)
            throw `Error: Expected max of ${maxNumArgs} arg(s) but received ${numArgs}.`;
        return;
    },

    /**
     * Checks if the given argument is a boolean.
     *
     * @param {any} arg The argument to be checked
     * @returns {boolean} Returns the initial argument {arg}
     *
     * @throws Errors when {arg} is not a boolean
     */
    isValidBoolean(arg) {
        this.checkNumberOfArgs(arguments.length, 1, 1);

        if (typeof arg !== 'boolean') throw `Error: '${arg}' is not a boolean.`;
        return arg;
    },

    /**
     * Checks if the given argument is a non-empty string.
     *
     * @param {any} arg The argument to be checked
     * @param {boolean} shouldTrim If {shouldTrim} is true, then {arg} will be trimmed. Otherwise, {arg} is left as is
     * @returns {string} Returns the initial argument {arg}. If {shouldTrim} is true, then {arg} is trimmed. Otherwise, {arg} is left as is
     *
     * @throws Errors when {arg} is not a string, or is an empty string. If {shouldTrim} is true, then this function errors if trimming {arg} is empty
     */
    isValidString(arg, shouldTrim) {
        this.checkNumberOfArgs(arguments.length, 2, 2);

        this.isValidBoolean(shouldTrim);
        if (typeof arg !== 'string') throw `Error: '${arg}' is not a string.`;
        const result = shouldTrim ? arg.trim() : arg;
        if (result.length < 1) throw `Error: String is empty.`;
        return result;
    },

    /**
     * Checks if the given argument is a finite number.
     *
     * @param {any} arg The argument to be checked
     * @param {boolean} isInteger If {isInteger} is true, then this function errors if {arg} is not an integer. Otherwise, {arg} is checked as a float
     * @returns {number} Returns the initial argument {arg}. If {isInteger} is true, then {arg} is an integer. Otherwise, {arg} is a float
     *
     * @throws Errors when {arg} is not a finite number. If {isInteger} is true, then this function errors if {arg} is not an integer
     */
    isValidNumber(arg, isInteger) {
        this.checkNumberOfArgs(arguments.length, 2, 2);

        this.isValidBoolean(isInteger);
        if (typeof arg !== 'number' || isNaN(arg))
            throw `Error: '${arg}' is not a number.`;
        if (!Number.isFinite(arg))
            throw `Error: Number '${arg}' is not finite.`;
        if (isInteger && !Number.isSafeInteger(arg))
            throw `Error: Number '${arg}' is not an integer.`;
        return arg;
    },

    /**
     * Checks if the given argument is a valid object id.
     *
     * @param {string} arg The argument to be checked
     * @returns {ObjectId} Returns the initial argument {arg}
     *
     * @throws Errors when {arg} is an invalid object id
     */
    isValidObjectId(arg) {
        this.checkNumberOfArgs(arguments.length, 1, 1);

        const trimmed_id = this.isValidString(arg, true);
        if (!ObjectId.isValid(trimmed_id))
            throw `Error: Id '${trimmed_id}' is an invalid object id.`;
        return arg;
    },

    /**
     * Checks if the given argument is a date object.
     *
     * @param {Date} arg The argument to be checked
     * @returns {Date} Returns the initial argument {arg}
     *
     * @throws Errors when {arg} is not a date object, or if the date is invalid
     */
    isValidDate(arg) {
        this.checkNumberOfArgs(arguments.length, 1, 1);

        if (Object.prototype.toString.call(arg) !== '[object Date]')
            throw `Error: '${arg}' is not a date object.`;
        if (arg.toString() === 'Invalid Date')
            throw `Error: The date is invalid.`;
        return arg;
    },
};
