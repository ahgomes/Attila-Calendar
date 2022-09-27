(function ($) {
    const DOMform = $('#signup-form');

    const DOMusername = $('#username'),
        DOMfirst_name = $('#first_name'),
        DOMlast_name = $('#last_name'),
        DOMpassword = $('#password');

    const DOMerror = $('#error');

    DOMform.submit(function (e) {
        let noErrors = true;

        let username = null,
            password = null,
            first_name = null,
            last_name = null;

        try {
            username = validateApi.isValidString(DOMusername.val(), false);
            password = validateApi.isValidString(DOMpassword.val(), false);
            first_name = validateApi.isValidString(DOMfirst_name.val(), true);
            last_name = validateApi.isValidString(DOMlast_name.val(), true);
            username = username.trim();
            validateApi.checkUsername(username);
            validateApi.checkPassword(password);
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