/* =====================================================
   MUMSHOP
   Main JavaScript
===================================================== */


/* ================= DATA ================= */

let products = JSON.parse(
    localStorage.getItem("mumshop_products")
) || [];

let sales = JSON.parse(
    localStorage.getItem("mumshop_sales")
) || [];

let cart = [];

let selectedPayment = "Cash";


/* ================= STARTUP ================= */

document.addEventListener("DOMContentLoaded", function () {

    showDate();

    displayProducts();

    displayProductsForSale();

    updateDashboard();

    displaySalesHistory();

});


/* ================= DATE ================= */

function showDate() {

    const date = new Date();

    document.getElementById("currentDate").textContent =
        date.toLocaleDateString("en-KE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}


/* ================= NAVIGATION ================= */

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }


    const navButtons =
        document.querySelectorAll(".nav-btn");

    navButtons.forEach(button => {
        button.classList.remove("active");
    });


    const matchingButton =
        [...navButtons].find(button =>
            button.getAttribute("onclick") ===
            `showPage('${pageId}')`
        );

    if (matchingButton) {
        matchingButton.classList.add("active");
    }


    if (pageId === "home") {
        updateDashboard();
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


/* =====================================================
   PRODUCTS
===================================================== */


/* ---------- SAVE PRODUCT ---------- */

function saveProduct() {

    const name =
        document.getElementById("productName")
        .value.trim();

    const buyingPrice =
        Number(document.getElementById("buyingPrice").value);

    const sellingPrice =
        Number(document.getElementById("sellingPrice").value);

    const stock =
        Number(document.getElementById("productStock").value);

    const editId =
        document.getElementById("editProductId").value;


    if (!name) {
        alert("Enter the product name.");
        return;
    }

    if (
        buyingPrice < 0 ||
        sellingPrice < 0 ||
        stock < 0
    ) {
        alert("Enter valid numbers.");
        return;
    }


    if (editId) {

        const product =
            products.find(p => p.id == editId);

        if (product) {

            product.name = name;
            product.buyingPrice = buyingPrice;
            product.sellingPrice = sellingPrice;
            product.stock = stock;

        }

    } else {

        const product = {

            id: Date.now(),

            name: name,

            buyingPrice: buyingPrice,

            sellingPrice: sellingPrice,

            stock: stock

        };

        products.push(product);
    }


    saveData();

    closeProductForm();

    displayProducts();

    displayProductsForSale();

    updateDashboard();

}


/* ---------- DISPLAY PRODUCTS ---------- */

function displayProducts() {

    const container =
        document.getElementById("productList");

    const search =
        document.getElementById("inventorySearch")
        ?.value.toLowerCase() || "";


    const filtered =
        products.filter(product =>
            product.name.toLowerCase()
            .includes(search)
        );


    if (filtered.length === 0) {

        container.innerHTML =
            `<p class="empty">
                No products found.
            </p>`;

        return;
    }


    container.innerHTML =
        filtered.map(product => {

            const low =
                product.stock <= 5;

            return `

                <div class="inventory-item">

                    <div>

                        <h4>${product.name}</h4>

                        <p>
                            Selling:
                            KSh ${formatMoney(product.sellingPrice)}
                        </p>

                        <p class="${low ? "stock-low" : ""}">
                            Stock: ${product.stock}
                        </p>

                    </div>


                    <button
                        class="add-btn"
                        onclick="editProduct(${product.id})"
                    >
                        Edit
                    </button>

                </div>

            `;

        }).join("");
}


/* ---------- PRODUCT FORM ---------- */

function openProductForm() {

    document.getElementById("productModal")
        .classList.add("show");

    document.getElementById("productFormTitle")
        .textContent = "Add Product";

    document.getElementById("editProductId")
        .value = "";

    document.getElementById("productName")
        .value = "";

    document.getElementById("buyingPrice")
        .value = "";

    document.getElementById("sellingPrice")
        .value = "";

    document.getElementById("productStock")
        .value = "";
}


function closeProductForm() {

    document.getElementById("productModal")
        .classList.remove("show");
}


/* ---------- EDIT PRODUCT ---------- */

function editProduct(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;


    document.getElementById("productFormTitle")
        .textContent = "Edit Product";

    document.getElementById("editProductId")
        .value = product.id;

    document.getElementById("productName")
        .value = product.name;

    document.getElementById("buyingPrice")
        .value = product.buyingPrice;

    document.getElementById("sellingPrice")
        .value = product.sellingPrice;

    document.getElementById("productStock")
        .value = product.stock;


    document.getElementById("productModal")
        .classList.add("show");
}


/* =====================================================
   SELLING
===================================================== */

function displayProductsForSale() {

    const container =
        document.getElementById("saleProducts");

    const search =
        document.getElementById("productSearch")
        ?.value.toLowerCase() || "";


    const filtered =
        products.filter(product =>
            product.name.toLowerCase()
            .includes(search)
        );


    if (filtered.length === 0) {

        container.innerHTML =
            `<p class="empty">
                No products available.
            </p>`;

        return;
    }


    container.innerHTML =
        filtered.map(product => {

            return `

                <div class="product-item">

                    <div>

                        <h4>${product.name}</h4>

                        <p>
                            KSh ${formatMoney(product.sellingPrice)}
                        </p>

                        <p>
                            ${product.stock} in stock
                        </p>

                    </div>


                    <button
                        class="add-btn"
                        onclick="addToCart(${product.id})"
                        ${product.stock <= 0 ? "disabled" : ""}
                    >
                        +
                    </button>

                </div>

            `;

        }).join("");
}


/* ---------- ADD TO CART ---------- */

function addToCart(productId) {

    const product =
        products.find(p => p.id === productId);

    if (!product) return;


    const existing =
        cart.find(item => item.productId === productId);


    if (existing) {

        if (existing.quantity >= product.stock) {

            alert("Not enough stock.");
            return;

        }

        existing.quantity++;

    } else {

        cart.push({

            productId: product.id,

            quantity: 1

        });

    }


    displayCart();
}


/* ---------- CART ---------- */

function displayCart() {

    const container =
        document.getElementById("cartItems");

    const count =
        document.getElementById("cartCount");

    const totalElement =
        document.getElementById("cartTotal");


    if (cart.length === 0) {

        container.innerHTML =
            `<p class="empty">
                Cart is empty.
            </p>`;

        count.textContent = "0 items";

        totalElement.textContent = "KSh 0";

        return;
    }


    let total = 0;

    let itemCount = 0;


    container.innerHTML =
        cart.map(item => {

            const product =
                products.find(
                    p => p.id === item.productId
                );

            if (!product) return "";


            const itemTotal =
                product.sellingPrice *
                item.quantity;


            total += itemTotal;

            itemCount += item.quantity;


            return `

                <div class="cart-item">

                    <div>

                        <strong>
                            ${product.name}
                        </strong>

                        <p>
                            KSh ${formatMoney(product.sellingPrice)}
                        </p>

                    </div>


                    <div class="quantity-controls">

                        <button
                            onclick="changeQuantity(
                                ${product.id},
                                -1
                            )"
                        >
                            -
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity(
                                ${product.id},
                                1
                            )"
                        >
                            +
                        </button>

                    </div>

                </div>

            `;

        }).join("");


    count.textContent =
        `${itemCount} item${itemCount !== 1 ? "s" : ""}`;

    totalElement.textContent =
        `KSh ${formatMoney(total)}`;
}


/* ---------- CHANGE QUANTITY ---------- */

function changeQuantity(productId, change) {

    const item =
        cart.find(
            item => item.productId === productId
        );

    const product =
        products.find(
            p => p.id === productId
        );

    if (!item || !product) return;


    item.quantity += change;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.productId !== productId
            );

    }


    if (item.quantity > product.stock) {

        item.quantity = product.stock;

        alert("You cannot sell more than available stock.");

    }


    displayCart();
}


/* =====================================================
   CHECKOUT
===================================================== */

function openCheckout() {

    if (cart.length === 0) {

        alert("Add products to the cart first.");

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


    document.getElementById("checkoutModal")
        .classList.add("show");
}


function closeCheckout() {

    document.getElementById("checkoutModal")
        .classList.remove("show");
}


/* ---------- PAYMENT ---------- */

function selectPayment(method) {

    selectedPayment = method;

    updatePaymentButtons();
}


function updatePaymentButtons() {

    document.getElementById("cashBtn")
        .classList.remove("selected");

    document.getElementById("mpesaBtn")
        .classList.remove("selected");


    if (selectedPayment === "Cash") {

        document.getElementById("cashBtn")
            .classList.add("selected");

    } else {

        document.getElementById("mpesaBtn")
            .classList.add("selected");

    }
}


/* ---------- CHANGE ---------- */

function calculateChange() {

    const total =
        calculateCartTotal();

    const received =
        Number(
            document.getElementById("amountReceived")
            .value
        ) || 0;


    const change =
        received - total;


    document.getElementById("changeAmount")
        .textContent =
        `KSh ${formatMoney(Math.max(change, 0))}`;
}


/* ---------- COMPLETE SALE ---------- */

function completeSale() {

    if (cart.length === 0) return;


    const total =
        calculateCartTotal();


    const received =
        Number(
            document.getElementById("amountReceived")
            .value
        ) || 0;


    if (received < total) {

        alert("Amount received is less than the total.");

        return;
    }


    const saleItems = cart.map(item => {

        const product =
            products.find(
                p => p.id === item.productId
            );


        return {

            productId: product.id,

            name: product.name,

            quantity: item.quantity,

            price: product.sellingPrice,

            buyingPrice: product.buyingPrice

        };

    });


    /* REDUCE STOCK */

    cart.forEach(item => {

        const product =
            products.find(
                p => p.id === item.productId
            );

        if (product) {

            product.stock -= item.quantity;

        }

    });


    const profit =
        saleItems.reduce(
            (sum, item) =>
                sum +
                (
                    (item.price - item.buyingPrice)
                    * item.quantity
                ),
            0
        );


    const sale = {

        id: Date.now(),

        date: new Date().toISOString(),

        items: saleItems,

        total: total,

        profit: profit,

        payment: selectedPayment,

        received: received,

        change: received - total

    };


    sales.push(sale);


    saveData();


    cart = [];


    closeCheckout();


    displayCart();

    displayProducts();

    displayProductsForSale();

    displaySalesHistory();

    updateDashboard();

    updateReports();


    alert(
        `Sale completed!\n\nTotal: KSh ${formatMoney(total)}`
    );
}


/* ---------- CART TOTAL ---------- */

function calculateCartTotal() {

    return cart.reduce((total, item) => {

        const product =
            products.find(
                p => p.id === item.productId
            );

        if (!product) return total;


        return total +
            (
                product.sellingPrice *
                item.quantity
            );

    }, 0);
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const today =
        getTodaySales();


    const salesTotal =
        today.reduce(
            (sum, sale) => sum + sale.total,
            0
        );


    const profitTotal =
        today.reduce(
            (sum, sale) => sum + sale.profit,
            0
        );


    document.getElementById("todaySales")
        .textContent =
        `KSh ${formatMoney(salesTotal)}`;


    document.getElementById("todayProfit")
        .textContent =
        `KSh ${formatMoney(profitTotal)}`;


    document.getElementById("todayTransactions")
        .textContent =
        today.length;


    const lowStock =
        products.filter(
            product => product.stock <= 5
        );


    document.getElementById("lowStockCount")
        .textContent =
        lowStock.length;


    displayLowStock();
}


/* ---------- LOW STOCK ---------- */

function displayLowStock() {

    const container =
        document.getElementById("lowStockList");


    const lowStock =
        products.filter(
            product => product.stock <= 5
        );


    if (lowStock.length === 0) {

        container.innerHTML =
            `<p class="empty">
                No low-stock products.
            </p>`;

        return;
    }


    container.innerHTML =
        lowStock.map(product => {

            return `

                <div class="report-row">

                    <span>
                        ${product.name}
                    </span>

                    <strong class="stock-low">
                        ${product.stock} left
                    </strong>

                </div>

            `;

        }).join("");
}


/* =====================================================
   SALES HISTORY
===================================================== */

function displaySalesHistory() {

    const container =
        document.getElementById("salesHistory");


    if (sales.length === 0) {

        container.innerHTML =
            `<p class="empty">
                No sales recorded yet.
            </p>`;

        return;
    }


    const sortedSales =
        [...sales].reverse();


    container.innerHTML =
        sortedSales.map(sale => {

            const date =
                new Date(sale.date);


            return `

                <div class="sale-card">

                    <div class="sale-card-top">

                        <strong>
                            KSh ${formatMoney(sale.total)}
                        </strong>

                        <strong>
                            ${sale.payment}
                        </strong>

                    </div>

                    <small>
                        ${date.toLocaleString("en-KE")}
                    </small>

                    <p style="margin-top:8px">

                        ${sale.items.map(item =>
                            `${item.name} × ${item.quantity}`
                        ).join(", ")}

                    </p>

                </div>

            `;

        }).join("");
}


/* =====================================================
   REPORTS
===================================================== */

function updateReports() {

    const today =
        getTodaySales();


    const totalSales =
        today.reduce(
            (sum, sale) =>
                sum + sale.total,
            0
        );


    const totalProfit =
        today.reduce(
            (sum, sale) =>
                sum + sale.profit,
            0
        );


    const cash =
        today
            .filter(sale => sale.payment === "Cash")
            .reduce(
                (sum, sale) =>
                    sum + sale.total,
                0
            );


    const mpesa =
        today
            .filter(sale => sale.payment === "M-Pesa")
            .reduce(
                (sum, sale) =>
                    sum + sale.total,
                0
            );


    document.getElementById("reportSales")
        .textContent =
        `KSh ${formatMoney(totalSales)}`;


    document.getElementById("reportProfit")
        .textContent =
        `KSh ${formatMoney(totalProfit)}`;


    document.getElementById("reportCash")
        .textContent =
        `KSh ${formatMoney(cash)}`;


    document.getElementById("reportMpesa")
        .textContent =
        `KSh ${formatMoney(mpesa)}`;


    document.getElementById("reportTransactions")
        .textContent =
        today.length;
}


/* =====================================================
   STORAGE
===================================================== */

function saveData() {

    localStorage.setItem(
        "mumshop_products",
        JSON.stringify(products)
    );


    localStorage.setItem(
        "mumshop_sales",
        JSON.stringify(sales)
    );
}


/* =====================================================
   HELPERS
===================================================== */

function getTodaySales() {

    const today =
        new Date().toDateString();


    return sales.filter(sale => {

        return new Date(sale.date)
            .toDateString() === today;

    });
}


function formatMoney(number) {

    return Number(number).toLocaleString("en-KE");
          }
// Register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("MumShop is ready for offline use.");
            })
            .catch(error => {
                console.error("Service Worker registration failed:", error);
            });
    });
}
function resetShop() {
    const confirmed = confirm(
        "⚠️ RESET SHOP?\n\n" +
        "This will permanently delete:\n" +
        "• All products and stock\n" +
        "• All sales\n" +
        "• All transaction history\n" +
        "• All dashboard records\n\n" +
        "This cannot be undone.\n\n" +
        "Are you sure?"
    );

    if (!confirmed) {
        return;
    }

    // Clear all shop data
    localStorage.removeItem("products");
    localStorage.removeItem("sales");

    // Reset app variables
    products = [];
    sales = [];
    cart = [];

    // Refresh the app
    displayProducts();
    displayProductsForSale();
    displayCart();
    updateDashboard();
    displayLowStock();
    displaySalesHistory();
    updateReports();

    alert("✅ Shop has been reset successfully.");
    
    // Return to Home
    showPage("home");
}
