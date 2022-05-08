(function ($) {
    const DOMform = $('#login-form');

    const DOMusername = $('#username'),
        DOMpassword = $('#password');

    const DOMerror = $('#error');

    DOMform.submit(function (e) {
        let noErrors = true;

        let username = null,
            password = null;

        try {
            username = validateApi.isValidString(DOMusername.val(), false);
            password = validateApi.isValidString(DOMpassword.val(), false);
            validateApi.checkUsername(username);
            validateApi.checkPassword(password);
            DOMerror.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMerror.text(e).show();
        }
        

        if (!noErrors) e.preventDefault();
    });
})(window.jQuery);