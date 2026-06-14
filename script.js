const catalogState = {
  products: [],
  category: "All",
  selected: new Set()
};

const inquiryEmail = "ycqyw@126.com";
const inquiryCcEmail = "xmhtwqx@gmail.com";

const grid = document.querySelector("#productGrid");
const tabs = document.querySelector("#categoryTabs");
const searchInput = document.querySelector("#searchInput");
const selectedProducts = document.querySelector("#selectedProducts");
const dialog = document.querySelector("#productDialog");
const dialogContent = document.querySelector("#dialogContent");
const closeDialog = document.querySelector("#closeDialog");
const inquiryForm = document.querySelector("#inquiryForm");

function normalize(value) {
  return String(value || "").toLowerCase();
}

function productSearchText(product) {
  return normalize([
    product.name,
    product.category,
    product.tagline,
    product.moq,
    product.leadTime,
    product.priceRange,
    product.certifications.join(" "),
    product.markets.join(" "),
    Object.values(product.specs).join(" "),
    product.applications.join(" ")
  ].join(" "));
}

function getFilteredProducts() {
  const term = normalize(searchInput.value.trim());
  return catalogState.products.filter((product) => {
    const categoryMatch = catalogState.category === "All" || product.category === catalogState.category;
    const textMatch = !term || productSearchText(product).includes(term);
    return categoryMatch && textMatch;
  });
}

function renderTabs() {
  const categories = ["All", ...new Set(catalogState.products.map((product) => product.category))];
  tabs.innerHTML = categories.map((category) => {
    const selected = category === catalogState.category ? "true" : "false";
    return `<button type="button" role="tab" aria-selected="${selected}" data-category="${category}">${category}</button>`;
  }).join("");
}

function renderProducts() {
  const products = getFilteredProducts();
  if (!products.length) {
    grid.innerHTML = `<p class="empty-state">No products match this filter.</p>`;
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-card-body">
        <div>
          <div class="pill-row">
            <span class="pill">${product.category}</span>
            <span class="pill">${product.moq}</span>
          </div>
          <h3>${product.name}</h3>
        </div>
        <p>${product.tagline}</p>
        <ul class="meta-list">
          <li><strong>Lead time:</strong> ${product.leadTime}</li>
          <li><strong>Price:</strong> ${product.priceRange}</li>
          <li><strong>Support:</strong> ${product.certifications.join(", ")}</li>
        </ul>
        <div class="product-actions">
          <button class="detail-button" type="button" data-detail="${product.id}">Details</button>
          <button class="quote-button" type="button" data-quote="${product.id}">${catalogState.selected.has(product.id) ? "Selected" : "Add quote"}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function updateSelectedProductsField() {
  const names = catalogState.products
    .filter((product) => catalogState.selected.has(product.id))
    .map((product) => product.name);
  selectedProducts.value = names.join("\n");
}

function openProductDialog(productId) {
  const product = catalogState.products.find((item) => item.id === productId);
  if (!product) return;

  const specs = Object.entries(product.specs).map(([key, value]) => `
    <div>
      <dt>${key}</dt>
      <dd>${value}</dd>
    </div>
  `).join("");

  dialogContent.innerHTML = `
    <div class="dialog-layout">
      <img src="${product.image}" alt="${product.name}">
      <div class="dialog-body">
        <p class="eyebrow">${product.category}</p>
        <h2>${product.name}</h2>
        <p>${product.detail}</p>
        <dl class="spec-table">${specs}</dl>
        <div class="pill-row">
          ${product.markets.map((market) => `<span class="pill">${market}</span>`).join("")}
          ${product.certifications.map((cert) => `<span class="pill">${cert}</span>`).join("")}
        </div>
        <h3>Applications</h3>
        <ul>
          ${product.applications.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <h3>Social copy</h3>
        <p>${product.socialCopy}</p>
        <button class="button primary" type="button" data-dialog-quote="${product.id}">Add to inquiry</button>
      </div>
    </div>
  `;
  dialog.showModal();
}

function addProductToInquiry(productId) {
  catalogState.selected.add(productId);
  updateSelectedProductsField();
  renderProducts();
}

async function loadProducts() {
  const response = await fetch("data/products.json");
  catalogState.products = await response.json();
  renderTabs();
  renderProducts();
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  catalogState.category = button.dataset.category;
  renderTabs();
  renderProducts();
});

grid.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail]");
  const quoteButton = event.target.closest("[data-quote]");

  if (detailButton) {
    openProductDialog(detailButton.dataset.detail);
  }

  if (quoteButton) {
    addProductToInquiry(quoteButton.dataset.quote);
    document.querySelector("#inquiry").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

dialogContent.addEventListener("click", (event) => {
  const quoteButton = event.target.closest("[data-dialog-quote]");
  if (!quoteButton) return;
  addProductToInquiry(quoteButton.dataset.dialogQuote);
  dialog.close();
  document.querySelector("#inquiry").scrollIntoView({ behavior: "smooth", block: "start" });
});

closeDialog.addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", renderProducts);

inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(inquiryForm);
  const subject = encodeURIComponent(`Product inquiry from ${formData.get("name") || "buyer"}`);
  const body = encodeURIComponent([
    `Name: ${formData.get("name")}`,
    `Email: ${formData.get("email")}`,
    `Company / Market: ${formData.get("market")}`,
    "",
    "Selected products:",
    formData.get("products"),
    "",
    "Message:",
    formData.get("message")
  ].join("\n"));

  window.location.href = `mailto:${inquiryEmail}?cc=${encodeURIComponent(inquiryCcEmail)}&subject=${subject}&body=${body}`;
});

loadProducts().catch(() => {
  grid.innerHTML = `<p class="empty-state">Product data could not be loaded. Please check data/products.json.</p>`;
});
