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
     * @param {boolean} arg The argument to be checked
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
     * @param {string} arg The argument to be checked
     * @param {boolean} shouldTrim If {shouldTrim} is true, then {arg} will be trimmed. Otherwise, {arg} is left as is
     * @returns {string} Returns the initial argument {arg}. If {shouldTrim} is true, then {arg} is trimmed. Otherwise, {arg} is left as is
     *
     * @throws Errors when {arg} is not a string, or is an empty string
     */
    isValidString(arg, shouldTrim) {
        this.checkNumberOfArgs(arguments.length, 2, 2);

        this.isValidBoolean(shouldTrim);
        if (typeof arg !== 'string') throw `Error: '${arg}' is not a string.`;
        arg = shouldTrim ? arg.trim() : arg;
        if (arg.length < 1) throw `Error: String is empty.`;
        return arg;
    },

    /**
     * Checks if the given argument is a finite number.
     *
     * @param {number} arg The argument to be checked
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
     * @returns {ObjectId} Returns the initial argument {arg} as an object id
     *
     * @throws Errors when {arg} is an invalid object id
     */
    isValidObjectId(arg) {
        this.checkNumberOfArgs(arguments.length, 1, 1);

        const trimmed_id = this.isValidString(arg, true);
        if (!ObjectId.isValid(trimmed_id))
            throw `Error: Id '${trimmed_id}' is an invalid object id.`;
        return ObjectId(arg);
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

    /**
     * Checks if the given argument is an array.
     *
     * @param {Array} arg The argument to be checked
     * @param {boolean} isNotEmpty If {isNotEmpty} is true, then this function errors if {arg} is an empty array. Otherwise, {arg} is checked as is
     * @returns {Array} Returns the initial argument {arg}
     *
     * @throws Errors when {arg} is not an array. If {isNotEmpty} is true, then this function errors if {arg} is an empty array
     */
    isValidArray(arg, isNotEmpty) {
        this.checkNumberOfArgs(arguments.length, 2, 2);

        this.isValidBoolean(isNotEmpty);
        if (typeof arg !== 'object' || !Array.isArray(arg))
            throw `Error: '${arg}' is not an array.`;
        if (isNotEmpty && arg.length < 1) throw `Error: Array is empty.`;
        return arg;
    },

    /**
     * Checks if the given argument is an array of non-empty strings.
     *
     * @param {Array<string>} arg The argument to be checked
     * @param {boolean} isNotEmpty If {isNotEmpty} is true, then this function errors if {arg} is an empty array. Otherwise, {arg} is checked as is
     * @param {boolean} shouldTrim If {shouldTrim} is true, then each string in {arg} will be trimmed. Otherwise, each string is left as is
     * @returns {Array<string>} Returns the initial argument {arg}. If {shouldTrim} is true, then each string in {arg} is trimmed. Otherwise, each string is left as is
     *
     * @throws Errors when {arg} is not an array of strings. If {isNotEmpty} is true, then this function errors if {arg} is an empty array
     * @throws Errors when an element in {arg} is not a string, or is an empty string
     */
    isValidArrayofStrings(arg, isNotEmpty, shouldTrim) {
        this.checkNumberOfArgs(arguments.length, 3, 3);

        this.isValidBoolean(isNotEmpty);
        this.isValidBoolean(shouldTrim);
        this.isValidArray(arg, isNotEmpty);
        return arg.map((elem) => this.isValidString(elem, shouldTrim));
    },
};
