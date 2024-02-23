(function ($) {
  $.fn.sendRequest = function (options) {
    const { url, method = 'GET', data = {}, headers = {} } = options;

    // Get token from cookies and redirectUrl from localStorage, handling potential errors
    const token = document.cookie
      ?.split('; ')
      ?.find(cookie => cookie.startsWith('X-Token='))
      ?.split('=')[1];
    const redirectUrl = localStorage.getItem('redirectUrl');

    // Merge data and add redirectUrl if available
    const mergedData = redirectUrl ? { ...data, redirectUrl } : data;

    // Add token to headers if found
    if (token) {
      headers['X-Token'] = token;
    }

    return $.ajax({
      url,
      method,
      data: mergedData,
      beforeSend: function (xhr) {
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }
      },
    });
  };
})(jQuery);
