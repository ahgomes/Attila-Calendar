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
                const result = await $.ajax(addCommentRequest);

                const DOMresult = $(result);
                const DOMdeleteCommentAnchor = DOMresult.find(
                    '.delete-comment-anchor'
                );
                bindDeleteButton(DOMdeleteCommentAnchor);

                DOMcomment.val('');
                DOMcomments.append(DOMresult);
                $('#comment-container > p').remove();
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
            };

            try {
                const result = await $.ajax(deleteCommentRequest);

                DOMcomment.val('');
                $(`#${result.deleteCommentId}`).remove();

                if ($('#comment-container').children().length < 1)
                    DOMcomments.append(
                        $('<p></p>')
                            .addClass('event-post italics')
                            .text('(No Comments)')
                    );
            } catch (e) {
                DOMcommentError.text(e.responseJSON.errorMsg).show();
            }
        });
    }
})(window.jQuery);
