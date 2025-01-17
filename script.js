
const API_KEY = "b682a762-eac5-4135-8703-7d7241a6d234";
const API_BASE_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api";

const productGrid = document.querySelector('.product-grid');
const notificationArea = document.querySelector('.notification-area');
const filterForm = document.querySelector('.sidebar form');
const searchInput = document.querySelector('.search-bar input');
const sortSelect = document.getElementById('sort');

let currentFilterParams = {};
let currentSortValue = 'popularity';

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

        const discountPrice = product.discount_price ? `<span class="price-old">${product.actual_price}</span>${product.discount_price} &#8381;` : `${product.actual_price} &#8381;`;

        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="rating"><span>${'★'.repeat(Math.round(product.rating))}</span> (${product.rating})</div>
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
    if (productGrid) {
        const products = await fetchProducts();
        renderProducts(products);
        await populateCategories();
        //  applyFiltersAndSort();
    }
}

// Загрузка товаров при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

//cart.html

const cartItemsContainer = document.querySelector('.cart-items');
const orderForm = document.querySelector('.order-form form');
const totalCostElement = document.querySelector('.total-cost');
const deliveryCostElement = document.querySelector('.delivery-cost');

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
    if (!cartItemsContainer) return
    cartItemsContainer.innerHTML = '';
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
        updateTotalCost();
        return;
    }

    for (const productId of cart) {
        const product = await fetchProductDetails(productId);
        if (product) {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            const discountPrice = product.discount_price ? `<span class="price-old">${product.actual_price}</span>${product.discount_price} &#8381;` : `${product.actual_price} &#8381;`;
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="rating"><span>${'★'.repeat(Math.round(product.rating))}</span> (${product.rating})</div>
                <div class="price">${discountPrice}</div>
                <button class="remove-from-cart" data-product-id="${product.id}">Удалить</button>
            `;
            cartItemsContainer.appendChild(productCard);
        }
    }
    addRemoveFromCartListeners();
    updateTotalCost();
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
    orderForm.addEventListener('change', updateTotalCost);
    updateTotalCost();
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

    window.location.href = 'index.html';
}

function convertDeliveryTime(deliveryTime) {
    switch (deliveryTime) {
        case 'morning': return '08:00-12:00';
        case 'afternoon': return '12:00-14:00';
        case 'afterafternoon': return '14:00-18:00';
        case 'evening': return '18:00-22:00';
        default: return '';
    }
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
}

function getDeliveryCost() {
    const deliveryDate = document.getElementById('delivery-date').value;
    const deliveryTime = document.getElementById('delivery-time').value;

    if (!deliveryDate || !deliveryTime) {
        return 200;
    }

    const date = new Date(deliveryDate);
    const dayOfWeek = date.getDay();
    let deliveryCost = 200;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        deliveryCost += 300;
    } else if (deliveryTime === 'evening') {
        deliveryCost += 200;
    }

    return deliveryCost;
}

async function updateTotalCost() {
    const cart = getCart();
    let totalCost = 0;

    if (cart.length > 0) {
        for (const productId of cart) {
            const product = await fetchProductDetails(productId);
            if (product) {
                totalCost += product.discount_price ? product.discount_price : product.actual_price;
            }
        }
    }
    const deliveryCost = getDeliveryCost();
    const total = totalCost + deliveryCost;
    if (totalCostElement) {
        totalCostElement.textContent = `Итоговая стоимость: ${total}  \u20BD`;
    }
    if (deliveryCostElement) {
        deliveryCostElement.textContent = `Стоимость доставки: ${deliveryCost} \u20BD`;
    }
}


// profile.html

const orderListTable = document.querySelector('.order-list table tbody');
const modalView = document.getElementById('modal-view');
const modalEdit = document.getElementById('modal-edit');
const modalDelete = document.getElementById('modal-delete');
const closeButtons = document.querySelectorAll('.close-button');

async function fetchOrders() {
    const url = `${API_BASE_URL}/orders?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                showNotification(`Ошибка загрузки заказов: ${errorData.error}`, 'error');
            } else {
                showNotification(`Ошибка загрузки заказов, статус: ${response.status}`, 'error');
            }
            return [];
        }
        return await response.json();
    } catch (error) {
        showNotification(`Ошибка сети: ${error.message}`, 'error');
        return [];
    }
}


async function renderOrders() {
    if (!orderListTable) return;
    orderListTable.innerHTML = '';
    const orders = await fetchOrders();
    if (orders && orders.length > 0) {
        for (const order of orders) {
            const row = document.createElement('tr');
            const date = new Date(order.created_at);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
            let orderGoodsInfo = 'нет данных'
            if (order.good_ids.length > 0) {
                orderGoodsInfo = await getOrderGoodsInfo(order.good_ids)
            }

            const totalPrice = orderGoodsInfo.reduce((sum, item) => {
                return sum + (item.discount_price ? item.discount_price : item.actual_price);
            }, 0);

            row.innerHTML = `
                <td>${order.id}</td>
                <td>${formattedDate}</td>
                <td>${orderGoodsInfo.map(item => item.name).join(', ')}</td>
                <td>${totalPrice}  \u20BD</td>
                 <td>${order.delivery_date}, ${order.delivery_interval}</td>
                <td>
                    <button class="view-order" data-order-id="${order.id}"><i class="fas fa-eye"></i></button>
                    <button class="edit-order" data-order-id="${order.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-order" data-order-id="${order.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            orderListTable.appendChild(row);
        }
        addOrderEventListeners();
    }
    else {
        orderListTable.innerHTML = '<tr><td colspan="6">Нет заказов</td></tr>';
    }
}

async function getOrderGoodsInfo(goodsIds) {
    const goodsInfo = [];
    for (const goodId of goodsIds) {
        const good = await fetchProductDetails(goodId);
        if (good) {
            goodsInfo.push(good);
        }
    }
    return goodsInfo;
}

function addOrderEventListeners() {
    const viewOrderButtons = document.querySelectorAll('.view-order');
    const editOrderButtons = document.querySelectorAll('.edit-order');
    const deleteOrderButtons = document.querySelectorAll('.delete-order');

    viewOrderButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const orderId = event.target.closest('button').getAttribute('data-order-id');
            openModal(modalView, orderId, 'view');
        });
    });
    editOrderButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const orderId = event.target.closest('button').getAttribute('data-order-id');
            openModal(modalEdit, orderId, 'edit');
        });
    });
    deleteOrderButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const orderId = event.target.closest('button').getAttribute('data-order-id');
            openModal(modalDelete, orderId, 'delete');
        });
    });
}

function openModal(modal, orderId, type) {
    modal.style.display = 'block';
    loadModalContent(modal, orderId, type);
}

function closeModal(modal) {
    modal.style.display = 'none';
}

closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const modal = event.target.closest('.modal');
        closeModal(modal);
    });
});

window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
}

async function loadModalContent(modal, orderId, type) {
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = '';
    try {
        const order = await fetchOrderDetails(orderId);
        if (order) {
            switch (type) {
                case 'view':
                    modalBody.innerHTML = await renderViewOrderModalContent(order);
                    break;
                case 'edit':
                    modalBody.innerHTML = await renderEditOrderModalContent(order);
                    modal.querySelector('.edit-order-form').addEventListener('submit', (event) => handleEditOrderSubmit(event, orderId));
                    break;
                case 'delete':
                    modalBody.innerHTML = renderDeleteOrderModalContent(orderId);
                    modal.querySelector('.confirm-delete').addEventListener('click', () => handleDeleteOrder(orderId));
                    modal.querySelector('.cancel-delete').addEventListener('click', () => closeModal(modal));
                    break;
            }
        }
    } catch (error) {
        modalBody.innerHTML = `<p>Ошибка загрузки данных: ${error.message}</p>`;
    }
}

async function fetchOrderDetails(orderId) {
    const url = `${API_BASE_URL}/orders/${orderId}?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                showNotification(`Ошибка загрузки заказа: ${errorData.error}`, 'error');
            } else {
                showNotification(`Ошибка загрузки заказа, статус: ${response.status}`, 'error');
            }
            return null;
        }
        return await response.json();
    } catch (error) {
        showNotification(`Ошибка сети: ${error.message}`, 'error');
        return null;
    }
}

async function renderViewOrderModalContent(order) {
    let orderGoodsInfo = 'нет данных'
    if (order.good_ids.length > 0) {
        orderGoodsInfo = await getOrderGoodsInfo(order.good_ids)
    }
    const totalPrice = orderGoodsInfo.reduce((sum, item) => {
        return sum + (item.discount_price ? item.discount_price : item.actual_price);
    }, 0);

    return `
        <p><strong>ID:</strong> ${order.id}</p>
        <p><strong>Имя:</strong> ${order.full_name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Телефон:</strong> ${order.phone}</p>
        <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
        <p><strong>Дата доставки:</strong> ${order.delivery_date}</p>
        <p><strong>Интервал доставки:</strong> ${order.delivery_interval}</p>
        <p><strong>Комментарий:</strong> ${order.comment || 'Нет комментария'}</p>
         <p><strong>Состав заказа:</strong> ${orderGoodsInfo.map(item => item.name).join(', ')}</p>
        <p><strong>Итоговая стоимость:</strong> ${totalPrice} \u20BD</p>
    `;
}

async function renderEditOrderModalContent(order) {

    const deliveryTime = convertDeliveryInterval(order.delivery_interval);
    const deliveryDateFormatted = formatDateForInput(order.delivery_date);
    return `
      <form class="edit-order-form">
          <div class="form-group">
              <label for="edit-name">Имя:</label>
              <input type="text" id="edit-name" value="${order.full_name}" required>
          </div>
          <div class="form-group">
              <label for="edit-email">Email:</label>
              <input type="email" id="edit-email" value="${order.email}" required>
          </div>
          <div class="form-group">
              <label for="edit-phone">Телефон:</label>
              <input type="text" id="edit-phone" value="${order.phone}" required>
          </div>
          <div class="form-group">
              <label for="edit-address">Адрес доставки:</label>
              <input type="text" id="edit-address" value="${order.delivery_address}" required>
          </div>
           <div class="form-group">
                <label for="edit-delivery-date">Дата доставки:</label>
                <input type="date" id="edit-delivery-date" value="${deliveryDateFormatted}" required>
            </div>
            <div class="form-group">
                <label for="edit-delivery-time">Временной интервал доставки:</label>
                <select id="edit-delivery-time">
                  <option value="morning" ${deliveryTime === 'morning' ? 'selected' : ''}>Утро (8:00 - 12:00)</option>
                  <option value="afternoon" ${deliveryTime === 'afternoon' ? 'selected' : ''}>День (12:00 - 14:00)</option>
                  <option value="afterafternoon" ${deliveryTime === 'afterafternoon' ? 'selected' : ''}>Полдник (14:00 - 18:00)</option>
                  <option value="evening" ${deliveryTime === 'evening' ? 'selected' : ''}>Вечер (18:00 - 22:00)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-comment">Комментарий к заказу:</label>
                <textarea id="edit-comment">${order.comment || ''}</textarea>
            </div>
          <button type="submit">Сохранить</button>
      </form>
    `;
}

function renderDeleteOrderModalContent(orderId) {
    return `
        <p>Вы действительно хотите удалить заказ?</p>
        <button class="confirm-delete" data-order-id="${orderId}">Удалить</button>
        <button class="cancel-delete">Отмена</button>
    `;
}

async function handleEditOrderSubmit(event, orderId) {
    event.preventDefault();
    const fullName = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const deliveryAddress = document.getElementById('edit-address').value;
    const deliveryDate = document.getElementById('edit-delivery-date').value;
    const deliveryTime = document.getElementById('edit-delivery-time').value;
    const comment = document.getElementById('edit-comment').value;

    const deliveryInterval = convertDeliveryTime(deliveryTime)
    const deliveryDateFormatted = formatDate(deliveryDate)

    const updatedOrderData = {
        full_name: fullName,
        email: email,
        phone: phone,
        delivery_address: deliveryAddress,
        delivery_date: deliveryDateFormatted,
        delivery_interval: deliveryInterval,
        comment: comment
    };
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedOrderData)
        });

        if (response.ok) {
            showNotification('Заказ успешно изменен', 'success');
            closeModal(modalEdit);
            renderOrders();
        } else {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                showNotification(`Ошибка редактирования заказа: ${errorData.error}`, 'error');
            } else {
                showNotification(`Ошибка редактирования заказа, статус: ${response.status}`, 'error');
            }
        }
    } catch (error) {
        showNotification(`Ошибка сети: ${error.message}`, 'error');
    }
}

async function handleDeleteOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showNotification('Заказ успешно удален', 'success');
            closeModal(modalDelete);
            renderOrders();
        }
        else {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                showNotification(`Ошибка удаления заказа: ${errorData.error}`, 'error');
            } else {
                showNotification(`Ошибка удаления заказа, статус: ${response.status}`, 'error');
            }
        }
    }
    catch (error) {
        showNotification(`Ошибка сети: ${error.message}`, 'error');
    }
}

function convertDeliveryInterval(deliveryInterval) {
    switch (deliveryInterval) {
        case '08:00-12:00': return 'morning';
        case '12:00-14:00': return 'afternoon';
        case '14:00-18:00': return 'afterafternoon';
        case '18:00-22:00': return 'evening';
        default: return '';
    }
}

function formatDateForInput(dateString) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
}


async function populateCategories() {
    const products = await fetchProducts();
    if (products && products.length > 0) {
        const categoriesSet = new Set(products.map(product => product.main_category));
        const categoriesContainer = document.querySelector('.filter-section h4').parentNode;
        categoriesSet.forEach(category => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="category" value="${category}">${category}<br>`;
            categoriesContainer.appendChild(label);
        });
    }
}

if (filterForm) {
    filterForm.addEventListener('submit', handleFilterSubmit);
}

async function handleFilterSubmit(event) {
    event.preventDefault();
    const formData = new FormData(filterForm);
    const params = {};

    const selectedCategories = formData.getAll('category');
    if (selectedCategories.length > 0) {
        params.category = selectedCategories;
    }

    const priceMin = formData.get('price_min');
    if (priceMin) {
        params.price_min = priceMin;
    }
    const priceMax = formData.get('price_max');
    if (priceMax) {
        params.price_max = priceMax;
    }

    const discounted = formData.get('discounted');
    if (discounted) {
        params.discounted = true;
    }

    currentFilterParams = params;

    applyFiltersAndSort();
}

async function fetchFilteredProducts(filterParams = {}) {
    let products = await fetchProducts();
    if (products && products.length > 0) {

        if (filterParams.category) {
            products = products.filter(product => filterParams.category.includes(product.main_category));
        }

        if (filterParams.price_min) {
            products = products.filter(product => {
                const price = product.discount_price ? product.discount_price : product.actual_price;
                return price >= parseFloat(filterParams.price_min);
            });
        }
        if (filterParams.price_max) {
            products = products.filter(product => {
                const price = product.discount_price ? product.discount_price : product.actual_price;
                return price <= parseFloat(filterParams.price_max);
            });
        }

        if (filterParams.discounted) {
            products = products.filter(product => product.discount_price);
        }
    }
    return products;
}

if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
}

async function handleSearch(event) {
    const query = event.target.value.trim();
    if (query) {
        const params = {
            query: query
        };
        const searchedProducts = await fetchProducts(params);
        renderProducts(searchedProducts);
    }
    else {
        applyFiltersAndSort();
    }
}

if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
}

async function handleSortChange(event) {
    currentSortValue = event.target.value;
    applyFiltersAndSort();
}

async function fetchAndSortProducts(sortValue, products) {
    if (products && products.length > 0) {
        switch (sortValue) {
            case 'popularity':
                // в API нет параметра сортировки по популярности, поэтому сортировка не будет происходить
                break;
            case 'price_asc':
                products.sort((a, b) => {
                    const priceA = a.discount_price ? a.discount_price : a.actual_price;
                    const priceB = b.discount_price ? b.discount_price : b.actual_price;
                    return priceA - priceB;
                });
                break;
            case 'price_desc':
                products.sort((a, b) => {
                    const priceA = a.discount_price ? a.discount_price : a.actual_price;
                    const priceB = b.discount_price ? b.discount_price : b.actual_price;
                    return priceB - priceA;
                });
                break;
            case 'rating':
                products.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }
    }
    return products;
}

async function applyFiltersAndSort() {
    let filteredProducts = await fetchFilteredProducts(currentFilterParams);
    const sortedProducts = await fetchAndSortProducts(currentSortValue, filteredProducts);
    renderProducts(sortedProducts);
}
if (document.querySelector('.profile-page')) {
    document.addEventListener('DOMContentLoaded', renderOrders);
}


