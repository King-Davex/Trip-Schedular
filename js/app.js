// Market Trip Scheduler - Main Application Logic

// Dark Mode Toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    // Check for saved preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.classList.toggle('dark', currentTheme === 'dark');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            const newTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Shopping List Functionality
class ShoppingList {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.loadItems();
        this.attachEventListeners();
    }

    loadItems() {
        const savedItems = localStorage.getItem('shoppingItems');
        if (savedItems) {
            this.items = JSON.parse(savedItems);
        }
    }

    saveItems() {
        localStorage.setItem('shoppingItems', JSON.stringify(this.items));
    }

    addItem(name, priority = 'general') {
        const item = {
            id: Date.now(),
            name: name,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.items.push(item);
        this.saveItems();
        return item;
    }

    toggleItem(id) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveItems();
        }
    }

    deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.saveItems();
    }

    attachEventListeners() {
        // Attach checkbox listeners
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemElement = e.target.closest('.group');
                if (itemElement) {
                    itemElement.classList.toggle('opacity-50', e.target.checked);
                }
            });
        });
    }
}

// Trip Timeline Management
class TripTimeline {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
    }

    addStep(time, title, description) {
        this.steps.push({ time, title, description });
    }

    updateCurrentStep(stepIndex) {
        this.currentStep = stepIndex;
        this.highlightCurrentStep();
    }

    highlightCurrentStep() {
        // Visual feedback for current step
        console.log(`Current step: ${this.currentStep}`);
    }
}

// Trip Summary Calculator
class TripSummary {
    constructor() {
        this.estimatedTime = 0;
        this.stops = 0;
        this.efficiencyScore = 0;
    }

    calculate(tripData) {
        // Calculate estimated time based on trip steps
        this.estimatedTime = tripData.steps.reduce((total, step) => {
            return total + (step.duration || 0);
        }, 0);

        // Count stops
        this.stops = tripData.stops || 1;

        // Calculate efficiency score (0-100)
        this.efficiencyScore = this.calculateEfficiency(tripData);

        return {
            estimatedTime: this.formatTime(this.estimatedTime),
            stops: this.stops,
            efficiencyScore: this.efficiencyScore
        };
    }

    calculateEfficiency(tripData) {
        // Simple efficiency calculation based on time optimization
        const idealTime = 90; // 1.5 hours in minutes
        const actualTime = this.estimatedTime;
        const efficiency = Math.max(0, Math.min(100, (idealTime / actualTime) * 100));
        return Math.round(efficiency);
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
}

// Notification System
class NotificationSystem {
    constructor() {
        this.notifications = [];
    }

    addNotification(type, title, message) {
        const notification = {
            id: Date.now(),
            type: type, // 'warning', 'info', 'success', 'error'
            title: title,
            message: message,
            timestamp: new Date()
        };
        this.notifications.push(notification);
        this.display(notification);
    }

    display(notification) {
        console.log(`[${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}`);
        // In a real app, this would create a toast notification
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode
    initDarkMode();

    // Initialize shopping list
    const shoppingList = new ShoppingList();

    // Initialize trip timeline
    const tripTimeline = new TripTimeline();

    // Initialize notification system
    const notifications = new NotificationSystem();

    // Add sample notification
    notifications.addNotification(
        'warning',
        'Peak Traffic Alert',
        'Heavy congestion expected on Main St between 5:00 PM and 6:30 PM.'
    );

    console.log('Market Trip Scheduler initialized successfully!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ShoppingList,
        TripTimeline,
        TripSummary,
        NotificationSystem
    };
}
