// ==========================================
// 1. MODEL LAYER (Formerly store.js)
// ==========================================
class AssetStore {
    constructor() {
        this.items = [
            { id: "SKU-8821", name: "Compute Node Rack Gen 3", category: "Hardware", price: 1200.00, qty: 8 },
            { id: "SKU-4412", name: "Virtual Firewall License", category: "Software", price: 450.00, qty: 0 }
        ];
        this.subscribers = [];
    }

    getItems() {
        return [...this.items];
    }

    addItem(data) {
        const newItem = {
            id: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            name: data.name,
            category: data.category,
            price: parseFloat(data.price),
            qty: parseInt(data.qty, 10)
        };
        this.items.push(newItem);
        this.broadcast();
    }

    getSummaryMetrics() {
        const value = this.items.reduce((acc, current) => acc + (current.price * current.qty), 0);
        return {
            totalValue: value.toFixed(2),
            totalSkus: this.items.length
        };
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    broadcast() {
        this.subscribers.forEach(callback => callback(this.getItems()));
    }
}

// Instantiate the global data store instance
const store = new AssetStore();


// ==========================================
// 2. VIEW LAYER (Formerly ui.js)
// ==========================================
const UI = {
    renderTable(items) {
        const tbody = document.getElementById("table-body");
        tbody.innerHTML = "";

        items.forEach(item => {
            const tr = document.createElement("tr");
            const inStock = item.qty > 0;

            tr.innerHTML = `
                <td><strong>${item.id}</strong></td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>
                    <span class="pill ${inStock ? 'in' : 'out'}">
                        ${inStock ? 'Available' : 'Depleted'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    updateDashboardMetrics() {
        const metrics = store.getSummaryMetrics();
        document.getElementById("total-value").textContent = `$${metrics.totalValue}`;
        document.getElementById("total-skus").textContent = metrics.totalSkus;
    },

    toggleModalVisibility() {
        document.getElementById("form-modal").classList.toggle("hidden");
    }
};


// ==========================================
// 3. CONTROLLER LAYER (Formerly app.js)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Initial paint cycles
    UI.renderTable(store.getItems());
    UI.updateDashboardMetrics();

    // Bind reactive layout events to state updates
    store.subscribe((freshData) => {
        UI.renderTable(freshData);
        UI.updateDashboardMetrics();
    });

    // Handle structural layout clicks
    document.getElementById("open-modal").addEventListener("click", UI.toggleModalVisibility);
    document.getElementById("close-modal").addEventListener("click", UI.toggleModalVisibility);

    // Form pipeline submission
    const form = document.getElementById("asset-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const payload = {
            name: document.getElementById("name").value,
            category: document.getElementById("category").value,
            price: document.getElementById("price").value,
            qty: document.getElementById("qty").value
        };

        store.addItem(payload);
        form.reset();
        UI.toggleModalVisibility();
    });
});