document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const applyFiltersButton = document.getElementById('applyFilters');

    // --- Variables y Configuración Inicial ---
    const STORAGE_KEY = 'tenkiStatsConfig';
    const CHART_CONFIG = {
        main: null,
        distribution: null,
        labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 31'],
        data: {
            clicks: [15000, 22000, 30000, 45000, 52000, 68000, 75000],
            traffic: [5000, 7500, 10000, 12500, 15000, 17500, 20000],
            distribution: [40, 35, 25] // Social, Search, Email
        }
    };

    // --- A. Funcionalidad del Tema (Modo Oscuro/Claro) ---

    // Cargar configuración de LocalStorage
    function loadConfig() {
        const config = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (config && config.theme) {
            body.className = config.theme;
        } else {
            // Predeterminado si no hay configuración
            body.className = 'theme-dark';
        }
    }

    // Guardar configuración en LocalStorage
    function saveConfig(key, value) {
        let config = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        config[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    // Toggle de Tema
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
        body.className = newTheme;
        saveConfig('theme', newTheme);
        // Chart.js necesita ser actualizado para recolorear
        if (CHART_CONFIG.main || CHART_CONFIG.distribution) {
            updateChartColors();
        }
    });

    // --- B. Lógica de Gráficos (Chart.js) ---

    function createCharts() {
        const primaryColor = getComputedStyle(body).getPropertyValue('--primary');
        const secondaryColor = getComputedStyle(body).getPropertyValue('--text-secondary');
        const borderColor = getComputedStyle(body).getPropertyValue('--border-color');

        // Configuración para el gráfico de Línea (Rendimiento Principal)
        const mainChartCtx = document.getElementById('performanceChart').getContext('2d');
        CHART_CONFIG.main = new Chart(mainChartCtx, {
            type: 'line',
            data: {
                labels: CHART_CONFIG.labels,
                datasets: [{
                    label: 'Total Clicks',
                    data: CHART_CONFIG.data.clicks,
                    borderColor: primaryColor,
                    backgroundColor: primaryColor + '40', // 25% opacidad
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Web Traffic',
                    data: CHART_CONFIG.data.traffic,
                    borderColor: secondaryColor,
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // <-- IMPORTANTE
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: borderColor },
                        ticks: { color: secondaryColor }
                    },
                    x: {
                        grid: { color: borderColor },
                        ticks: { color: secondaryColor }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: secondaryColor }
                    }
                }
            }
        });

        // Configuración para el gráfico de Dona (Distribución)
        const distributionChartCtx = document.getElementById('distributionChart').getContext('2d');
        CHART_CONFIG.distribution = new Chart(distributionChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Social Media', 'Search Ads', 'Email Marketing'],
                datasets: [{
                    data: CHART_CONFIG.data.distribution,
                    backgroundColor: [primaryColor, primaryColor + '80', primaryColor + '40'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // <-- IMPORTANTE
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: secondaryColor }
                    }
                }
            }
        });
    }

    // Actualizar colores de los gráficos al cambiar de tema
    function updateChartColors() {
        const primaryColor = getComputedStyle(body).getPropertyValue('--primary');
        const secondaryColor = getComputedStyle(body).getPropertyValue('--text-secondary');
        const borderColor = getComputedStyle(body).getPropertyValue('--border-color');

        if (CHART_CONFIG.main) {
            CHART_CONFIG.main.data.datasets[0].borderColor = primaryColor;
            CHART_CONFIG.main.data.datasets[0].backgroundColor = primaryColor + '40';
            CHART_CONFIG.main.data.datasets[1].borderColor = secondaryColor;
            CHART_CONFIG.main.options.scales.y.grid.color = borderColor;
            CHART_CONFIG.main.options.scales.x.grid.color = borderColor;
            CHART_CONFIG.main.options.scales.y.ticks.color = secondaryColor;
            CHART_CONFIG.main.options.scales.x.ticks.color = secondaryColor;
            CHART_CONFIG.main.options.plugins.legend.labels.color = secondaryColor;
            CHART_CONFIG.main.update();
        }

        if (CHART_CONFIG.distribution) {
            CHART_CONFIG.distribution.data.datasets[0].backgroundColor = [primaryColor, primaryColor + '80', primaryColor + '40'];
            CHART_CONFIG.distribution.options.plugins.legend.labels.color = secondaryColor;
            CHART_CONFIG.distribution.update();
        }
    }

    // --- C. Lógica de Filtros y Actualización de Métricas ---

    function updateKpiValues(clicks, traffic, conversion) {
        document.getElementById('kpi-clicks').textContent = clicks.toLocaleString();
        document.getElementById('kpi-traffic').textContent = traffic.toLocaleString();
        document.getElementById('kpi-conversion').textContent = `${conversion.toFixed(1)}%`;
    }
    
    applyFiltersButton.addEventListener('click', () => {
        const campaignType = document.getElementById('campaignType').value;
        
        let multiplier = 1;
        if (campaignType === 'social') multiplier = 1.2;
        if (campaignType === 'search') multiplier = 0.9;
        if (campaignType === 'email') multiplier = 0.7;

        // Simular nuevos valores KPI
        const newClicks = Math.floor(CHART_CONFIG.data.clicks.reduce((a, b) => a + b, 0) * multiplier / 7);
        const newTraffic = Math.floor(CHART_CONFIG.data.traffic.reduce((a, b) => a + b, 0) * multiplier / 7);
        const newConversion = (4.2 * multiplier / 1.1);

        updateKpiValues(newClicks, newTraffic, newConversion);

        // Actualizar datos del gráfico principal (simulación)
        CHART_CONFIG.main.data.datasets[0].data = CHART_CONFIG.data.clicks.map(d => Math.floor(d * multiplier));
        CHART_CONFIG.main.data.datasets[1].data = CHART_CONFIG.data.traffic.map(d => Math.floor(d * multiplier));
        CHART_CONFIG.main.update();

        // Guardar la preferencia de filtro en LocalStorage
        saveConfig('lastFilter', campaignType);
        alert(`Dashboard Updated! Filter: ${campaignType}. Preference saved.`);
    });

    // --- Inicialización ---
    function initializeDashboard() {
        loadConfig(); // Cargar tema
        
        // Cargar último filtro usado
        const config = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (config && config.lastFilter) {
            document.getElementById('campaignType').value = config.lastFilter;
        }
        
        createCharts(); // Crear gráficos
        
        // Simular clic para cargar datos iniciales con el filtro guardado
        // (Retrasar ligeramente para asegurar que el tema esté cargado)
        setTimeout(() => {
            applyFiltersButton.click(); 
        }, 50); 
    }

    initializeDashboard();
});
