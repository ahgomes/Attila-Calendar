(function ($) {
    const DOMform = $('#edit-comment-form');

    const DOMcomments = $('#comment-container');

    const DOMcomment = $('#input-comment');
    const DOMcommentError = $('#input-comment-error');

    const DOMdeleteCommentAnchor = $('.delete-comment-anchor');
    $.each(DOMdeleteCommentAnchor, function (i, elem) {
        bindDeleteButton($(elem));
    });

    DOMform.submit(async function (e) {
        e.preventDefault();

        let noErrors = true;

        let commentValue = null;

        try {
            commentValue = validateApi.isValidString(DOMcomment.val(), false);
            DOMcommentError.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMcommentError.text(e).show();
        }

        if (noErrors) {
            const addCommentRequest = {
                method: 'POST',
                url: window.location.href,
                contentType: 'application/json',
                data: JSON.stringify({ input_comment: commentValue }),
            };

            try {
                const result = await $.ajax(addCommentRequest);

                const DOMresult = $(result);
                const DOMdeleteCommentAnchor = DOMresult.find(
                    '.delete-comment-anchor'
                );
                bindDeleteButton(DOMdeleteCommentAnchor);

                DOMcomment.val('');
                DOMcomments.append(DOMresult);
                $('#comment-container > p').remove();
                DOMcommentError.text('').hide();
            } catch (e) {
                DOMcommentError.text(e.responseJSON?.errorMsg ?? e).show();
            }
        }
    });

    function bindDeleteButton(anchor) {
        anchor.on('click', async function (e) {
            e.preventDefault();

            const deleteCommentRequest = {
                method: 'DELETE',
                url: anchor.attr('href'),
                contentType: 'application/json',
                data: JSON.stringify({ isAjaxRequest: true }),
            };

            try {
                const result = await $.ajax(deleteCommentRequest);

                DOMcomment.val('');
                $(`#${result.deletedCommentId}`).remove();

                if ($('#comment-container').children().length < 1)
                    DOMcomments.append(
                        $('<p></p>')
                            .addClass('event-post italics')
                            .text('(No Comments)')
                    );
                DOMcommentError.text('').hide();
            } catch (e) {
                DOMcommentError.text(e.responseJSON?.errorMsg ?? e).show();
            }
        });
    }
})(window.jQuery);
