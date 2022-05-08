(function ($) {
    const DOMform = $('#change-password-form');

    const DOMpassword = $('#password');

    const DOMerror = $('#error');

    DOMform.submit(function (e) {
        let noErrors = true;

        let password = null;

        try {
            password = validateApi.isValidString(DOMpassword.val(), false);
            validateApi.checkPassword(password);
            DOMerror.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMerror.text(e).show();
        }
        

        if (!noErrors) e.preventDefault();
    });
})(window.jQuery);