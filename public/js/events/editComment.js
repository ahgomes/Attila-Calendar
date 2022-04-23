(function ($) {
    const DOMform = $('#edit-comment-form');

    const DOMcomments = $('#comment-container');

    const DOMcomment = $('#input-comment');
    const DOMcommentError = $('#input-comment-error');

    DOMform.submit(async function (e) {
        e.preventDefault();

        let noErrors = true;

        const commentValue = DOMcomment.val();
        if (!commentValue) {
            noErrors = false;
            DOMcommentError.text('Comment is empty.').show();
        } else {
            DOMcommentError.text('').hide();
        }

        if (noErrors) {
            const addCommentRequest = {
                method: 'POST',
                url: window.location.href,
                contentType: 'application/json',
                data: JSON.stringify({ input_comment: commentValue }),
            };

            try {
                DOMcomment.val('');
                DOMcomments.append(
                    $.parseHTML(await $.ajax(addCommentRequest))
                );
            } catch (e) {
                DOMcommentError.text(e.responseJSON.errorMsg).show();
            }
        }
    });
})(window.jQuery);
