/**
 * MarketFlow Application Logic
 * Integrates the MarketTripEngine with the UI and handles full interactivity.
 */

class UIController {
    constructor() {
        this.engine = new MarketTripEngine();
        this.currentPlan = null;
        this.init();
    }

    init() {
        this.initDarkMode();
        this.initSidebar();
        this.initModal();
        this.initForm();
        this.loadPlan();
    }

    /**
     * Theme management
     */
    initDarkMode() {
        const toggle = document.getElementById('darkModeToggle');
        const html = document.documentElement;

        const applyTheme = (theme) => {
            html.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('theme', theme);
        };

        const currentTheme = localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        applyTheme(currentTheme);

        toggle.addEventListener('click', () => {
            const nextTheme = html.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(nextTheme);
        });
    }

    /**
     * Mobile Sidebar
     */
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const openBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('close-sidebar-btn');

        const toggleSidebar = (show) => {
            if (!sidebar || !overlay) return;

            if (show) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        };

        if (openBtn) openBtn.addEventListener('click', () => toggleSidebar(true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggleSidebar(false));
        if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));

        // Close sidebar on navigation
        if (sidebar) {
            sidebar.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => toggleSidebar(false));
            });
        }
    }

    /**
     * Modal Visibility
     */
    initModal() {
        const modal = document.getElementById('new-trip-modal');

        // Robustly find the "New Trip" button by text content or icon
        const buttons = Array.from(document.querySelectorAll('button'));
        const openBtn = buttons.find(btn =>
            btn.textContent.includes('New Trip') ||
            btn.querySelector('.material-symbols-outlined')?.textContent === 'add'
        ) || document.querySelectorAll('header button')[1];

        const closeBtns = [
            document.getElementById('close-modal-btn'),
            document.getElementById('cancel-btn'),
            modal
        ];

        if (openBtn) {
            openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
        }

        closeBtns.forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', (e) => {
                if (e.target === modal || btn !== modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }

    /**
     * Configuration Form
     */
    initForm() {
        const form = document.getElementById('trip-config-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            // Execute functionality with user-defined constraints
            const travelForOneWay = parseInt(formData.get('travelTimeMinutes')) || 15;

            const input = {
                currentTime: formData.get('currentTime'),
                totalFreeTimeMinutes: parseInt(formData.get('totalFreeTimeMinutes')),
                // Assuming return trip takes roughly same time + 5 min buffer for loading car
                travelTimeToMarketMinutes: travelForOneWay,
                travelTimeFromMarketMinutes: travelForOneWay + 5,
                essentialItems: formData.get('essentialItems').split(',').map(name => ({ name: name.trim(), estimatedMinutes: 10 })),
                optionalItems: formData.get('optionalItems').split(',').map(name => ({ name: name.trim(), estimatedMinutes: 5 })),
                averageCheckoutMinutes: 10,
                // Execute traffic logic with user-defined window
                peakTrafficWindows: [
                    {
                        start: formData.get('trafficStart') || "17:00",
                        end: formData.get('trafficEnd') || "18:30"
                    }
                ]
            };

            this.runScenario(input);
            document.getElementById('new-trip-modal').classList.add('hidden');
        });
    }

    /**
     * Optimization & Rendering
     */
    runScenario(input) {
        this.currentPlan = this.engine.planTrip(input);
        this.savePlan();
        this.renderAll();
    }

    savePlan() {
        localStorage.setItem('marketPlan', JSON.stringify(this.currentPlan));
    }

    loadPlan() {
        const saved = localStorage.getItem('marketPlan');
        if (saved) {
            this.currentPlan = JSON.parse(saved);
            this.renderAll();
        } else {
            // Default initial state if no saved plan
            this.runScenario({
                currentTime: "16:00",
                totalFreeTimeMinutes: 120,
                travelTimeToMarketMinutes: 15,
                travelTimeFromMarketMinutes: 20,
                essentialItems: [
                    { name: "Organic Whole Milk", estimatedMinutes: 10 },
                    { name: "Free-range Eggs (12pk)", estimatedMinutes: 15 }
                ],
                optionalItems: [
                    { name: "Avocados (3)", estimatedMinutes: 5 },
                    { name: "Whole Grain Sourdough", estimatedMinutes: 5 }
                ],
                averageCheckoutMinutes: 10,
                peakTrafficWindows: [{ start: "17:00", end: "18:30" }]
            });
        }
    }

    renderAll() {
        if (!this.currentPlan) return;
        this.renderSteps(this.currentPlan.steps);
        this.renderShoppingList(this.currentPlan.shoppingList);
        this.renderSummary(this.currentPlan.summary);
        this.renderAlerts(this.currentPlan.alerts);
    }

    renderSteps(steps) {
        const container = document.getElementById('trip-steps-container');
        container.innerHTML = steps.map((step, index) => {
            const isFirst = index === 0;
            const dotClass = isFirst ? 'bg-primary' : (index === 1 ? 'bg-secondary' : (index === 2 ? 'bg-poolhouse' : 'bg-tidewater'));

            return `
                <div class="relative pl-8 animate-in slide-in-from-left duration-300" style="animation-delay: ${index * 100}ms">
                    <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 ${dotClass} z-10 flex items-center justify-center">
                        ${isFirst ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
                    </div>
                    <div>
                        <p class="text-xs font-bold text-secondary uppercase">${step.time}</p>
                        <p class="font-semibold text-slate-800 dark:text-white">${step.title}</p>
                        <p class="text-sm text-slate-500">${step.description}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderShoppingList(list) {
        const highPriorityContainer = document.getElementById('high-priority-list');
        const generalContainer = document.getElementById('general-items-list');

        const createItemHTML = (item, type) => {
            const isHigh = type === 'high';
            const baseClass = isHigh ? 'bg-primary/5 border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent';

            return `
                <div class="group flex items-center justify-between p-3 rounded-xl border transition-all ${baseClass} ${item.status ? 'opacity-50' : ''}">
                    <div class="flex items-center gap-3">
                        <input class="w-5 h-5 rounded ${isHigh ? 'border-primary text-primary' : 'border-slate-300 dark:border-slate-600 text-secondary'} focus:ring-opacity-20 transition-all cursor-pointer" 
                               type="checkbox" 
                               ${item.status ? 'checked' : ''} 
                               onchange="app.toggleItem('${type}', '${item.name}')"/>
                        <span class="font-medium ${item.status ? 'line-through text-slate-400' : ''}">${item.name}</span>
                    </div>
                    ${isHigh ? '<span class="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Essential</span>' :
                    '<span class="material-symbols-outlined text-slate-300 group-hover:text-slate-400 cursor-move">drag_indicator</span>'}
                </div>
            `;
        };

        highPriorityContainer.innerHTML = list.highPriority.map(i => createItemHTML(i, 'high')).join('');
        generalContainer.innerHTML = list.generalItems.map(i => createItemHTML(i, 'general')).join('');
    }

    toggleItem(type, name) {
        const targetList = type === 'high' ? this.currentPlan.shoppingList.highPriority : this.currentPlan.shoppingList.generalItems;
        const item = targetList.find(i => i.name === name);
        if (item) {
            item.status = !item.status;
            this.savePlan();
            this.renderShoppingList(this.currentPlan.shoppingList); // Partial render for speed
        }
    }

    renderSummary(summary) {
        document.getElementById('summary-total-time').innerText = summary.estimatedTotalTime;
        document.getElementById('summary-stops').innerText = `${summary.numberOfStops} Market`;

        const effElement = document.getElementById('summary-efficiency');
        effElement.innerText = `${summary.efficiencyScore}%`;

        // Visual indicator of efficiency
        effElement.className = `text-xl font-display font-bold ${summary.efficiencyScore > 80 ? 'text-white' : 'text-amber-200'}`;
    }

    renderAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        if (!alerts || alerts.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top duration-500">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-500">warning</span>
                    <div>
                        <h4 class="font-bold text-amber-900 dark:text-amber-200 text-sm">Peak Traffic Alert</h4>
                        <p class="text-sm text-amber-800 dark:text-amber-400 mt-1">${alert.message}</p>
                        <button class="mt-3 text-xs font-bold text-amber-900 dark:text-amber-300 underline underline-offset-4 decoration-amber-400/50 hover:text-amber-600 transition-colors">View reroute options</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UIController();
});
