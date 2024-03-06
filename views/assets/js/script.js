import './utils.js';

$(document).ready(() => {
  // Show header after some scroll
  $(window).on('scroll', () => {
    const pos = $(window).scrollTop();

    const fullUrl = window.location.href;
    const parsedUrl = new URL(fullUrl);

    let height;
    if (parsedUrl.pathname === "/") height = 300;
    else height = 100;

    if (pos > height) {
      $('.head-top').css('padding', '5px 30px');
      $('.head-top').css('width', '60%');
      $('.head-top').css('background', '#ffffff24');
      $('.head-top').css('backdrop-filter', 'blur(15px)');
    } else {
      $('.head-top').css('padding', '20px 60px');
      $('.head-top').css('width', '90%');
      $('.head-top').css('background', 'transparent');
      $('.head-top').css('backdrop-filter', 'blur(0px)');
    }
  });

  // Store the redirectUrl url in localStorage
  $(() => {
    const fullUrl = document.referrer || window.location.href;
    const parsedUrl = new URL(fullUrl);
    const forbidden = ['/login', '/register', '/admin'];
    if (forbidden.includes(parsedUrl.pathname)) {
      parsedUrl.pathname = '/';
    }
    const pathAndQuery = parsedUrl.pathname + parsedUrl.search;

    localStorage.setItem('redirectUrl', pathAndQuery);
  });

  // Get the user name and email in every request after verification
  $(() => {
    $.fn.sendRequest({
      url: '/verifyUser',
      method: 'POST',
    }).done((response) => {
      if (!response.error) {
        $('#userName').append(`${response.firstName}`);
        $('.first-name').append(response.firstName);
        $('.last-name').append(response.lastName);
        $('.email').append(response.email);
        $('.user-actions').hide();
        $('.user-icon').show();

        const fullUrl = window.location.href;
        const parsedUrl = new URL(fullUrl);
        const url = parsedUrl.pathname + parsedUrl.search;
        if (url === '/login' || url === '/register') window.location.href = '/';
      } else {
        console.log(response);
        $('.user-actions').show();
        $('.user-icon').hide();
        $('#addToCart').hide();
      }
    }).fail((err) => console.log(err));
  });

  // Get the cart items
  $(() => {
    $.fn.sendRequest({
      url: '/cart-items',
      method: 'GET',
    }).done((response) => {
      if (!response.error) {
        $('.cart-counter').html(response.total);
      } else {
        console.log(response);
      }
    }).fail((err) => console.log(err));
  });

  // Show item Details
  $('#items').on('click', '.details', function () {
    const clickedButton = $(this);
    const itemId = clickedButton.attr('data-item-id');

    $.fn.sendRequest({
      url: '/item-details',
      method: 'GET',
      data: { itemId },
    }).done((response) => {
      if (!response.error) {
        const data = response.item;

        const fullUrl = window.location.href;
        const parsedUrl = new URL(fullUrl);

        let imgUrl;
        if (parsedUrl.pathname === '/user/cart') {
          imgUrl = `../${data.itemImagePath}`;
        } else {
          imgUrl = data.itemImagePath;
        }

        const itemDetails = `
        <div id="itemDetailBox">
          <div class="item-details">
            <div class="item-img-name">
              <div class="item-img">
                <img src="${imgUrl}" alt="">
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
    }).fail((err) => console.log(err));
  });

  // Close item Details
  $('#close').on('click', () => {
    $('.item-detail-box').hide();
  });
});
