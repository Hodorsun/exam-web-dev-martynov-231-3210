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
    productGrid.innerHTML = ''; // Очищаем предыдущие результаты
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
}

async function init() {
  const products = await fetchProducts();
  renderProducts(products);
}

// Загрузка товаров при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
