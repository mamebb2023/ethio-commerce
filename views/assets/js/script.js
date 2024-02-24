import './utils.js';

$(document).ready(() => {
  // Store the redirectUrl url in localStorage
  $(() => {
    const fullUrl = document.referrer || window.location.href;
    const parsedUrl = new URL(fullUrl);
    if (parsedUrl.pathname === '/login' || parsedUrl.pathname === '/register') {
      parsedUrl.pathname = '/';
    }
    const pathAndQuery = parsedUrl.pathname + parsedUrl.search;

    localStorage.setItem('redirectUrl', pathAndQuery);
  });

  // Get the user name and email in every request after verification
  $(() => {
    $.fn.sendRequest({
      url: '/verifyUser',
      method: 'POST',
    }).done(response => {
      console.log(response);
      $('#userName').append(`${response.firstName} ${response.lastName}`);
      $('#email').append(response.email);
      $('#user-actions').hide();
      $('#userIcon').show();
    }).fail(err => {
      console.log(err);
      $('#user-actions').show();
      $('#userIcon').hide();
    });
  });

  // Test bakend status (redis and mongoDB)
  $(() => {
    $.fn.sendRequest({
      url: '/status',
      method: 'GET',
    }).done((response) => {
      let message = '<br>Backend connection status:';
      message += `<br> - Redis: ${response.redis ? 'Connected' : 'Disconnected'}`;
      message += `<br> - Database: ${response.db ? 'Connected' : 'Disconnected'}`;
      $('#status').html(message);
    }).fail((error) => {
      console.log(error);
    });
  });
});
