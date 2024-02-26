import './utils.js';

$(document).ready(() => {
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

  // Show header after some scroll
  $(window).on('scroll',() => {
    var pos = $(window).scrollTop();
   
    if (pos > 300) $('.quick-access').css('transform', 'translate(0, 0)');
    else $('.quick-access').css('transform', 'translate(0, -50px)');
  });

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
      $('#userName').append(`${response.firstName} ${response.lastName}`);
      $('#email').append(response.email);
      $('.user-actions').hide();
      $('.user-icon').show();

      const fullUrl = window.location.href;
      const parsedUrl = new URL(fullUrl);
      const url = parsedUrl.pathname + parsedUrl.search;
      if (url === '/login' || url === '/register') window.location.href = "/";

    }).fail(err => {
      $('.user-actions').show();
      $('.user-icon').hide();
    });
  });  
});
