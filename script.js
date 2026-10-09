/* ==========================================================================
   EL NABIL — Site logic
   1. CONFIG        → WhatsApp number, social links, currency
   2. PRODUCTS      → the ONLY place to edit/add perfumes
   3. Everything else is application code
   ========================================================================== */

/* ---------- 1. CONFIG ---------- */

// Replace with the real number: country code + number, digits only (Algeria example: 213550000000)
const WHATSAPP_NUMBER = "213555428494";

// Leave a value empty ("") to hide that link on the site.
const SOCIAL = {
  instagram: "https://www.instagram.com/elnabil.algerie?psln=MXR1MnlwZjNxOXpvNw==",   // e.g. "https://www.instagram.com/elnabil.algerie?psln=MXR1MnlwZjNxOXpvNw=="
  facebook: "",    // e.g. "https://www.facebook.com/your_page"
  tiktok: "https://www.tiktok.com/@elnabil_algerie?_r=1&_t=ZS-9APrlvv9JMD"       // e.g. "https://www.tiktok.com/@elnabil_algerie?_r=1&_t=ZS-9APrlvv9JMD"
};

const CURRENCY = "DA";
const CART_KEY = "elnabil_cart_v1";

/* ---------- 2. PRODUCTS ----------
   To add a perfume: copy one block, change the values, place its photos in the same folder as index.html.
   - name        : product name (taken from the image filename)
   - images      : list of photos; the first is the main one, the second shows on hover
   - price       : number in DA. Use 0 while the price is not set ("Prix sur WhatsApp" is shown)
   - size        : e.g. "50 ml" (leave "" to hide)
   - description : short text (leave "" to show a neutral default)
   - notes       : optional list of fragrance notes (leave [] to hide)
*/
const products = [
  {
    name: "El Mabrock",
    images: ["EL_MABROCK_1.png", "EL_MABROCK_2.png"],
    price: 3700 ,
    size: "",
    description: "A captivating fragrance that leaves a memorable impression.",
    notes: []
  },
  {
    name: "Royal Gold",
    images: ["ROYAL_GOLD_1.png", "ROYAL_GOLD_2.png"],
    price: 3700,
    size: "",
    description: "A luxurious and elegant scent for a truly royal touch.",
    notes: []
  },
  {
    name: "Medania",
    images: ["MEDANIA_1.png", "MEDANIA_2.png"],
    price: 3700,
    size: "",
    description: "A refined fragrance with a smooth and distinctive character.",
    // Notes written on the supplied MEDANIA_2.jpg visual
    notes: ["Fleur d'oranger", "Osmanthus", "Musc", "Vétiver", "Vanille", "Ambre"]
  },
  {
    name: "Musc Azur",
    images: ["MUSC_AZUR_1.png", "MUSC_AZUR_2.png"],
    price: 3700,
    size: "",
    description: "A fresh, clean and sophisticated scent for everyday elegance.",
    notes: []
  },
  {
    name: "Musc Love",
    images: ["MUSC_LOVE_1.png", "MUSC_LOVE_2.png"],
    price: 3700,
    size: "",
    description: "A soft, charming fragrance that adds a touch of romance.",
    notes: []
  }
];

const DEFAULT_DESCRIPTION = "Un parfum de la collection EL NABIL.";

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira",
  "Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda",
  "Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla",
  "Oran","El Bayadh","Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela",
  "Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","El M'Ghair","El Menia",
  "Ouled Djellal","Bordj Badji Mokhtar","Béni Abbès","Timimoun","Touggourt","Djanet","In Salah","In Guezzam"
];

/* ==========================================================================
   Application code
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
products.forEach((p) => { p.id = slug(p.name); });
const byId = (id) => products.find((p) => p.id === id);

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hasPrice = (p) => Number(p.price) > 0;
const fmt = (n) => `${Number(n).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} ${CURRENCY}`;
const priceLabel = (p) => (hasPrice(p) ? fmt(p.price) : "Prix sur WhatsApp");

/* ---------- Cart state (localStorage) ---------- */
let cart = loadCart();

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return raw.filter((i) => byId(i.id) && i.qty > 0).map((i) => ({ id: i.id, qty: Math.min(99, Math.floor(i.qty)) }));
  } catch (e) { return []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
}
function addToCart(id, qty = 1) {
  const line = cart.find((i) => i.id === id);
  if (line) line.qty = Math.min(99, line.qty + qty);
  else cart.push({ id, qty });
  saveCart(); renderCart(true);
}
function setQty(id, qty) {
  if (qty <= 0) return removeFromCart(id);
  const line = cart.find((i) => i.id === id);
  if (line) line.qty = Math.min(99, qty);
  saveCart(); renderCart();
}
function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart(); renderCart();
}
function cartTotals() {
  let subtotal = 0, count = 0, unpriced = 0;
  cart.forEach((i) => {
    const p = byId(i.id);
    count += i.qty;
    if (hasPrice(p)) subtotal += p.price * i.qty; else unpriced += i.qty;
  });
  return { subtotal, count, unpriced };
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---------- Product grid ---------- */
function renderProducts() {
  $("#productGrid").innerHTML = products.map((p) => {
    const [a, b] = p.images;
    return `
    <article class="card reveal">
      <button type="button" class="card-media" data-action="view" data-id="${p.id}" aria-label="Voir ${esc(p.name)}">
        <img src="${esc(a)}" alt="Parfum EL NABIL ${esc(p.name)}" loading="lazy">
        ${b ? `<img class="img-b" src="${esc(b)}" alt="" loading="lazy">` : ""}
      </button>
      <div class="card-body">
        <div class="card-top">
          <h3 class="card-name">${esc(p.name)}</h3>
          <span class="card-price ${hasPrice(p) ? "" : "is-tbc"}">${esc(priceLabel(p))}</span>
        </div>
        ${p.size ? `<span class="card-size">${esc(p.size)}</span>` : ""}
        <p class="card-desc">${esc(p.description || DEFAULT_DESCRIPTION)}</p>
        <div class="card-actions">
          <button type="button" class="btn btn--outline btn--sm" data-action="view" data-id="${p.id}">Voir le produit</button>
          <button type="button" class="btn btn--dark btn--sm" data-action="add" data-id="${p.id}">Ajouter au panier</button>
        </div>
      </div>
    </article>`;
  }).join("");
  observeReveals();
}

$("#productGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "view") openProduct(btn.dataset.id);
  if (btn.dataset.action === "add") {
    addToCart(btn.dataset.id, 1);
    toast(`${byId(btn.dataset.id).name} ajouté au panier`);
  }
});

/* ---------- Product modal ---------- */
const modal = $("#productModal");
let current = { id: null, qty: 1 };

function openProduct(id) {
  const p = byId(id);
  if (!p) return;
  current = { id, qty: 1 };
  $("#pmName").textContent = p.name;
  const price = $("#pmPrice");
  price.textContent = priceLabel(p);
  price.classList.toggle("is-tbc", !hasPrice(p));
  const size = $("#pmSize");
  size.hidden = !p.size;
  size.textContent = p.size ? `Contenance : ${p.size}` : "";
  $("#pmDesc").textContent = p.description || DEFAULT_DESCRIPTION;
  const notes = $("#pmNotes");
  notes.hidden = !p.notes || !p.notes.length;
  $("#pmNotesList").innerHTML = (p.notes || []).map((n) => `<li>${esc(n)}</li>`).join("");
  $("#pmQty").textContent = "1";

  $("#pmThumbs").innerHTML = p.images.length > 1
    ? p.images.map((src, i) => `<button type="button" data-img="${i}" aria-label="Photo ${i + 1} de ${esc(p.name)}"><img src="${esc(src)}" alt=""></button>`).join("")
    : "";
  showPhoto(p, 0);
  if (!modal.open) modal.showModal();
}
function showPhoto(p, i) {
  const img = $("#pmImage");
  img.src = p.images[i];
  img.alt = `Parfum EL NABIL ${p.name}${p.images.length > 1 ? ` — photo ${i + 1}` : ""}`;
  $$("#pmThumbs button").forEach((b, idx) => b.setAttribute("aria-current", idx === i ? "true" : "false"));
}
$("#pmThumbs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-img]");
  if (b) showPhoto(byId(current.id), Number(b.dataset.img));
});
$("#pmMinus").addEventListener("click", () => { current.qty = Math.max(1, current.qty - 1); $("#pmQty").textContent = current.qty; });
$("#pmPlus").addEventListener("click", () => { current.qty = Math.min(99, current.qty + 1); $("#pmQty").textContent = current.qty; });
$("#pmAdd").addEventListener("click", () => {
  addToCart(current.id, current.qty);
  toast(`${byId(current.id).name} × ${current.qty} ajouté au panier`);
  modal.close();
});
$("#pmOrder").addEventListener("click", () => {
  addToCart(current.id, current.qty);
  modal.close();
  openDrawer("checkout");
});
$("#closeModal").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); }); // click on backdrop

/* ---------- Cart drawer ---------- */
const drawer = $("#cartDrawer");
const backdrop = $("#backdrop");
let lastFocus = null;

function openDrawer(view = "cart") {
  lastFocus = document.activeElement;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("show"));
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  showView(cart.length ? view : "cart");
  $("#closeCart").focus();
}
function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("show");
  setTimeout(() => { backdrop.hidden = true; }, 300);
  document.body.classList.remove("is-locked");
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
function showView(view) {
  $("#viewCart").hidden = view !== "cart";
  $("#viewCheckout").hidden = view !== "checkout";
  $("#drawerTitle").textContent = view === "cart" ? "Votre panier" : "Finaliser la commande";
  if (view === "checkout") renderRecap();
}

$("#openCart").addEventListener("click", () => openDrawer("cart"));
$("#closeCart").addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);
$$("[data-close-cart]").forEach((b) => b.addEventListener("click", () => {
  closeDrawer();
  if (b.textContent.includes("collection")) $("#collection").scrollIntoView();
}));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });
$("#goCheckout").addEventListener("click", () => showView("checkout"));
$("#backToCart").addEventListener("click", () => showView("cart"));
$("#clearCart").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });

$("#cartList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = btn.dataset.id;
  const line = cart.find((i) => i.id === id);
  if (!line) return;
  if (btn.dataset.act === "plus") setQty(id, line.qty + 1);
  if (btn.dataset.act === "minus") setQty(id, line.qty - 1);
  if (btn.dataset.act === "remove") removeFromCart(id);
});

function renderCart(bump = false) {
  const { subtotal, count, unpriced } = cartTotals();

  const badge = $("#cartCount");
  badge.hidden = count === 0;
  badge.textContent = count;
  if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }

  $("#cartList").innerHTML = cart.map((i) => {
    const p = byId(i.id);
    return `
    <li class="cart-item">
      <img src="${esc(p.images[0])}" alt="${esc(p.name)}">
      <div>
        <div class="ci-top">
          <div>
            <div class="ci-name">${esc(p.name)}</div>
            <div class="ci-unit">${esc(priceLabel(p))}${p.size ? " · " + esc(p.size) : ""}</div>
          </div>
          <button type="button" class="ci-remove" data-act="remove" data-id="${p.id}" aria-label="Retirer ${esc(p.name)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div class="ci-bottom">
          <div class="qty qty--sm" role="group" aria-label="Quantité de ${esc(p.name)}">
            <button type="button" data-act="minus" data-id="${p.id}" aria-label="Diminuer">−</button>
            <output>${i.qty}</output>
            <button type="button" data-act="plus" data-id="${p.id}" aria-label="Augmenter">+</button>
          </div>
          <span class="ci-total">${hasPrice(p) ? fmt(p.price * i.qty) : "—"}</span>
        </div>
      </div>
    </li>`;
  }).join("");

  const empty = cart.length === 0;
  $("#cartEmpty").hidden = !empty;
  $("#cartFoot").hidden = empty;
  $("#cartSubtotal").textContent = fmt(subtotal);
  const note = $("#cartNote");
  note.hidden = unpriced === 0;
  note.textContent = unpriced ? "Certains articles n'ont pas encore de prix : il sera confirmé sur WhatsApp." : "";

  // If the cart was emptied while on the checkout step, go back to the cart view
  if (empty && !$("#viewCheckout").hidden) showView("cart");
  else if (!$("#viewCheckout").hidden) renderRecap();
}

function renderRecap() {
  const { subtotal, unpriced } = cartTotals();
  $("#recap").innerHTML = cart.map((i) => {
    const p = byId(i.id);
    return `<div class="recap-row"><span>${esc(p.name)} × ${i.qty}</span><span>${hasPrice(p) ? fmt(p.price * i.qty) : "prix à confirmer"}</span></div>`;
  }).join("") + `<div class="recap-row recap-total"><span>Total</span><span>${fmt(subtotal)}${unpriced ? " + à confirmer" : ""}</span></div>`;
}

/* ---------- WhatsApp ---------- */
function waConfigured() { return /^\d{8,15}$/.test(WHATSAPP_NUMBER); }
function waLink(text) { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`; }

// Generic WhatsApp buttons (hero, contact). Keep a direct href as a fallback for local file:// use.
$$(".js-wa-link").forEach((a) => {
  a.href = waConfigured() ? waLink("Bonjour EL NABIL, je souhaite des informations sur vos parfums.") : "#contact";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.addEventListener("click", (e) => {
    if (!waConfigured()) { e.preventDefault(); e.stopPropagation(); toast("Numéro WhatsApp non configuré (voir script.js)"); }
  });
});

function buildOrderMessage(d) {
  const { subtotal, unpriced } = cartTotals();
  const lines = cart.map((i) => {
    const p = byId(i.id);
    return `${p.name} × ${i.qty} — ${hasPrice(p) ? fmt(p.price * i.qty) : "prix à confirmer"}`;
  });
  const total = `Total : ${fmt(subtotal)}${unpriced ? " (+ articles dont le prix est à confirmer)" : ""}`;
  return [
    "Bonjour EL NABIL,",
    "",
    "Je souhaite passer une commande :",
    "",
    ...lines,
    "",
    total,
    "",
    `Nom : ${d.name}`,
    `Téléphone : ${d.phone}`,
    `Wilaya : ${d.wilaya}`,
    `Ville : ${d.city}`,
    `Adresse : ${d.address}`,
    `Note : ${d.note || "—"}`,
    "",
    "Merci."
  ].join("\n");
}

/* ---------- Checkout form ---------- */
(function initForm() {
  $("#fWilaya").innerHTML = `<option value="" disabled selected>Choisir…</option>` +
    WILAYAS.map((w, i) => `<option value="${esc(String(i + 1).padStart(2, "0") + " - " + w)}">${String(i + 1).padStart(2, "0")} - ${esc(w)}</option>`).join("");
})();

$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const err = $("#formError");
  err.hidden = true;

  // Reset + validate
  $$(".field", form).forEach((f) => f.classList.remove("invalid"));
  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    wilaya: form.wilaya.value,
    city: form.city.value.trim(),
    address: form.address.value.trim(),
    note: form.note.value.trim()
  };
  const bad = [];
  if (!data.name) bad.push("fName");
  if (!/^\+?[\d\s.-]{8,18}$/.test(data.phone)) bad.push("fPhone");
  if (!data.wilaya) bad.push("fWilaya");
  if (!data.city) bad.push("fCity");
  if (!data.address) bad.push("fAddress");
  if (bad.length) {
    bad.forEach((id) => $("#" + id).closest(".field").classList.add("invalid"));
    err.textContent = "Merci de compléter les champs en rouge (téléphone valide requis).";
    err.hidden = false;
    $("#" + bad[0]).focus();
    return;
  }
  if (!cart.length) { err.textContent = "Votre panier est vide."; err.hidden = false; return; }
  if (!waConfigured()) { err.textContent = "Le numéro WhatsApp n'est pas configuré : renseignez WHATSAPP_NUMBER dans script.js."; err.hidden = false; return; }

  const url = waLink(buildOrderMessage(data));
  // Navigation directe : plus fiable en local et évite les bloqueurs de fenêtres pop-up.
  window.location.href = url;
});

/* ---------- Contact / footer links ---------- */
function renderLinks() {
  const items = [];
  if (waConfigured()) items.push({ label: "WhatsApp", href: waLink("Bonjour EL NABIL,") });
  if (SOCIAL.instagram) items.push({ label: "Instagram", href: SOCIAL.instagram });
  if (SOCIAL.facebook) items.push({ label: "Facebook", href: SOCIAL.facebook });
  if (SOCIAL.tiktok) items.push({ label: "TikTok", href: SOCIAL.tiktok });
  const html = (cls) => items.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("");
  $("#contactLinks").innerHTML = html();
  $("#footerLinks").innerHTML = html();
}

/* ---------- Mobile nav ---------- */
const nav = $("#mainNav"), menuBtn = $("#menuToggle");
function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("click", (e) => { if (!e.target.closest(".site-header")) setMenu(false); });

/* ---------- Scroll reveal ---------- */
let io;
function observeReveals() {
  if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("in")); return; }
  io = io || new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$(".reveal:not(.in)").forEach((el) => io.observe(el));
}

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
renderLinks();
observeReveals();
