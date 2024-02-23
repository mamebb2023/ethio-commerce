import './utils.js';

$(document).ready(function() {
  // Store the referrer url in localStorage
  $(function () {
    const fullUrl = document.referrer || window.location.href;
    const parsedUrl = new URL(fullUrl);
    if (parsedUrl.pathname === '/login' || parsedUrl.pathname === '/register') {
      parsedUrl.pathname = '/';
    }
    const pathAndQuery = parsedUrl.pathname + parsedUrl.search;

    localStorage.setItem('redirectUrl', pathAndQuery);
  });

  // Test bakend redis and mongoDB
  $.fn.sendRequest({
    url: '/status',
    method: 'GET',
  }).done(response => {
    let message = '<br>Backend connection status:';
    message += '<br> - Redis: ' + (response.redis ? 'Connected' : 'Disconnected');
    message += '<br> - Database: ' + (response.db ? 'Connected' : 'Disconnected');
    $('#status').html(message);
  }).fail(error => {
    console.log(error);
  });

  // set redirectUrl in the localStorage
});
