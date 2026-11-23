/**
 * Hairnic - Interactive E-Commerce & Template Enhancements
 * Adds: Persistent Cart, Slide-out Cart Drawer, Deal Timer, 
 * Load More Toggle, and Form Interactivity.
 */
(function () {
  "use strict";

  // ==========================================
  // 1. PERSISTENT CART STATE MANAGEMENT
  // ==========================================
  const CART_STORAGE_KEY = "hairnic_cart_items";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    renderCartDrawer();
  }

  function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll("#cart-counter");
    badges.forEach((b) => {
      b.textContent = totalCount;
    });
  }

  // ==========================================
  // 2. SLIDE-OUT CART OFFCANVAS DRAWER (INJECTED)
  // ==========================================
  function injectCartDrawer() {
    if (document.getElementById("hairnicCartDrawer")) return;

    const drawerHTML = `
      <div class="offcanvas offcanvas-end" tabindex="-1" id="hairnicCartDrawer" aria-labelledby="hairnicCartDrawerLabel">
        <div class="offcanvas-header bg-primary text-white">
          <h5 class="offcanvas-title text-white mb-0" id="hairnicCartDrawerLabel">
            <i class="fa fa-shopping-bag me-2"></i> Your Shopping Cart
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column justify-content-between">
          <div id="hairnicCartItemsList" class="overflow-auto mb-3" style="max-height: 65vh;"></div>
          <div class="border-top pt-3">
            <div class="d-flex justify-content-between mb-2">
              <span class="fw-bold">Subtotal:</span>
              <span id="hairnicCartSubtotal" class="fw-bold text-primary">$0.00</span>
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary py-2" id="hairnicCheckoutBtn">Proceed to Checkout</button>
              <button class="btn btn-outline-danger btn-sm" id="hairnicClearCartBtn">Clear Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", drawerHTML);

    // Wire up drawer buttons
    document.getElementById("hairnicCheckoutBtn").addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty! Add products first.");
      } else {
        alert("Thank you for your order! Checkout process initiated.");
        saveCart([]);
        const drawerInstance = bootstrap.Offcanvas.getInstance(document.getElementById("hairnicCartDrawer"));
        if (drawerInstance) drawerInstance.hide();
      }
    });

    document.getElementById("hairnicClearCartBtn").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your cart?")) {
        saveCart([]);
      }
    });
  }

  function renderCartDrawer() {
    const listContainer = document.getElementById("hairnicCartItemsList");
    const subtotalEl = document.getElementById("hairnicCartSubtotal");
    if (!listContainer || !subtotalEl) return;

    const cart = getCart();

    if (cart.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fa fa-shopping-basket fa-3x text-muted mb-3"></i>
          <p class="text-muted">Your cart is currently empty.</p>
        </div>
      `;
      subtotalEl.textContent = "$0.00";
      return;
    }

    let subtotal = 0;
    listContainer.innerHTML = cart
      .map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
        <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
          <img src="${item.img}" alt="${item.title}" class="img-thumbnail me-2" style="width: 50px; height: 50px; object-fit: contain;">
          <div class="flex-grow-1">
            <h6 class="mb-0 small fw-bold text-truncate" style="max-width: 140px;">${item.title}</h6>
            <small class="text-muted">$${item.price.toFixed(2)}</small>
            <div class="d-flex align-items-center mt-1">
              <button class="btn btn-sm btn-outline-secondary py-0 px-2 cart-qty-minus" data-index="${index}">-</button>
              <span class="mx-2 small fw-bold">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary py-0 px-2 cart-qty-plus" data-index="${index}">+</button>
            </div>
          </div>
          <div class="text-end">
            <div class="small fw-bold mb-1">$${itemTotal.toFixed(2)}</div>
            <button class="btn btn-sm text-danger p-0 cart-remove-item" data-index="${index}">
              <i class="fa fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Quantity modifiers & deletion listeners
    listContainer.querySelectorAll(".cart-qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const currentCart = getCart();
        currentCart[idx].quantity += 1;
        saveCart(currentCart);
      });
    });

    listContainer.querySelectorAll(".cart-qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const currentCart = getCart();
        if (currentCart[idx].quantity > 1) {
          currentCart[idx].quantity -= 1;
        } else {
          currentCart.splice(idx, 1);
        }
        saveCart(currentCart);
      });
    });

    listContainer.querySelectorAll(".cart-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const currentCart = getCart();
        currentCart.splice(idx, 1);
        saveCart(currentCart);
      });
    });
  }

  // ==========================================
  // 3. GLOBAL CLICK HANDLER (ADD TO CART & DRAWER OPEN)
  // ==========================================
  document.addEventListener("click", function (e) {
    // 3A. Open Cart Drawer on clicking Cart Button
    const cartIconBtn = e.target.closest('a[href="#"] .fa-shopping-cart, a[href="#"] #cart-counter')?.closest("a");
    if (cartIconBtn) {
      e.preventDefault();
      const drawerEl = document.getElementById("hairnicCartDrawer");
      if (drawerEl && window.bootstrap) {
        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(drawerEl);
        renderCartDrawer();
        offcanvas.show();
      }
      return;
    }

    // 3B. Add To Cart Button Click Handler
    const button = e.target.closest("a, button");
    if (!button) return;

    const btnText = (button.innerText || button.textContent || "").trim().toLowerCase();
    if (btnText === "add to cart") {
      e.preventDefault();
      e.stopPropagation();

      // Find product details from card
      const card = button.closest(".product-item, .col-md-6, .col-lg-3");
      const title = card?.querySelector("h6, .h6, h5")?.innerText?.trim() || "Natural Organic Shampoo";
      const priceText = card?.querySelector(".text-primary, h5")?.innerText?.replace(/[^0-9.]/g, "") || "99.99";
      const price = parseFloat(priceText) || 99.99;
      const img = card?.querySelector("img")?.src || "https://preview.themewagon.com/hairnic/img/product-1.png";

      // Update cart array
      const cart = getCart();
      const existing = cart.find((i) => i.title === title);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ title, price, img, quantity: 1 });
      }
      saveCart(cart);

      // Button feedback state
      const originalText = button.innerText;
      button.innerText = "Added to the Cart";
      button.classList.remove("btn-outline-primary");
      button.classList.add("btn-success");
      button.style.pointerEvents = "none";

      setTimeout(() => {
        button.innerText = originalText;
        button.classList.remove("btn-success");
        button.classList.add("btn-outline-primary");
        button.style.pointerEvents = "auto";
      }, 1800);
    }
  });

  // ==========================================
  // 4. DEALS OF THE DAY TIMER (INDEX.HTML)
  // ==========================================
  function initDealsTimer() {
    const daysEl = document.getElementById("cdt-days");
    const hoursEl = document.getElementById("cdt-hours");
    const minsEl = document.getElementById("cdt-minutes");
    const secsEl = document.getElementById("cdt-seconds");

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const targetTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
      const distance = targetTime - new Date().getTime();
      if (distance < 0) return;

      daysEl.textContent = pad(Math.floor(distance / (1000 * 60 * 60 * 24)));
      hoursEl.textContent = pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      minsEl.textContent = pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      secsEl.textContent = pad(Math.floor((distance % (1000 * 60)) / 1000));
    }

    tick();
    setInterval(tick, 1000);
  }

  // ==========================================
  // 5. LOAD MORE PRODUCTS TOGGLE (PRODUCT.HTML)
  // ==========================================
  function initLoadMoreProducts() {
    const loadMoreBtn = Array.from(document.querySelectorAll("a, button")).find(
      (el) => el.textContent.trim().toLowerCase() === "load more products"
    );

    if (!loadMoreBtn) return;

    const row = loadMoreBtn.closest(".container")?.querySelector(".row.g-4");
    if (!row) return;

    const productCols = Array.from(row.children).filter((col) =>
      col.querySelector(".product-item")
    );

    // Only hide if there are more than 4 products
    if (productCols.length > 4) {
      for (let i = 4; i < productCols.length; i++) {
        productCols[i].style.display = "none";
      }

      loadMoreBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const isCollapsed = productCols[4].style.display === "none";

        for (let i = 4; i < productCols.length; i++) {
          productCols[i].style.display = isCollapsed ? "block" : "none";
        }

        loadMoreBtn.textContent = isCollapsed ? "Show Less" : "Load More Products";
      });
    }
  }

  // ==========================================
  // 6. FORMS INTERACTIVITY (NEWSLETTER & CONTACT)
  // ==========================================
  function initFormHandlers() {
    // Newsletter submission feedback
    document.querySelectorAll("form.newsletter-wrapper, form[action*='newsletter']").forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const input = form.querySelector("input[type='email']");
        if (input && input.value.trim()) {
          alert(`Success! 30% discount code has been sent to ${input.value.trim()}`);
          input.value = "";
        }
      });
    });

    // Contact form submission feedback
    const contactForm = document.querySelector("form[action='#'][method='POST']:not(.newsletter-wrapper)");
    if (contactForm && document.getElementById("name") && document.getElementById("email")) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const nameVal = document.getElementById("name")?.value;
        alert(`Thank you, ${nameVal || "Customer"}! Your message has been received. We will respond shortly.`);
        contactForm.reset();
      });
    }
  }

  // ==========================================
  // INITIALIZATION ON PAGE LOAD
  // ==========================================
  document.addEventListener("DOMContentLoaded", function () {
    injectCartDrawer();
    updateCartBadge();
    initDealsTimer();
    initLoadMoreProducts();
    initFormHandlers();
  });
})();