document.addEventListener('DOMContentLoaded', function() {
    // Sample data with 2025 dates and PHP prices
    const sampleData = {
      prices: [
        { crop: "Wheat", price: "₱14.50", change: "+2.5%", changeType: "up", source: "DA Philippines", updated: "2025-06-15 10:30" },
        { crop: "Corn", price: "₱10.20", change: "-1.2%", changeType: "down", source: "DA Philippines", updated: "2025-06-15 10:30" },
        { crop: "Soybeans", price: "₱18.75", change: "0%", changeType: "neutral", source: "DA Philippines", updated: "2025-06-15 10:30" },
        { crop: "Rice", price: "₱24.30", change: "+0.8%", changeType: "up", source: "NFA", updated: "2025-06-15 10:30" },
        { crop: "Potatoes", price: "₱8.90", change: "+5.1%", changeType: "up", source: "Local Market", updated: "2025-06-15 09:45" },
        { crop: "Tomatoes", price: "₱22.10", change: "-3.2%", changeType: "down", source: "Local Market", updated: "2025-06-15 09:45" }
      ],
      trends: {
        "Wheat": [14.0, 14.2, 14.3, 14.4, 14.5, 14.5, 14.5],
        "Corn": [10.3, 10.2, 10.2, 10.1, 10.2, 10.2, 10.2],
        "Sojabeans": [18.7, 18.7, 18.7, 18.7, 18.7, 18.7, 18.7],
        "Rice": [24.0, 24.1, 24.2, 24.2, 24.3, 24.3, 24.3],
        "Potatoes": [8.5, 8.6, 8.7, 8.8, 8.9, 8.9, 8.9],
        "Tomatoes": [22.8, 22.6, 22.5, 22.3, 22.2, 22.1, 22.1]
      }
    };
  
    let currentChart = null;
    let selectedCrop = "Wheat";
  
    // Load price data into the table
    function loadPriceData(data) {
      const tableBody = document.getElementById('priceData');
      tableBody.innerHTML = '';
      
      data.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.crop = item.crop;
        
        row.innerHTML = `
          <td>${item.crop}</td>
          <td>${item.price}</td>
          <td class="price-${item.changeType}">${item.change}</td>
          <td>${item.source}</td>
          <td>${item.updated}</td>
        `;
        
        tableBody.appendChild(row);
      });
    }
  
    // Initialize or update the trends chart
    function updateTrendsChart(crop = selectedCrop, period = "7d") {
      selectedCrop = crop;
      
      // Determine how many data points to show based on period
      let dataPoints, labels;
      
      if (period === "30d") {
        // Generate 30 days of data with some variation
        dataPoints = Array.from({length: 30}, (_, i) => {
          const baseValue = sampleData.trends[crop][0];
          const variation = Math.sin(i/3) * (baseValue * 0.05); // Small variation
          return parseFloat((baseValue + variation).toFixed(2));
        });
        labels = Array.from({length: 30}, (_, i) => `${i+1} Jun`);
      } else if (period === "90d") {
        // Generate 90 days of data with seasonal variation
        dataPoints = Array.from({length: 90}, (_, i) => {
          const baseValue = sampleData.trends[crop][0];
          const seasonalVar = Math.sin(i/15) * (baseValue * 0.1); // Seasonal variation
          const randomVar = (Math.random() - 0.5) * (baseValue * 0.02); // Small random variation
          return parseFloat((baseValue + seasonalVar + randomVar).toFixed(2));
        });
        labels = Array.from({length: 90}, (_, i) => {
          const date = new Date(2025, 5, i+1); // June 2025
          return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
        });
      } else {
        // 7 days
        dataPoints = [...sampleData.trends[crop]];
        labels = Array.from({length: 7}, (_, i) => {
          const date = new Date(2025, 5, 15 + i); // Starting from June 15, 2025
          return date.toLocaleDateString('en-PH', { weekday: 'short' });
        });
      }
      
      const options = {
        series: [{
          name: "Price (₱)",
          data: dataPoints
        }],
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
          animations: {
            enabled: false // Disable animations to prevent chart jumping
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        title: {
          text: `${crop} Price Trend`,
          align: 'left',
          style: {
            fontSize: '16px'
          }
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          },
        },
        xaxis: {
          categories: labels,
          labels: {
            rotate: period === "90d" ? -45 : 0
          }
        },
        yaxis: {
          title: {
            text: 'Price per kg (₱)'
          },
          labels: {
            formatter: function(value) {
              return '₱' + value.toFixed(2);
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(value) {
              return '₱' + value.toFixed(2);
            }
          }
        }
      };
      
      if (currentChart) {
        currentChart.destroy();
      }
      
      currentChart = new ApexCharts(document.querySelector("#trends-chart"), options);
      currentChart.render();
    }
  
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', function() {
      const searchTerm = document.getElementById('cropSearch').value.toLowerCase();
      const filteredData = sampleData.prices.filter(item => 
        item.crop.toLowerCase().includes(searchTerm)
      );
      loadPriceData(filteredData);
    });
  
    // Handle Enter key in search
    document.getElementById('cropSearch').addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
      }
    });
  
    // Refresh data button
    document.getElementById('refreshData').addEventListener('click', function() {
      loadPriceData(sampleData.prices);
      updateTrendsChart(selectedCrop, document.querySelector('.chart-toggle .toggle-btn.active').dataset.period);
      showNotification("Market data refreshed", "success");
    });
  
    // Chart period toggle buttons
    document.querySelectorAll('.chart-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.chart-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        updateTrendsChart(selectedCrop, this.dataset.period);
        
        // Scroll to chart (smoothly) without jumping to bottom
        document.querySelector('#trends-chart').scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      });
    });
  
    // Table row click to show that crop's trend
    document.getElementById('priceData').addEventListener('click', function(e) {
      const row = e.target.closest('tr');
      if (row) {
        const cropName = row.dataset.crop;
        const period = document.querySelector('.chart-toggle .toggle-btn.active').dataset.period;
        updateTrendsChart(cropName, period);
      }
    });
  
    // Initialize the page
    loadPriceData(sampleData.prices);
    updateTrendsChart();
  });
  
  // Helper function to show notifications
  function showNotification(message, type = "info") {
    // You can implement this using your existing notification system
    console.log(`[${type}] ${message}`);
  }