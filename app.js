// ===== Настройки: поменяйте почту на свою =====
const ORDER_EMAIL = "your@email.com";

const PRODUCTS = [
  {slug:"drakon", name:"Дракон Эмбер", price:24, height:14, material:"PLA, смола", desc:"Сидящий дракон с расправленными крыльями. Видны слои печати — так и задумано."},
  {slug:"rytsar", name:"Рыцарь с щитом", price:19, height:12, material:"смола", desc:"Рыцарь в шлеме для настольных игр. Печатается без поддержек, поэтому гладкий."},
  {slug:"robot", name:"Робот Бип", price:15, height:10, material:"PLA", desc:"Маленький робот на подставке. Руки подвижные, собираются без клея."},
  {slug:"kot", name:"Кот Мурзик", price:12, height:8, material:"PLA", desc:"Кот, который сидит и смотрит на вас. Хорошо смотрится на мониторе."},
  {slug:"gnom", name:"Гном-грибник", price:14, height:9, material:"смола", desc:"Гном в колпаке-грибе. Подойдёт для террариума или книжной полки."},
  {slug:"sova", name:"Сова-хранитель", price:17, height:11, material:"PLA, смола", desc:"Сова с большими глазами. Сидит на ветке и охраняет рабочий стол."},
];
const $ = s => document.querySelector(s);
const bySlug = Object.fromEntries(PRODUCTS.map(p => [p.slug, p]));

let cart = {};
try { cart = JSON.parse(localStorage.getItem("cart") || "{}"); } catch (e) {}
const save = () => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {} $("#count").textContent = Object.values(cart).reduce((a, b) => a + b, 0); };

function renderCatalog() {
  $("#catalog").innerHTML = PRODUCTS.map(p => `
    <button class="item" data-slug="${p.slug}">
      <img src="img/${p.slug}.svg" alt="${p.name}" loading="lazy">
      <span class="name">${p.name}</span><span class="price">${p.price} €</span>
    </button>`).join("");
}

function openProduct(slug) {
  const p = bySlug[slug];
  $("#product-body").innerHTML = `
    <section class="detail">
      <img src="img/${p.slug}.svg" alt="${p.name}">
      <div><h1 style="font-size:32px">${p.name}</h1>
        <p class="price big">${p.price} €</p><p>${p.desc}</p>
        <dl><dt>Высота</dt><dd>${p.height} см</dd><dt>Материал</dt><dd>${p.material}</dd></dl>
        <button class="btn" data-add="${p.slug}">Добавить в корзину</button></div>
    </section>`;
  $("#product-dlg").showModal();
}

function renderCart(done) {
  const items = Object.entries(cart).filter(([s]) => bySlug[s]);
  let html = "<h1 style='font-size:32px'>Корзина</h1>";
  if (done) html += "<p class='ok'>Открылось письмо с заказом. Отправьте его, и мы свяжемся с вами.</p>";
  if (!items.length) { $("#cart-body").innerHTML = html + "<p>Корзина пуста. Выберите фигурку в каталоге.</p>"; return; }
  const total = items.reduce((t, [s, q]) => t + bySlug[s].price * q, 0);
  html += "<table class='cart'>" + items.map(([s, q]) => `
    <tr><td><img src="img/${s}.svg" alt=""></td><td>${bySlug[s].name}</td>
    <td>${q} × ${bySlug[s].price} €</td><td>${q * bySlug[s].price} €</td>
    <td><button class="link" data-remove="${s}">Удалить</button></td></tr>`).join("") + "</table>";
  html += `<p class="total">Итого: ${total} €</p>
    <form class="form" id="order-form">
      <label>Имя<input name="name" required></label>
      <label>Телефон или e-mail<input name="contact" required></label>
      <label>Адрес доставки<textarea name="address" rows="3" required></textarea></label>
      <button class="btn">Заказать (оплата при получении)</button>
    </form>`;
  $("#cart-body").innerHTML = html;
}

function sendOrder(form) {
  const f = new FormData(form);
  const lines = Object.entries(cart).filter(([s]) => bySlug[s]).map(([s, q]) => `${bySlug[s].name} x ${q} = ${bySlug[s].price * q} €`);
  const total = Object.entries(cart).reduce((t, [s, q]) => t + (bySlug[s] ? bySlug[s].price * q : 0), 0);
  const body = `${lines.join("\n")}\nИтого: ${total} €\n\nИмя: ${f.get("name")}\nКонтакт: ${f.get("contact")}\nАдрес: ${f.get("address")}`;
  window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent("Новый заказ")}&body=${encodeURIComponent(body)}`;
  cart = {}; save(); renderCart(true);
}

document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest(".item")) openProduct(t.closest(".item").dataset.slug);
  else if (t.dataset.add) { cart[t.dataset.add] = Math.min((cart[t.dataset.add] || 0) + 1, 20); save(); $("#product-dlg").close(); renderCart(); $("#cart-dlg").showModal(); }
  else if (t.dataset.remove) { delete cart[t.dataset.remove]; save(); renderCart(); }
  else if (t.id === "open-cart") { renderCart(); $("#cart-dlg").showModal(); }
  else if (t.classList.contains("close")) t.closest("dialog").close();
  else if (t.tagName === "DIALOG") t.close();
});
document.addEventListener("submit", e => { if (e.target.id === "order-form") { e.preventDefault(); sendOrder(e.target); } });

renderCatalog(); save();
