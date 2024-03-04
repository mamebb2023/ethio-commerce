import './utils.js';

$(document).ready(() => {
  // Test bakend status (redis and mongoDB) and display database info
  $(() => {
    $.fn.sendRequest({
      url: '/status',
      method: 'GET',
    }).done((response) => {
      console.log(response);
      const redis = `${response.status.redis ? '<span class="green">Connected</span>' : '<span class="red">Disconnected</span>'}`;
      const db = `${response.status.db ? '<span class="green">Connected</span>' : '<span class="red">Disconnected</span>'}`;
      $('#totalUsers').append(`<span class="green">${response.status.nbUsers}</span>`);
      $('#totalItems').append(`<span class="green">${response.status.nbItems}</span>`);
      $('#redis').append(redis);
      $('#db').append(db);
    }).fail((error) => console.log(error));
  });

  // Display item image
  $("#item-image").on('change', function(e) {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const fileSize = file.size;
      const maxSize = 1024 * 1024; // 1 Megabyte

      if (fileSize > maxSize) {
        $('.alert').show().html('Please select an image less than 1 MB.');
        $(this).val(''); // Clear the file selection
        return;
      }

      var reader = new FileReader();

      reader.onload = function(e) {
        var img = document.createElement('img');
        img.src = e.target.result;
        $("#display-image").empty();
        $("#display-image").append(img);
      };

      reader.readAsDataURL(this.files[0]);
    }
  });

  // Post an item
  $("#item-form").submit(async (e) => {
    e.preventDefault();

    const itemName = $('#item-name').val();
    const itemPrice = $('#item-price').val();
    const miniDetail = $('#mini-detail').val();
    const itemDetails = $('#item-details').val();
    const itemImg = document.getElementById('item-image').files[0];

    if (!itemName || !itemPrice || !miniDetail || !itemDetails || !itemImg) {
      $('.alert').show().html('All inputs are required');
      return;
    }

    const formData = new FormData(document.getElementById("item-form"));
    console.log(formData);

    try {
      const response = await fetch("/post-item", {
        method: "POST",
        body: formData
      });

      const data = await response.json(); // Parse response as JSON
      $('.msg').show().html(data.msg);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error); // Or display an error message
    }
  });
});