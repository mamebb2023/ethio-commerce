$(document).ready(() => {
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
    // Registration Form
    $('#register-form').submit(async (e) => {
      e.preventDefault();
    });
  
    // Login Form
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
        console.log(response)
  
        if (response.error) {
          throw new Error(response.error);
        }
        if (token === null) {
        localStorage.setItem('X-Token', response.token);
        }
        window.location.href = response.redirectUrl;
      } catch (err) {
        $('.alert').text(err.responseJSON.error);
      }
    });
});
  