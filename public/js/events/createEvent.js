(function ($) {
    const DOMform = $('#create-event-form');

    const DOMcalendar = $('#input-calendar'),
        DOMtitle = $('#input-title'),
        DOMdesc = $('#input-desc'),
        DOMpriority = $('#input-priority'),
        DOMdate = $('#input-date'),
        DOMtime = $('#input-time');

    const DOMcalendarError = $('#input-calendar-error'),
        DOMtitleError = $('#input-title-error'),
        DOMdescError = $('#input-desc-error'),
        DOMpriorityError = $('#input-priority-error'),
        DOMdateError = $('#input-date-error'),
        DOMtimeError = $('#input-time-error');

    DOMform.submit(function (e) {
        let noErrors = true;

        let calendarValue = null,
            titleValue = null,
            descValue = null,
            priorityValue = null,
            dateValue = null,
            timeValue = null;

        try {
            if (!DOMcalendar.val())
                throw `Error: Calendar must to have a selected value.`;
            calendarValue = validateApi.isValidString(DOMcalendar.val(), true);
            DOMcalendarError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMcalendarError.text(e).show();
        }

        try {
            titleValue = validateApi.isValidString(DOMtitle.val(), true);
            if (titleValue.length > 300)
                throw `Error: Title cannot exceed 300 characters. (${titleValue.length} characters detected)`;
            DOMtitleError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMtitleError.text(e).show();
        }

        try {
            descValue = validateApi.isValidString(DOMdesc.val(), false);
            if (descValue.length > 2000)
                throw `Error: Description cannot exceed 2000 characters. (${descValue.length} characters detected)`;
            DOMdescError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMdescError.text(e).show();
        }

        try {
            priorityValue = validateApi.isValidString(DOMpriority.val(), true);
            const priority = validateApi.isValidNumber(
                convertApi.stringToNumber(priorityValue),
                true
            );
            if (priority < 1 || priority > 5)
                throw `Error: Priority '${priorityValue}' must be in the range 1-5 inclusive.`;
            DOMpriorityError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMpriorityError.text(e).show();
        }

        try {
            dateValue = validateApi.isValidString(DOMdate.val(), true);
            convertApi.dateStringToObject(dateValue);
            DOMdateError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMdateError.text(e).show();
        }

        try {
            timeValue = validateApi.isValidString(DOMtime.val(), true);
            convertApi.timeStringToObject(timeValue);
            DOMtimeError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMtimeError.text(e).show();
        }

        if (!noErrors) e.preventDefault();
    });
})(window.jQuery);
