/**
 * Market Trip Scheduling Engine
 * Role: Compute, optimize, and explain market trips using constraints.
 * Implements the functional prompt provided by the user.
 */
class MarketTripEngine {
    constructor() {
        this.DEFAULT_CHECKOUT_BUFFER = 10;
    }

    /**
     * Primary Objective: Generate an optimized market trip plan.
     * @param {Object} input - Input data following the specification.
     */
    planTrip(input) {
        const {
            currentTime,
            totalFreeTimeMinutes,
            travelTimeToMarketMinutes,
            travelTimeFromMarketMinutes,
            essentialItems,
            optionalItems,
            averageCheckoutMinutes = this.DEFAULT_CHECKOUT_BUFFER,
            peakTrafficWindows
        } = input;

        // 1. Time Budget Calculation
        const roundTripTime = travelTimeToMarketMinutes + travelTimeFromMarketMinutes;
        const overheadTime = roundTripTime + averageCheckoutMinutes;
        let remainingShoppingTime = totalFreeTimeMinutes - overheadTime;

        const plannedEssentials = [];
        const plannedOptionals = [];
        let usedShoppingMinutes = 0;

        // Prioritize essential items
        for (const item of essentialItems) {
            if (usedShoppingMinutes + item.estimatedMinutes <= remainingShoppingTime) {
                plannedEssentials.push({ ...item, status: false });
                usedShoppingMinutes += item.estimatedMinutes;
            } else {
                // Essential items cannot be dropped unless impossible
                // In a real app, this would trigger the fallback
            }
        }

        // Drop optional items first if time is insufficient
        for (const item of optionalItems) {
            if (usedShoppingMinutes + item.estimatedMinutes <= remainingShoppingTime) {
                plannedOptionals.push({ ...item, status: false });
                usedShoppingMinutes += item.estimatedMinutes;
            }
        }

        // 2. Traffic Awareness
        let trafficWarning = null;
        let efficiencyDeduction = 0;
        const arrivalAtMarket = this._addMinutes(currentTime, travelTimeToMarketMinutes);
        const departureFromMarket = this._addMinutes(arrivalAtMarket, usedShoppingMinutes + averageCheckoutMinutes);
        const arrivalHome = this._addMinutes(departureFromMarket, travelTimeFromMarketMinutes);

        peakTrafficWindows.forEach(window => {
            if (this._isTimeBetween(departureFromMarket, window.start, window.end) ||
                this._isTimeBetween(arrivalHome, window.start, window.end)) {
                trafficWarning = {
                    type: "traffic",
                    severity: "warning",
                    message: `Heavy congestion expected between ${this._formatTime12h(window.start)} and ${this._formatTime12h(window.end)}.`
                };
                efficiencyDeduction += 15;
            }
        });

        // 3. Step Generation (Strict Output Format A)
        const steps = [
            {
                time: this._formatTime12h(currentTime),
                title: "Depart Office",
                description: `Commute to market (${travelTimeToMarketMinutes} mins)`
            },
            {
                time: `${this._formatTime12h(arrivalAtMarket)} – ${this._formatTime12h(this._addMinutes(arrivalAtMarket, usedShoppingMinutes))}`,
                title: "Grocery Shopping",
                description: plannedOptionals.length < optionalItems.length ? "Essential items prioritized (Time limited)" : "Essential items prioritized"
            },
            {
                time: this._formatTime12h(this._addMinutes(arrivalAtMarket, usedShoppingMinutes)),
                title: "Checkout & Loading",
                description: `Estimated wait time: ${averageCheckoutMinutes} mins`
            },
            {
                time: this._formatTime12h(departureFromMarket),
                title: "Return Home",
                description: `Expected arrival: ${this._formatTime12h(arrivalHome)}`
            }
        ];

        // 4. Shopping List Structuring (Strict Output Format B)
        const shoppingList = {
            highPriority: plannedEssentials.map(i => ({ name: i.name, status: false })),
            generalItems: plannedOptionals.map(i => ({ name: i.name, status: false }))
        };

        // 5. Efficiency Score (Strict Output Format C & D)
        const timeUtilization = (usedShoppingMinutes + overheadTime) / totalFreeTimeMinutes;
        let efficiencyScore = 100 - efficiencyDeduction;
        if (timeUtilization > 0.9) efficiencyScore -= 5;
        if (plannedOptionals.length < optionalItems.length) efficiencyScore -= 10;
        efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

        return {
            steps,
            shoppingList,
            summary: {
                estimatedTotalTime: this._formatDuration(usedShoppingMinutes + overheadTime),
                numberOfStops: 1,
                efficiencyScore: Math.round(efficiencyScore)
            },
            alerts: trafficWarning ? [trafficWarning] : []
        };
    }

    // Helper methodologies
    _addMinutes(timeStr, minutes) {
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + minutes, 0);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    _isTimeBetween(check, start, end) {
        const c = check.replace(':', '');
        const s = start.replace(':', '');
        const e = end.replace(':', '');
        return c >= s && c <= e;
    }

    _formatTime12h(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    _formatDuration(totalMinutes) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
}

// Export for application use
window.MarketTripEngine = MarketTripEngine;
