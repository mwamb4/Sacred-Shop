/* =====================================================
   MUMSHOP
   Simple Mobile POS / Shop Management App
   ===================================================== */


/* ================= DATA ================= */

let products =
    JSON.parse(localStorage.getItem("mumshop_products")) || [];

let sales =
    JSON.parse(localStorage.getItem("mumshop_sales")) || [];

let cart = [];

let selectedPayment = "Cash";


/* ================= START APP ================= */

document.addEventListener("DOMContentLoaded", () => {

    displayDate();

    displayProducts();

    displayProductsForSale();

    displayCart();

    updateDashboard();

    displayLowStock();

    displaySalesHistory();

    updateReports();

});


/* ================= DATE ================= */

function displayDate() {

    const dateElement =
        document.getElementById("currentDate");

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString("en-KE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


/* ================= NAVIGATION ================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    window.scrollTo(0, 0);

    if (pageId === "home") {
        updateDashboard();
        displayLowStock();
    }

    if (pageId === "products") {
        displayProducts();
    }

    if (pageId === "sell") {
        displayProductsForSale();
        displayCart();
    }

    if (pageId === "history") {
        displaySalesHistory();
    }

    if (pageId === "reports") {
        updateReports();
    }
}


/* ================= PRODUCT FORM ================= */

function openProductForm(product = null) {

    const modal =
        document.getElementById("productModal");

    const title =
        document.getElementById("productModalTitle");

    const id =
        document.getElementById("productId");

    const name =
        document.getElementById("productName");

    const buying =
        document.getElementById("buyingPrice");

    const selling =
        document.getElementById("sellingPrice");

    const stock =
        document.getElementById("stockQuantity");


    if (product) {

        title.textContent = "Edit Product";

        id.value = product.id;

        name.value = product.name;

        buying.value = product.buyingPrice;

        selling.value = product.sellingPrice;

        stock.value = product.stock;

    } else {

        title.textContent = "Add Product";

        id.value = "";

        name.value = "";

        buying.value = "";

        selling.value = "";

        stock.value = "";
    }


    modal.classList.add("show");
}


function closeProductForm() {

    document
        .getElementById("productModal")
        .classList.remove("show");
}


/* ================= SAVE PRODUCT ================= */

function saveProduct() {

    const id =
        document.getElementById("productId").value;

    const name =
        document.getElementById("productName").value.trim();

    const buyingPrice =
        Number(document.getElementById("buyingPrice").value);

    const sellingPrice =
        Number(document.getElementById("sellingPrice").value);

    const stock =
        Number(document.getElementById("stockQuantity").value);


    if (!name) {
        alert("Please enter the product name.");
        return;
    }

    if (
        buyingPrice < 0 ||
        sellingPrice < 0 ||
        stock < 0 ||
        isNaN(buyingPrice) ||
        isNaN(sellingPrice) ||
        isNaN(stock)
    ) {
        alert("Please enter valid product information.");
        return;
    }


    if (id) {

        const product =
            products.find(p => p.id === Number(id));

        if (product) {

            product.name = name;
            product.buyingPrice = buyingPrice;
            product.sellingPrice = sellingPrice;
            product.stock = stock;
        }

    } else {

        const newProduct = {

            id: Date.now(),

            name: name,

            buyingPrice: buyingPrice,

            sellingPrice: sellingPrice,

            stock: stock

        };

        products.push(newProduct);
    }


    saveData();

    closeProductForm();

    displayProducts();

    displayProductsForSale();

    updateDashboard();

    displayLowStock();

    alert("Product saved successfully.");
}


/* ================= DISPLAY PRODUCTS ================= */

function displayProducts() {

    const container =
        document.getElementById("productList");

    const search =
        document
            .getElementById("stockSearch")
            ?.value
            .toLowerCase() || "";


    const filteredProducts =
        products.filter(product =>
            product.name.toLowerCase().includes(search)
        );


    if (filteredProducts.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No products found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filteredProducts.map(product => {

            const lowStock =
                product.stock <= 5;

            return `
                <div class="product-item">

                    <div class="product-info">

                        <div>

                            <div class="product-name">
                                ${escapeHTML(product.name)}
                            </div>

                            <div class="product-price">
                                KSh ${formatMoney(product.sellingPrice)}
                            </div>

                            <div class="stock-text ${lowStock ? "stock-low" : ""}">
                                Stock: ${product.stock}
                            </div>

                        </div>

                    </div>


                    <div class="product-actions">

                        <button
                            class="edit-btn"
                            onclick="editProduct(${product.id})">
                            ✏️ Edit
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


/* ================= EDIT PRODUCT ================= */

function editProduct(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;

    openProductForm(product);
}


/* ================= SELL PRODUCTS ================= */

function displayProductsForSale() {

    const container =
        document.getElementById("saleProducts");

    const search =
        document
            .getElementById("productSearch")
            ?.value
            .toLowerCase() || "";


    const filteredProducts =
        products.filter(product =>
            product.name.toLowerCase().includes(search)
        );


    if (filteredProducts.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No products available.
                <br><br>
                Add stock first.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filteredProducts.map(product => {

            const outOfStock =
                product.stock <= 0;

            return `
                <div class="product-item">

                    <div class="product-info">

                        <div>

                            <div class="product-name">
                                ${escapeHTML(product.name)}
                            </div>

                            <div class="product-price">
                                KSh ${formatMoney(product.sellingPrice)}
                            </div>

                            <div class="stock-text">
                                Stock: ${product.stock}
                            </div>

                        </div>

                    </div>


                    <div class="product-actions">

                        <button
                            class="sell-btn"
                            onclick="addToCart(${product.id})"
                            ${outOfStock ? "disabled" : ""}>
                            ${outOfStock ? "Out of Stock" : "➕ Add to Cart"}
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


/* ================= ADD TO CART ================= */

function addToCart(productId) {

    const product =
        products.find(p => p.id === productId);

    if (!product) return;


    if (product.stock <= 0) {

        alert("This product is out of stock.");

        return;
    }


    const existingItem =
        cart.find(item =>
            item.productId === productId
        );


    if (existingItem) {

        if (existingItem.quantity >= product.stock) {

            alert("You cannot add more than the available stock.");

            return;
        }

        existingItem.quantity++;

    } else {

        cart.push({

            productId: productId,

            quantity: 1

        });
    }


    displayCart();
}


/* ================= CART ================= */

function displayCart() {

    const container =
        document.getElementById("cartItems");

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Your cart is empty 🛒
            </div>
        `;

        document.getElementById("cartTotal")
            .textContent = "KSh 0";

        return;
    }


    container.innerHTML =
        cart.map(item => {

            const product =
                products.find(p =>
                    p.id === item.productId
                );

            if (!product) return "";


            const itemTotal =
                product.sellingPrice * item.quantity;


            return `
                <div class="cart-item">

                    <div class="cart-item-info">

                        <div class="cart-item-name">
                            ${escapeHTML(product.name)}
                        </div>

                        <div class="cart-item-price">
                            KSh ${formatMoney(itemTotal)}
                        </div>

                    </div>


                    <div class="quantity-controls">

                        <button
                            onclick="changeQuantity(${product.id}, -1)">
                            −
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            onclick="changeQuantity(${product.id}, 1)">
                            +
                        </button>

                        <button
                            class="remove-btn"
                            onclick="removeFromCart(${product.id})">
                            🗑️
                        </button>

                    </div>

                </div>
            `;

        }).join("");


    document.getElementById("cartTotal")
        .textContent =
        `KSh ${formatMoney(calculateCartTotal())}`;
}


/* ================= CHANGE QUANTITY ================= */

function changeQuantity(productId, change) {

    const item =
        cart.find(item =>
            item.productId === productId
        );

    const product =
        products.find(p =>
            p.id === productId
        );

    if (!item || !product) return;


    if (
        change > 0 &&
        item.quantity >= product.stock
    ) {

        alert("No more stock available.");

        return;
    }


    item.quantity += change;


    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;
    }


    displayCart();
}


/* ================= REMOVE FROM CART ================= */

function removeFromCart(productId) {

    cart =
        cart.filter(item =>
            item.productId !== productId
        );

    displayCart();
}


/* ================= CLEAR CART ================= */

function clearCart() {

    if (cart.length === 0) return;

    const confirmed =
        confirm("Clear all items from the cart?");

    if (!confirmed) return;

    cart = [];

    displayCart();
}


/* ================= CART TOTAL ================= */

function calculateCartTotal() {

    let total = 0;


    cart.forEach(item => {

        const product =
            products.find(p =>
                p.id === item.productId
            );

        if (product) {

            total +=
                product.sellingPrice *
                item.quantity;
        }

    });


    return total;
}


/* ================= CHECKOUT ================= */

function openCheckout() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    const total =
        calculateCartTotal();


    document.getElementById("checkoutTotal")
        .textContent =
        `KSh ${formatMoney(total)}`;


    document.getElementById("amountReceived")
        .value = "";


    document.getElementById("changeAmount")
        .textContent = "KSh 0";


    selectedPayment = "Cash";

    updatePaymentButtons();


    document
        .getElementById("checkoutModal")
        .classList.add("show");
}


function closeCheckout() {

    document
        .getElementById("checkoutModal")
        .classList.remove("show");
}


/* ================= PAYMENT ================= */

function selectPayment(method) {

    selectedPayment = method;

    updatePaymentButtons();

    calculateChange();
}


function updatePaymentButtons() {

    const cash =
        document.getElementById("cashBtn");

    const mpesa =
        document.getElementById("mpesaBtn");


    cash.classList.remove("selected");

    mpesa.classList.remove("selected");


    if (selectedPayment === "Cash") {
        cash.classList.add("selected");
    } else {
        mpesa.classList.add("selected");
    }
}


/* ================= CHANGE ================= */

function calculateChange() {

    const total =
        calculateCartTotal();

    const amount =
        Number(
            document.getElementById("amountReceived").value
        );


    if (!amount) {

        document.getElementById("changeAmount")
            .textContent = "KSh 0";

        return;
    }


    const change =
        amount - total;


    if (change >= 0) {

        document.getElementById("changeAmount")
            .textContent =
            `KSh ${formatMoney(change)}`;

    } else {

        document.getElementById("changeAmount")
            .textContent =
            `KSh ${formatMoney(Math.abs(change))} short`;
    }
}


/* ================= COMPLETE SALE ================= */

function completeSale() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    const total =
        calculateCartTotal();


    const amountReceived =
        Number(
            document.getElementById("amountReceived").value
        );


    if (
        isNaN(amountReceived) ||
        amountReceived < total
    ) {

        alert(
            `Amount received must be at least KSh ${formatMoney(total)}.`
        );

        return;
    }


    /* Create sale items */

    const saleItems =
        cart.map(item => {

            const product =
                products.find(p =>
                    p.id === item.productId
                );


            return {

                productId: product.id,

                name: product.name,

                quantity: item.quantity,

                buyingPrice: product.buyingPrice,

                sellingPrice: product.sellingPrice,

                subtotal:
                    product.sellingPrice *
                    item.quantity

            };

        });


    /* Calculate profit */

    let profit = 0;


    saleItems.forEach(item => {

        profit +=
            (item.sellingPrice -
             item.buyingPrice) *
            item.quantity;

    });


    /* Reduce stock */

    cart.forEach(item => {

        const product =
            products.find(p =>
                p.id === item.productId
            );

        if (product) {

            product.stock -= item.quantity;

        }

    });


    /* Create sale */

    const sale = {

        id: Date.now(),

        date: new Date().toISOString(),

        items: saleItems,

        total: total,

        profit: profit,

        paymentMethod: selectedPayment,

        amountReceived: amountReceived,

        change: amountReceived - total

    };


    sales.unshift(sale);


    /* Save */

    saveData();


    /* Reset cart
