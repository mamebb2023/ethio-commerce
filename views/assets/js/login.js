import './utils.js';

$(document).ready(() => {
  // Registration Form
  $('#register-form').submit(async (e) => {
    e.preventDefault();

    // Sanitize user input with appropriate validation
    const firstName = $('#firstName').val();
    const lastName = $('#lastName').val();
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPwd = $('#confirmPwd').val();

    if (password !== confirmPwd) {
      $('#alert').html('Passwords does not match');
      return;
    }

    $.fn.sendRequest({
      url: '/register',
      method: 'POST',
      data: {
        firstName, lastName, email, password,
      },
    }).done((response) => {
      $('#success').show().html(response.msg);
      $('#alert').hide();
      setTimeout(() => {
        window.location.href = response.redirectUrl;
      }, 2000);
    }).fail((err) => {
      $('#alert').show().html(err.responseJSON.error);
    });
  });

  // Login Form
  $('#login-form').submit(async (e) => {
    e.preventDefault();

    // Sanitize user input with appropriate validation
    const email = $('#email').val();
    const password = $('#password').val();

    // Send request with Authorization header
    $.fn.sendRequest({
      url: '/login',
      method: 'POST',
      data: { email, password },
    }).done((response) => {
      $('#alert').hide();
      $('#success').show().html(response.msg);
      console.log(response.token);
      setTimeout(() => {
        window.location.href = response.redirectUrl;
      }, 2000);
    }).fail((err) => {
      $('#alert').show().html(err.responseJSON.error);
    });
  });
});
