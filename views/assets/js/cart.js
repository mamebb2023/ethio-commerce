import './utils.js';

$(document).ready(() => {
  // Get User's Cart Items
  $(() => {
    $.fn.sendRequest({
        url: '/cart',
        method: 'GET'
    }).done((data) => {
      if (data.length > 0) {
        console.log(data);
        const items = data;
        items.forEach(item => {
          const itemTemplate = $(`
          <div class="item-box">
            <p id="itemQuantity">${item.itemQuantity}</p>
              <div class="item">
                <div class="item-img">
                  <img id="itemImg" src="../${item.itemImagePath}" alt="${item.itemName}">
                </div>
                <div class="item-details">
                  <h3 id="itemName">${item.itemName}</h3>
                  <p id="itemDetails">${item.miniDetail}</p>
                  <div class="price">
                    <span id="canceledPrice" class="canceled">Birr ${parseInt(item.itemPrice) + Math.floor(Math.random() * (2000 - 100 + 1)) + 100}</span>
                    <span id="price" class="price">Birr ${item.itemPrice}</span>
                  </div>
                </div>
                <div class="item-btn">
                  <button id="details" class="details" data-item-id="${item._id}">details...</button>
                  <button class="remove-from-cart" data-item-id="${item._id}"><i class='bx bx-x'></i></button>
                </div>
              </div>
            </div>`);
          $("#items").append(itemTemplate);
        });
        $("#buyItems").show();
      } else {
        $(".alert").html(data.msg || 'No items in cart !');
        console.log(data);
      }
    }).fail((err) => console.log(err));
  });

  $('#items').on('click', '.remove-from-cart', function () {
    const clickedButton = $(this);
    const itemId = clickedButton.attr('data-item-id');

    $.fn.sendRequest({
      url: '/remove-cart',
      method: 'POST',
      data: { itemId }
    }).done(response => {
      if (!response.error) {
        console.log(response);
        window.location.reload();
      } else {
        console.log(response);
      }
    }).fail((err) => console.log(err));
  });
});
