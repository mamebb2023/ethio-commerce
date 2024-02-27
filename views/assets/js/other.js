import './utils.js';

$(document).ready(() => {
  // Test bakend status (redis and mongoDB)
  $(() => {
    $.fn.sendRequest({
      url: '/status',
      method: 'GET',
    }).done((response) => {
      let message = 'Backend connection status:';
      message += `<br> - Redis: ${response.redis ? 'Connected' : 'Disconnected'}`;
      message += `<br> - Database: ${response.db ? 'Connected' : 'Disconnected'}`;
      $('#status').html(message);
    }).fail((error) => {
      console.log(error);
    });
  });

  // Display item image
  $("#itemImg").on('change', function(e) {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const fileSize = file.size;
      const maxSize = 1024 * 1024; // 1 Megabyte

      if (fileSize > maxSize) {
        $('.alert').html('Error: Please select an image less than 1 MB.');
        $(this).val(''); // Clear the file selection
        return;
      }

      var reader = new FileReader();

      reader.onload = function(e) {
        var img = document.createElement('img');
        img.src = e.target.result;
        $("#display-image").empty(); // Clear previous image (if any)
        $("#display-image").append(img);
      };

      reader.readAsDataURL(this.files[0]);
    }
  });

  // Post an item
  $('#postItem').submit(async (e) => {
    e.preventDefault();

    const itemImg = $('#itemImg').val();
    const itemName = $('#itemName').val();
    const itemPrice = $('#itemPrice').val();
    const miniDetail = $('#miniDetail').val();
    const itemDetail = $('#itemDetail').val();
    if (!itemImg || !itemName || itemPrice || !miniDetail || itemDetail) {
      $('.alert').html('All inputs are required');
    }

    $.fn.sendRequest({
      url: '/postItem',
      method: 'POST',
      data: { itemImg, itemName, itemPrice, miniDetail, itemDetail },
    }).done(response => console.log(response))
    .fail(err => console.log(err));
  });
});