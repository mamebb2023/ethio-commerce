$(document).ready(() => {
  // test backend
  $.ajax({
      url: '/status',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        let message = 'Backend connection status:';
        message += '<br> - Redis: ' + (data.redis ? 'Connected' : 'Disconnected');
        message += '<br> - Database: ' + (data.db ? 'Connected' : 'Disconnected');
        $('#status').html(message);
      },
      error: function(status, error) {
        $('#status').html('Error fetching data: ' + status + ' ' + error);
      }
  });

  const makeRequest = async (options) => {
    const token = localStorage.getItem('X-Token');
    if (token) {
      options.headers = {
        ...options.headers,
        'X-Token': `${token}`,
      }
    }

    try {
      const response = await $.ajax(options);
      return { response, token };
    } catch (error) {
      return error;
    }
  }

  $('#register-form').submit(async (e) => {
    e.preventDefault();
  });

  // if user is logged in
  $('#login-form').submit(async (e) => {
    e.preventDefault();
  
    // Sanitize user input (replace with appropriate validation)
    const email = $('#email').val();
    const password = $('#password').val();
  
    try {
      const { response, token } = await makeRequest({
        url: '/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
      });

      if (response.error) {
        throw new Error(response.error);
      }
      if (token === null) {
        localStorage.setItem('X-Token', response.token);
      }
      console.log(localStorage.getItem('X-Token'));
    } catch (err) {
      $('.alert').text(err.responseJSON.error);
    }
  });
});
