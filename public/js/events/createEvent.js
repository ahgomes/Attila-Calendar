(function ($) {
    const DOMform = $('#create-event-form');

    const DOMtitle = $('#input-title'),
        DOMdesc = $('#input-desc'),
        DOMpriority = $('#input-priority'),
        DOMdate = $('#input-date'),
        DOMtime = $('#input-time');

    const DOMtitleError = $('#input-title-error'),
        DOMdescError = $('#input-desc-error'),
        DOMpriorityError = $('#input-priority-error'),
        DOMdateError = $('#input-date-error'),
        DOMtimeError = $('#input-time-error');

    DOMform.submit(function (e) {
        let noErrors = true;

        const titleValue = DOMtitle.val().trim();
        if (!titleValue) {
            noErrors = false;
            DOMtitleError.text('Title is empty.').show();
        } else {
            DOMtitleError.text('').hide();
        }

        const descValue = DOMdesc.val();
        if (!descValue) {
            noErrors = false;
            DOMdescError.text('Description is empty.').show();
        } else {
            DOMdescError.text('').hide();
        }

        const priorityValue = DOMpriority.val().trim();
        const priority = Number(priorityValue);
        if (
            Number.isNaN(priority) ||
            !Number.isFinite(priority) ||
            !Number.isSafeInteger(priority) ||
            priority < 1 ||
            priority > 5
        ) {
            noErrors = false;
            DOMpriorityError.text(
                'Priority is not an integer in the range 1-5 inclusive.'
            ).show();
        } else {
            DOMpriorityError.text('').hide();
        }

        const dateValue = DOMdate.val().trim();
        const dateArray = dateValue.split('-');
        if (
            dateArray.length !== 3 ||
            dateArray[0].length !== 4 ||
            dateArray[1].length !== 2 ||
            dateArray[2].length !== 2
        ) {
            noErrors = false;
            DOMdateError.text(
                "Deadline date is not in the form 'YYYY-MM-DD'."
            ).show();
        } else {
            DOMdateError.text('').hide();
        }

        const timeValue = DOMtime.val().trim();
        const timeArray = timeValue.split(':');
        if (
            timeArray.length !== 2 ||
            timeArray[0].length !== 2 ||
            timeArray[1].length !== 2
        ) {
            noErrors = false;
            DOMtimeError.text(
                "Deadline time is not in the form 'HH:MM'."
            ).show();
        } else {
            DOMtimeError.text('').hide();
        }

        if (!noErrors) e.preventDefault();
    });
})(window.jQuery);
