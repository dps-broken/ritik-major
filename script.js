document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('carbonForm');
    const resultsSection = document.getElementById('resultsSection');
    const breakdownList = document.getElementById('breakdownList');
    const suggestionsList = document.getElementById('suggestionsList');
    const totalFootprintEl = document.getElementById('totalFootprint');

    const EMISSION_VALUES = {
        trans: {
            car: 0.280,
            bus: 0.098,
            train: 0.049,
            rickshaw: 0.025,
            bike: 0.113,
            flight: 0.112,
            cyclewalk: 0
        },
        electricity: 0.395,
        diet: { 1: 6.5, 2: 4.9, 3: 3.7, 4: 3.1 },
        water: 0.014,
        waste: 0.590,
        smoking: 0.028
    };

    // Smoking input toggle
    document.querySelectorAll('input[name="smokingStatus"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const cigarettesInput = document.querySelector('input[name="cigarettes"]');
            cigarettesInput.disabled = e.target.value === 'no';
            if (e.target.value === 'no') cigarettesInput.value = '';
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateCarbonFootprint();
    });

    function calculateCarbonFootprint() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Transportation footprint
        const transModes = ['car', 'bus', 'train', 'rickshaw', 'bike', 'flight', 'cyclewalk'];
        const transFootprint = transModes.reduce((total, mode) => 
            total + (parseFloat(data[mode]) * EMISSION_VALUES.trans[mode] * 4), 0);

        // Other footprints
        const electricityFootprint = parseFloat(data.electricity) * EMISSION_VALUES.electricity;
        const dietFootprint = EMISSION_VALUES.diet[data.diet] * 30;
        const waterFootprint = parseFloat(data.water) * EMISSION_VALUES.water * 30;
        const wasteFootprint = parseFloat(data.waste) * EMISSION_VALUES.waste * 4;
        
        let smokingFootprint = 0;
        if (data.smokingStatus === 'yes' && data.cigarettes) {
            smokingFootprint = parseFloat(data.cigarettes) * EMISSION_VALUES.smoking * 30;
        }

        const totalFootprint = transFootprint + electricityFootprint + 
            dietFootprint + waterFootprint + wasteFootprint + smokingFootprint;

        displayResults({
            transportation: transFootprint,
            electricity: electricityFootprint,
            diet: dietFootprint,
            water: waterFootprint,
            waste: wasteFootprint,
            smoking: smokingFootprint,
            total: totalFootprint
        });
    }

    function displayResults(footprints) {
        // Clear previous results
        breakdownList.innerHTML = '';
        suggestionsList.innerHTML = '';
        resultsSection.classList.remove('hidden');

        // Breakdown details
        const categories = [
            { name: 'Transportation', value: footprints.transportation },
            { name: 'Electricity', value: footprints.electricity },
            { name: 'Diet', value: footprints.diet },
            { name: 'Water Usage', value: footprints.water },
            { name: 'Waste', value: footprints.waste }
        ];

        if (footprints.smoking > 0) {
            categories.push({ name: 'Smoking', value: footprints.smoking });
        }

        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="bg-slate-800 p-3 rounded-lg">
                    <span class="font-semibold text-primary-color">${cat.name}:</span> 
                    <span class="text-white">${cat.value.toFixed(2)} kg CO2</span>
                </div>
            `;
            breakdownList.appendChild(li);
        });

        totalFootprintEl.innerHTML = `Total Monthly Carbon Footprint: ${footprints.total.toFixed(2)} kg CO2`;

        // Suggestions
        const suggestions = generateSuggestions(footprints);
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="bg-slate-800 p-3 rounded-lg">
                    <span class="text-primary-color mr-2">🍃</span>
                    <span class="text-white">${suggestion}</span>
                </div>
            `;
            suggestionsList.appendChild(li);
        });

        // Charts
        createCharts(categories);
    }

    function generateSuggestions(footprints) {
        const suggestions = [];

        if (footprints.transportation > 335) {
            suggestions.push("Opt for public transportation, share rides through carpooling, use a cycle or walk through short distances.");
        }
        if (footprints.electricity > 100) {
            suggestions.push("Switch to energy-efficient appliances, power off unused devices, and explore renewable energy options.");
        }
        if (footprints.diet > 155) {
            suggestions.push("Consider reducing meat consumption and shifting towards a vegetarian or vegan diet.");
        }
        if (footprints.water > 1700) {
            suggestions.push("Minimize water usage by using a bucket, fixing leaks, and installing water-saving fixtures.");
        }
        if (footprints.waste > 80) {
            suggestions.push("Embrace recycling, practice composting, and minimize waste generation.");
        }
        if (footprints.smoking > 35) {
            suggestions.push("Consider reducing or quitting smoking for both health and environmental benefits.");
        }

        if (suggestions.length === 0) {
            suggestions.push("Congratulations! You are doing great for the environment by keeping your carbon footprint in check.");
        }

        return suggestions;
    }

    function createCharts(categories) {
        const values = categories.map(cat => cat.value);
        const labels = categories.map(cat => cat.name);

        // Color Palette
        const colors = [
            'rgba(74, 222, 128, 0.7)',   // Green
            'rgba(56, 189, 248, 0.7)',   // Blue
            'rgba(248, 113, 113, 0.7)',  // Red
            'rgba(168, 85, 247, 0.7)',   // Purple
            'rgba(249, 168, 212, 0.7)',  // Pink
            'rgba(251, 191, 36, 0.7)'    // Yellow
        ];

        // Bar Chart
        new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Carbon Footprint (kg CO2)',
                    data: values,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Monthly Carbon Footprint Breakdown',
                        color: 'white'
                    },
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });

        // Pie Chart
        new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Carbon Footprint Distribution',
                        color: 'white'
                    },
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });

        // Cumulative Line Chart
        const cumulativeValues = values.reduce((acc, curr, i) => {
            const prevSum = acc.length > 0 ? acc[acc.length - 1] : 0;
            acc.push(prevSum + curr);
            return acc;
        }, []);

        new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative Carbon Emissions',
                    data: cumulativeValues,
                    borderColor: 'rgba(74, 222, 128, 1)',
                    backgroundColor: 'rgba(74, 222, 128, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Cumulative Contribution to Carbon Footprint',
                        color: 'white'
                    },
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }
});