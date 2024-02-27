import './utils.js';

$(document).ready(() => {
  // Test bakend status (redis and mongoDB) and display database info
  $(() => {
    $.fn.sendRequest({
      url: '/status',
      method: 'GET',
    }).done((response) => {
      const redis = `${response.redis ? '<span class="green">Connected</span>' : '<span class="red">Disconnected</span>'}`;
      const db = `${response.db ? '<span class="green">Connected</span>' : '<span class="red">Disconnected</span>'}`;
      $('#users').append(`<span class="green">${response.users}</span>`);
      $('#items').append(`<span class="green">${response.items}</span>`);
      $('#redis').append(redis);
      $('#db').append(db);
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
        $('.alert').html('Please select an image less than 1 MB.');
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
  $("#postItem").submit(async function(event) {
    event.preventDefault();

    const itemPrice = $("#itemPrice").val();
    const itemName = $("#itemName").val();
    const itemDetail = $("#itemDetail").val();
    const miniDetail = $("#miniDetail").val();
    const itemImg = document.getElementById("itemImg").files[0];

    const formData = { itemName, itemPrice, miniDetail, itemDetail, itemImg };
    // formData.append("itemPrice", itemPrice);
    // formData.append("itemName", itemName);
    // formData.append("miniDetail", miniDetail);
    // formData.append("itemDetail", itemDetail);
    // formData.append("itemImg", itemImg);
    console.log(formData);

    try {
      const response = await $.fn.sendRequest({
        url: "/postItem", // Replace with your backend endpoint
        method: "POST",
        data: formData,
        processData: false, // Prevent jQuery from processing data
        contentType: false, // Allow browser to set content type
        cache: false,
        enctype: "multipart/form-data"
      });

      console.log(response); // Or display a success message to the user

    } catch (error) {
      console.error(error); // Or display an error message to the user
    }
  });
});