
const API_KEY = "b682a762-eac5-4135-8703-7d7241a6d234";
const API_BASE_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api";

const productGrid = document.querySelector('.product-grid');
const notificationArea = document.querySelector('.notification-area');

function showNotification(message, type = 'success') {
    notificationArea.textContent = message;
    notificationArea.classList.add('active', type);
    setTimeout(() => {
        notificationArea.classList.remove('active', type);
    }, 3000);
}

async function fetchProducts(params = {}) {
  const urlParams = new URLSearchParams({ api_key: API_KEY, ...params });
  const url = `${API_BASE_URL}/goods?${urlParams}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                showNotification(`Ошибка загрузки товаров: ${errorData.error}`, 'error');
            } else {
                showNotification(`Ошибка загрузки товаров, статус: ${response.status}`, 'error');
            }
           return [];
        }
         return await response.json();
      }
    catch (error) {
      showNotification(`Ошибка сети: ${error.message}`, 'error');
      return [];
    }
}

function renderProducts(products) {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        const discountPrice = product.discount_price ? `<span class="price-old">${product.actual_price}</span>${product.discount_price}` : `${product.actual_price}`;

        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="rating">${'★'.repeat(Math.round(product.rating))}</div>
            <div class="price">${discountPrice}</div>
            <button class="add-to-cart" data-product-id="${product.id}">Добавить в корзину</button>
        `;

        productGrid.appendChild(productCard);
    });
     addCartEventListeners();
}

function addCartEventListeners() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
        const productId = parseInt(event.target.getAttribute('data-product-id'), 10);
        addToCart(productId);
        showNotification('Товар добавлен в корзину', 'success');
    });
   });
}

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const cart = getCart();
    if (!cart.includes(productId)) {
        cart.push(productId);
        saveCart(cart);
    }
}

async function init() {
  const products = await fetchProducts();
  renderProducts(products);
}

// Загрузка товаров при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

//cart.html

const cartItemsContainer = document.querySelector('.cart-items');
const orderForm = document.querySelector('.order-form form');

async function fetchProductDetails(productId) {
  const url = `${API_BASE_URL}/goods/${productId}?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            showNotification(`Ошибка загрузки товара: ${errorData.error}`, 'error');
          } else {
            showNotification(`Ошибка загрузки товара, статус: ${response.status}`, 'error');
          }
             return null;
        }
         return await response.json();
      }
  catch (error) {
        showNotification(`Ошибка сети: ${error.message}`, 'error');
        return null;
    }
}

async function renderCart() {
    cartItemsContainer.innerHTML = '';
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
        return;
    }

    for (const productId of cart) {
        const product = await fetchProductDetails(productId);
        if (product) {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

          const discountPrice = product.discount_price ? `<span class="price-old">${product.actual_price}</span>${product.discount_price}` : `${product.actual_price}`;

            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="rating">${'★'.repeat(Math.round(product.rating))}</div>
                <div class="price">${discountPrice}</div>
                <button class="remove-from-cart" data-product-id="${product.id}">Удалить</button>
            `;
            cartItemsContainer.appendChild(productCard);
         }
    }
  addRemoveFromCartListeners();
}

function addRemoveFromCartListeners() {
    const removeFromCartButtons = document.querySelectorAll('.remove-from-cart');
    removeFromCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.getAttribute('data-product-id'), 10);
           removeFromCart(productId);
           renderCart();
        });
    });
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(id => id !== productId);
    saveCart(updatedCart);
  showNotification('Товар удален из корзины', 'success');
}

if (document.querySelector('.cart-page')) {
  document.addEventListener('DOMContentLoaded', renderCart);
  orderForm.addEventListener('submit', handleOrderSubmit);
}

async function handleOrderSubmit(event) {
    event.preventDefault();

    const fullName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subscribe = document.querySelector('input[name="subscribe"]').checked;
    const deliveryAddress = document.getElementById('address').value;
    const deliveryDate = document.getElementById('delivery-date').value;
    const deliveryTime = document.getElementById('delivery-time').value;
    const comment = document.getElementById('comment').value;
    const cart = getCart();


  if (!fullName || !email || !phone || !deliveryAddress || !deliveryDate || !deliveryTime || cart.length === 0) {
      showNotification('Заполните все обязательные поля и добавьте товары в корзину.', 'error');
      return;
    }

    const deliveryInterval = convertDeliveryTime(deliveryTime)
    const deliveryDateFormatted = formatDate(deliveryDate)

    const orderData = {
        full_name: fullName,
        email: email,
        phone: phone,
        subscribe: subscribe ? 1 : 0,
        delivery_address: deliveryAddress,
        delivery_date: deliveryDateFormatted,
        delivery_interval: deliveryInterval,
        comment: comment,
        good_ids: cart
    };
    try {
        const response = await fetch(`${API_BASE_URL}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            showNotification('Заказ успешно оформлен!', 'success');
           localStorage.removeItem('cart');
           cartItemsContainer.innerHTML = '<p class="empty-cart-message">Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
           orderForm.reset();
        } else {
            const errorData = await response.json();
             if (errorData && errorData.error) {
                showNotification(`Ошибка оформления заказа: ${errorData.error}`, 'error');
              }
               else {
                  showNotification(`Ошибка оформления заказа, статус: ${response.status}`, 'error');
              }
        }
    } catch (error) {
         showNotification(`Ошибка сети: ${error.message}`, 'error');
    }
}

function convertDeliveryTime(deliveryTime) {
     switch (deliveryTime) {
        case 'morning': return '08:00-12:00';
        case 'afternoon': return '12:00-14:00';
         case 'evening': return '18:00-22:00';
        default: return '';
    }
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
     return `${day}.${month}.${year}`;
 }
