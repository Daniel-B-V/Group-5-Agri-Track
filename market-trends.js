document.addEventListener('DOMContentLoaded', function() {
  // Enhanced data with more common Philippine crops and 2025 dates
  const sampleData = {
    prices: [
      { crop: "Rice", price: "₱24.30", change: "+0.8%", changeType: "up", source: "NFA", updated: "2025-06-15 10:30" },
      { crop: "Corn", price: "₱10.20", change: "-1.2%", changeType: "down", source: "DA Philippines", updated: "2025-06-15 10:30" },
      { crop: "Coconut", price: "₱18.50", change: "+3.2%", changeType: "up", source: "PCA", updated: "2025-06-15 09:45" },
      { crop: "Banana", price: "₱12.75", change: "+1.5%", changeType: "up", source: "Local Market", updated: "2025-06-15 09:30" },
      { crop: "Sugar Cane", price: "₱8.40", change: "-0.5%", changeType: "down", source: "SRA", updated: "2025-06-15 10:15" },
      { crop: "Pineapple", price: "₱16.80", change: "+2.1%", changeType: "up", source: "DA Philippines", updated: "2025-06-15 10:00" },
      { crop: "Sweet Potato", price: "₱9.60", change: "+4.2%", changeType: "up", source: "Local Market", updated: "2025-06-15 09:15" },
      { crop: "Mango", price: "₱35.20", change: "-2.3%", changeType: "down", source: "DA Philippines", updated: "2025-06-15 10:45" },
      { crop: "Cassava", price: "₱7.90", change: "+1.0%", changeType: "up", source: "Local Market", updated: "2025-06-15 09:20" },
      { crop: "Eggplant", price: "₱18.30", change: "-1.6%", changeType: "down", source: "Local Market", updated: "2025-06-15 09:40" },
      { crop: "Tomatoes", price: "₱22.10", change: "-3.2%", changeType: "down", source: "Local Market", updated: "2025-06-15 09:45" },
      { crop: "Calamansi", price: "₱15.40", change: "+2.7%", changeType: "up", source: "Local Market", updated: "2025-06-15 09:50" },
      { crop: "Garlic", price: "₱28.90", change: "+5.8%", changeType: "up", source: "DA Philippines", updated: "2025-06-15 10:20" },
      { crop: "Onion", price: "₱32.60", change: "-4.1%", changeType: "down", source: "DA Philippines", updated: "2025-06-15 10:25" },
      { crop: "Coffee", price: "₱120.50", change: "+1.2%", changeType: "up", source: "DA Philippines", updated: "2025-06-15 10:35" },
      { crop: "Cacao", price: "₱85.30", change: "+2.5%", changeType: "up", source: "DA Philippines", updated: "2025-06-15 10:40" },
      { crop: "Abaca", price: "₱45.80", change: "+0.3%", changeType: "up", source: "PhilFIDA", updated: "2025-06-15 10:50" },
      { crop: "Palay", price: "₱21.40", change: "+0.5%", changeType: "up", source: "NFA", updated: "2025-06-15 10:55" }
    ],
    trends: {
      "Rice": [24.0, 24.1, 24.2, 24.2, 24.3, 24.3, 24.3],
      "Corn": [10.3, 10.2, 10.2, 10.1, 10.2, 10.2, 10.2],
      "Coconut": [17.9, 18.0, 18.1, 18.3, 18.4, 18.5, 18.5],
      "Banana": [12.5, 12.6, 12.6, 12.7, 12.7, 12.7, 12.75],
      "Sugar Cane": [8.45, 8.44, 8.43, 8.42, 8.41, 8.40, 8.40],
      "Pineapple": [16.5, 16.5, 16.6, 16.7, 16.8, 16.8, 16.8],
      "Sweet Potato": [9.2, 9.3, 9.4, 9.5, 9.5, 9.6, 9.6],
      "Mango": [36.0, 35.8, 35.7, 35.5, 35.4, 35.3, 35.2],
      "Cassava": [7.8, 7.8, 7.9, 7.9, 7.9, 7.9, 7.9],
      "Eggplant": [18.6, 18.5, 18.4, 18.4, 18.3, 18.3, 18.3],
      "Tomatoes": [22.8, 22.6, 22.5, 22.3, 22.2, 22.1, 22.1],
      "Calamansi": [15.0, 15.1, 15.2, 15.3, 15.4, 15.4, 15.4],
      "Garlic": [27.3, 27.7, 28.0, 28.3, 28.6, 28.8, 28.9],
      "Onion": [34.0, 33.7, 33.4, 33.1, 32.8, 32.7, 32.6],
      "Coffee": [119.0, 119.3, 119.6, 119.9, 120.2, 120.4, 120.5],
      "Cacao": [83.2, 83.7, 84.2, 84.6, 85.0, 85.2, 85.3],
      "Abaca": [45.7, 45.7, 45.7, 45.8, 45.8, 45.8, 45.8],
      "Palay": [21.3, 21.3, 21.3, 21.4, 21.4, 21.4, 21.4]
    }
  };

  let currentChart = null;
  let selectedCrop = "Rice";

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
        const variation = Math.sin(i/3) * (baseValue * 0.05) + Math.random() * (baseValue * 0.02); // Add some randomness
        return parseFloat((baseValue + variation).toFixed(2));
      });
      labels = Array.from({length: 30}, (_, i) => {
        const date = new Date(2025, 4, 16 + i); // Starting from May 16, 2025
        return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      });
    } else if (period === "90d") {
      // Generate 90 days of data with seasonal variation
      dataPoints = Array.from({length: 90}, (_, i) => {
        const baseValue = sampleData.trends[crop][0];
        const seasonalVar = Math.sin(i/15) * (baseValue * 0.1); // Seasonal variation
        const randomVar = (Math.random() - 0.5) * (baseValue * 0.02); // Small random variation
        return parseFloat((baseValue + seasonalVar + randomVar).toFixed(2));
      });
      labels = Array.from({length: 90}, (_, i) => {
        const date = new Date(2025, 3, 16 + i); // Starting from April 16, 2025
        return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      });
    } else {
      // 7 days
      dataPoints = [...sampleData.trends[crop]];
      labels = Array.from({length: 7}, (_, i) => {
        const date = new Date(2025, 5, 9 + i); // Starting from June 9, 2025
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
          enabled: true,
          type: 'x',
          autoScaleYaxis: true
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
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
          fontSize: '16px',
          fontWeight: 500
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
          rotate: period === "90d" ? -45 : 0,
          style: {
            fontSize: '12px'
          }
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
      },
      colors: ['#00897B']
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
    // Add slight random variations to prices to simulate real-time updates
    sampleData.prices.forEach(item => {
      const currentPrice = parseFloat(item.price.replace('₱', ''));
      const randomChange = (Math.random() - 0.5) * 0.3; // Random change between -0.15 and +0.15
      const newPrice = (currentPrice + randomChange).toFixed(2);
      const percentChange = ((newPrice / currentPrice - 1) * 100).toFixed(1);
      
      item.price = '₱' + newPrice;
      item.change = (percentChange >= 0 ? '+' : '') + percentChange + '%';
      item.changeType = percentChange > 0 ? 'up' : (percentChange < 0 ? 'down' : 'neutral');
      item.updated = new Date().toLocaleString('en-PH');
    });
    
    loadPriceData(sampleData.prices);
    updateTrendsChart(selectedCrop, document.querySelector('.chart-toggle .toggle-btn.active').dataset.period);
    showNotification("Market data refreshed successfully", "success");
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
      
      // Highlight the selected row
      document.querySelectorAll('#priceData tr').forEach(r => r.classList.remove('selected-row'));
      row.classList.add('selected-row');
      
      updateTrendsChart(cropName, period);
    }
  });

  // Initialize the page
  loadPriceData(sampleData.prices);
  updateTrendsChart();
  
  // Add tooltip to explain the refresh button
  const refreshBtn = document.getElementById('refreshData');
  if (refreshBtn) {
    refreshBtn.setAttribute('title', 'Get latest market data');
  }
});

// Helper function to show notifications
function showNotification(message, type = "info") {
  // Create a notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-message">${message}</span>
    <span class="notification-close material-icons-outlined">close</span>
  `;
  
  // Append to body
  document.body.appendChild(notification);
  
  // Show with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
  
  // Allow manual close
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}

// Make sure these functions are available globally
function openSidebar() {
const sidebar = document.getElementById("sidebar");
const menuIcon = document.querySelector('.menu-icon');

sidebar.classList.add("sidebar-responsive");

// Hide the menu icon when sidebar is open
if (menuIcon) {
  menuIcon.style.display = "none";
}
}

function closeSidebar() {
const sidebar = document.getElementById("sidebar");
const menuIcon = document.querySelector('.menu-icon');

sidebar.classList.remove("sidebar-responsive");

// Show the menu icon again when sidebar is closed
if (menuIcon) {
  menuIcon.style.display = "inline";
}
}