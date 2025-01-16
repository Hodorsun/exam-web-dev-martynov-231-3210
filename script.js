document.addEventListener('DOMContentLoaded', function () {
    const viewButtons = document.querySelectorAll('.view-order');
    const editButtons = document.querySelectorAll('.edit-order');
    const deleteButtons = document.querySelectorAll('.delete-order');
    const modalView = document.getElementById('modal-view');
    const modalEdit = document.getElementById('modal-edit');
    const modalDelete = document.getElementById('modal-delete');
    const closeButtons = document.querySelectorAll('.close-button');
    const confirmDeleteBtn = document.querySelector('.confirm-delete');
    const cancelDeleteBtn = document.querySelector('.cancel-delete');
    let currentOrderId;

    viewButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentOrderId = this.getAttribute('data-order-id');
            modalView.style.display = 'block';
            const modalBody = modalView.querySelector('.modal-body');
            modalBody.innerHTML = `<p>Информация о заказе №${currentOrderId}: </p><p>Описание заказа: ... </p>`;
        });
    });
    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentOrderId = this.getAttribute('data-order-id');
            modalEdit.style.display = 'block';
            const modalBody = modalEdit.querySelector('.modal-body');
            modalBody.innerHTML = `<form><div class="form-group">
          <label for="new-date">Новая дата доставки</label>
          <input type="date" id="new-date">
          </div><div class="form-group"><label for="new-time">Новое время доставки</label>
            <select id="new-time">
            <option value="morning">Утро (9:00 - 12:00)</option>
                <option value="afternoon">День (12:00 - 16:00)</option>
              <option value="evening">Вечер (16:00 - 20:00)</option>
              </select></div>
               <button type="submit">Сохранить</button>
          </form>`;
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentOrderId = this.getAttribute('data-order-id');
            modalDelete.style.display = 'block';
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            modalView.style.display = 'none';
            modalEdit.style.display = 'none';
            modalDelete.style.display = 'none';
        });
    });

    window.onclick = function (event) {
        if (event.target === modalView || event.target === modalEdit || event.target === modalDelete) {
            modalView.style.display = "none";
            modalEdit.style.display = "none";
            modalDelete.style.display = "none";
        }
    };
    confirmDeleteBtn.addEventListener('click', function () {
        alert(`Заказ ${currentOrderId} удален`);
        modalDelete.style.display = 'none';
    });
    cancelDeleteBtn.addEventListener('click', function () {
        modalDelete.style.display = 'none';
    })
});
