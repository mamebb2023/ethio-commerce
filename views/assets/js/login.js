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

    // if (firstName.length < 1 || lastName.length < 1) return $('#alert').html('Please enter a valid name');
    // if (password.length < 8) return $('#alert').html('Password must be atleast 8 characters');
    if (password !== confirmPwd) return $('#alert').html('Passwords does not match');

    $.fn.sendRequest({
      url: '/register',
      method: 'POST',
      data: {
        firstName, lastName, email, password,
      },
    }).done((response) => {
      if (!response.error) {
        $('#alert').hide();
        $('#success').show().html(response.msg);
        setTimeout(() => {
          window.location.href = response.redirectUrl;
        }, 2000);
      } else {
        $('#alert').show().html(response.error);
      }
    }).fail((err) => console.log(err));
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
      if (!response.error) {
        $('#alert').hide();
        $('#success').show().html(response.msg);
        setTimeout(() => {
          window.location.href = response.redirectUrl;
        }, 2000);
      } else {
        $('#alert').show().html(response.error);
      }
    }).fail((err) => console.log(err));
  });
});
