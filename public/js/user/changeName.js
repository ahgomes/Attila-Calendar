(function ($) {
    const DOMform = $('#change-name-form');

    const DOMfirst_name = $('#first_name'),
        DOMlast_name = $('#last_name');

    const DOMerror = $('#error');

    DOMform.submit(function (e) {
        let noErrors = true;

        let first_name = null,
            last_name = null;

        try {
            first_name = validateApi.isValidString(DOMfirst_name.val(), true);
            last_name = validateApi.isValidString(DOMlast_name.val(), true);
            validateApi.checkName(first_name);
            validateApi.checkName(last_name);
            DOMerror.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMerror.text(e).show();
        }
        

        if (!noErrors) e.preventDefault();
    });
})(window.jQuery);