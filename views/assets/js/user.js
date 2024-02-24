import './utils.js';

$(document).ready(() => {
    $('#logout').click(async (e) => {
        e.preventDefault();

        $.fn.sendRequest({
            url: '/logout',
            method: 'POST'
        }).done(response => {
            $('#userNotif').show();
            setTimeout(() => {
                window.location.href = response.redirectUrl;
            }, 2500);
        }).fail(err => {
            console.log(err);
        });
    });
});
