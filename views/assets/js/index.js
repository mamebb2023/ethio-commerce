import './utils.js';

$(document).ready(() => {
  // Get all items that are posted
  $(() => {
    $.fn.sendRequest({
      url: '/getItems',
      method: 'GET',
    }).done(data => {
      console.log(data);
      if (data.length > 0) {
        const items = data;
        items.forEach(item => {
          const itemTemplate = $(`
            <div class="item">
              <div class="item-img">
                <img id="itemImg" src="${item.itemImagePath}" alt="${item.itemName}">
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
                <button id="addToCart" class="add-to-cart" data-item-id="${item._id}"><i class='bx bx-plus'></i></button>
              </div>
            </div>
          `);
          $("#items").append(itemTemplate);
        });
      }
    })
    .fail(err => console.log(err));
  }); 

  // Add to cart system
  $("#items").on("click", ".add-to-cart", function() {
    const clickedButton = $(this);
    const itemId = clickedButton.attr('data-item-id');

    $.fn.sendRequest({
      url: '/cart',
      method: 'POST',
      data: { itemId },
    }).done(response => {
      if (!response.error){
        $('.cart-counter').html(response.total);
      } else {
        console.log(response);
      }
    }).fail(err => console.log(err));
  });

  // Show item Details
  $("#items").on("click", ".details", function () {
    const clickedButton = $(this);
    const itemId = clickedButton.attr('data-item-id');
    console.log(itemId);

    $.fn.sendRequest({
      url: '/item-details',
      method: 'GET',
      data: { itemId },
    }).done(response => {
      if (!response.error) {
        console.log(response);
        const data = response.item;
        const itemDetails = `
        <div id="itemDetailBox">
          <div class="item-details">
            <div class="item-img-name">
              <div class="item-img">
                <img src="${data.itemImagePath}" alt="">
              </div>
              <div>
                <div class="item-name">
                  <h1>${data.itemName}</h1>
                  <p>${data.miniDetail}</p>
                  <h3>${data.itemDetails}</h3>
                </div>
                <div class="item-price-btn">
                  <p>Birr ${data.itemPrice}</p>
                  <button id="buyItem">Buy</button>
                </div>
              </div>
              
            </div>
          </div>
        </div>`;
        $('.item-detail-box').show();
        $('.item-detail-row').html(itemDetails);
      } else {
      console.log(response);
    }
    }).fail(err => console.log(err));
  });

  // Close item Details
  $("#close").on("click", function () {
    console.log('hi');
    $(".item-detail-box").hide();
  });
});