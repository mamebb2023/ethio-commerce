import './utils.js';

$(document).ready(() => {
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
    const forbidden = ['/login', '/register', '/admin'];
    if (forbidden.includes(parsedUrl.pathname)) {
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

  // Get the cart items
  $(() => {
    $.fn.sendRequest({
      url: '/cart',
      method: 'GET',
    }).done(response => {
      console.log(response);
      $('.cart-counter').html(response.total);
    })
    .fail(err => console.log(err));
  });
});
