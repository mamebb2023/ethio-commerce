$(document).ready(() => {
  // test backend
  $.ajax({
      url: '/status',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        let message = '<br>Backend connection status:';
        message += '<br> - Redis: ' + (data.redis ? 'Connected' : 'Disconnected');
        message += '<br> - Database: ' + (data.db ? 'Connected' : 'Disconnected');
        $('#status').html(message);
      },
      error: function(status, error) {
        $('#status').html('Error fetching data: ' + status + ' ' + error);
      }
  });
});
