(function ($) {
  $.fn.sendRequest = function (options) {
    const { url, method, data = {}, headers = {} } = options;

    // For every request, get the current url as
    const fullUrl = window.location.href;
    const parsedUrl = new URL(fullUrl);
    const newUrl = url || parsedUrl.pathname + parsedUrl.search;

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
      url: newUrl,
      method,
      data: mergedData,
      beforeSend: (xhr) => {
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }
      },
    });
  };
})(jQuery);
