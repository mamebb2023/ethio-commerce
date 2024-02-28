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
                <button id="details" class="details">details...</button>
                <button id="addToCart" class="add-to-cart" data-item-id="${item._id.toString()}"><i class='bx bx-plus'></i></button>
              </div>
            </div>
          `);

          // Optional: add click/event handlers here for individual buttons within the item
          
          $("#items").append(itemTemplate);
        });
      }
    })
    .fail(err => console.log(err));
  });
});