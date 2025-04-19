// Data Storage and Management
const STORAGE_KEY = 'cropTrackerData';


// Check if we're on dashboard page
function shouldInitializeCharts() {
  return document.getElementById('bar-chart') && document.getElementById('area-chart');
}

// Get stored data or initialize new
function getStoredData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {
    consumed: [],
    harvest: [],
    donated: [],
    lastUpdated: new Date().toISOString()
  };
}

// Save data to localStorage
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Add item functions with dashboard updates
function addConsumedItem(crop, quantity, date = new Date()) {
  const data = getStoredData();
  data.consumed.push({
    crop,
    quantity: parseInt(quantity),
    date: date.toISOString()
  });
  saveData(data);
  
  if (shouldInitializeCharts()) updateDashboard();
  addNotification(`${quantity} ${crop} added to consumed crops!`);
}

function addHarvestItem(crop, quantity, date = new Date()) {
  const data = getStoredData();
  data.harvest.push({
    crop,
    quantity: parseInt(quantity),
    date: date.toISOString()
  });
  saveData(data);
  if (shouldInitializeCharts()) updateDashboard();
  addNotification(`Added ${quantity} ${crop} to harvest`);
}

function addDonatedItem(crop, quantity, date = new Date(), community = '', location = '') {
  const data = getStoredData();
  data.donated.push({
    crop,
    quantity: parseInt(quantity),
    date: date.toISOString(),
    community,
    location
  });
  saveData(data);
  if (shouldInitializeCharts()) updateDashboard();
  addNotification(`Donated ${quantity} ${crop} to ${community} in ${location}`);
}

// Dashboard calculations
function getTopCrops() {
  const data = getStoredData();
  const harvestMap = {};
  
  data.harvest.forEach(item => {
    harvestMap[item.crop] = (harvestMap[item.crop] || 0) + item.quantity;
  });
  
  return Object.entries(harvestMap)
    .map(([crop, quantity]) => ({ crop, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

function getMonthlySummary() {
  const data = getStoredData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = {
    harvest: Array(12).fill(0),
    consumed: Array(12).fill(0),
    donated: Array(12).fill(0)
  };
  
  data.harvest.forEach(item => {
    const month = new Date(item.date).getMonth();
    monthlyData.harvest[month] += item.quantity;
  });
  
  data.consumed.forEach(item => {
    const month = new Date(item.date).getMonth();
    monthlyData.consumed[month] += item.quantity;
  });
  
  data.donated.forEach(item => {
    const month = new Date(item.date).getMonth();
    monthlyData.donated[month] += item.quantity;
  });
  
  return {
    months: months.slice(0, new Date().getMonth() + 1),
    harvest: monthlyData.harvest.slice(0, new Date().getMonth() + 1),
    consumed: monthlyData.consumed.slice(0, new Date().getMonth() + 1),
    donated: monthlyData.donated.slice(0, new Date().getMonth() + 1)
  };
}

function calculateTotals() {
  if (!shouldInitializeCharts()) return {};
  
  const data = getStoredData();
  const harvestTotal = data.harvest.reduce((sum, item) => sum + item.quantity, 0);
  const consumedTotal = data.consumed.reduce((sum, item) => sum + item.quantity, 0);
  const donatedTotal = data.donated.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate net yield percentage
  let netYieldPercentage = 0;
  if (harvestTotal > 0) {
    const netAmount = harvestTotal - consumedTotal - donatedTotal;
    netYieldPercentage = Math.round((netAmount / harvestTotal) * 100);
  }
  
  return {
    consumedTotal,
    harvestTotal,
    donatedTotal,
    netYieldPercentage // Changed from netYield to netYieldPercentage
  };
}

// Dashboard updates
function updateDashboard() {
  if (!shouldInitializeCharts()) return;

  const totals = calculateTotals();
  
  // Update the other totals as before
  ['consumed-total', 'harvest-total', 'donated-total'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = totals[id.split('-')[0] + 'Total'] || 0;
  });
  
  // Update net yield with percentage
  const netYieldElement = document.getElementById('net-yield');
  if (netYieldElement) {
    netYieldElement.textContent = `${totals.netYieldPercentage || 0}%`;
  }

  const activeType = document.querySelector('.toggle-btn.active')?.dataset.type || 'harvest';
  updateBarChart(activeType);
  updateAreaChart();
}

// Chart functions
let barChart, areaChart;

function getTopConsumedCrops() {
  const data = getStoredData();
  const consumedMap = {};
  
  data.consumed.forEach(item => {
    consumedMap[item.crop] = (consumedMap[item.crop] || 0) + item.quantity;
  });
  
  return Object.entries(consumedMap)
    .map(([crop, quantity]) => ({ crop, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

function updateBarChart(type = 'harvest') {
  if (!barChart || !shouldInitializeCharts()) return;
  
  const topCrops = type === 'harvest' ? getTopCrops() : getTopConsumedCrops();
  barChart.updateOptions({
    series: [{ data: topCrops.map(item => item.quantity) }],
    xaxis: { categories: topCrops.map(item => item.crop) }
  });
}

function initializeChartToggle() {
  const buttons = document.querySelectorAll('.toggle-btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      updateBarChart(button.dataset.type);
    });
  });
}

function updateAreaChart() {
  if (!areaChart || !shouldInitializeCharts()) return;
  
  const monthlyData = getMonthlySummary();
  areaChart.updateOptions({
    series: [
      { name: 'Harvest', data: monthlyData.harvest },
      { name: 'Consumed', data: monthlyData.consumed },
      { name: 'Donated', data: monthlyData.donated }
    ],
    labels: monthlyData.months
  });
}

function initializeCharts() {
  if (!shouldInitializeCharts()) return;

  const topCrops = getTopCrops();
  const monthlyData = getMonthlySummary();
  
  
  if (!barChart && document.getElementById('bar-chart')) {
    barChart = new ApexCharts(document.querySelector('#bar-chart'), {
      series: [{ data: topCrops.map(item => item.quantity) }],
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      colors: ['#246dec', '#cc3c43', '#367952', '#f5b74f', '#4f35a1'],
      plotOptions: { bar: { distributed: true, borderRadius: 4, columnWidth: '40%' }},
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: { categories: topCrops.map(item => item.crop) },
      yaxis: { title: { text: 'Quantity' }}
    });
    barChart.render();
  }

  if (!areaChart && document.getElementById('area-chart')) {
    areaChart = new ApexCharts(document.querySelector('#area-chart'), {
      series: [
        { name: 'Harvest', data: monthlyData.harvest },
        { name: 'Consumed', data: monthlyData.consumed },
        { name: 'Donated', data: monthlyData.donated }
      ],
      chart: { height: 350, type: 'area', toolbar: { show: false }},
      colors: ['#4f35a1', '#246dec', '#367952'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      labels: monthlyData.months,
      markers: { size: 0 },
      yaxis: { title: { text: 'Quantity' }},
      tooltip: { shared: true, intersect: false }
    });
    areaChart.render();
  }
}

// Notification system
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let unreadCount = notifications.filter(n => !n.read).length;

function addNotification(message) {
  const newNotification = {
    id: Date.now(),
    message,
    timestamp: new Date().toISOString(),
    read: false
  };

  notifications.unshift(newNotification);
  unreadCount++;
  if (notifications.length > 50) notifications.pop();

  localStorage.setItem('notifications', JSON.stringify(notifications));
  updateNotificationBadge();
  renderNotifications();

  if (Notification.permission === 'granted') {
    new Notification('Crop Tracker', { body: message });
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    badge.textContent = unreadCount > 0 ? unreadCount : '';
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
}

function renderNotifications() {
  const list = document.getElementById('notificationList');
  if (!list) return;

  list.innerHTML = notifications.length ? 
    notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <div>${n.message}</div>
        <div class="notification-time">${formatNotificationTime(n.timestamp)}</div>
      </div>
    `).join('') : 
    '<div class="notification-item">No notifications yet</div>';
  
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => markNotificationAsRead(item.dataset.id));
  });
}

function formatNotificationTime(timestamp) {
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
  return `${Math.floor(diff / 1440)} days ago`;
}

function markNotificationAsRead(id) {
  const notification = notifications.find(n => n.id == id);
  if (notification && !notification.read) {
    notification.read = true;
    unreadCount--;
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    renderNotifications();
  }
}

function markAllNotificationsAsRead() {
  notifications.forEach(n => n.read = true);
  unreadCount = 0;
  localStorage.setItem('notifications', JSON.stringify(notifications));
  updateNotificationBadge();
  renderNotifications();
}

// Initialize page components
function initializeHeaderIcons() {
  updateNotificationBadge();
  renderNotifications();
  
  document.getElementById('markAllRead')?.addEventListener('click', markAllNotificationsAsRead);
  document.getElementById('notificationBell')?.addEventListener('click', toggleNotificationDropdown);
  document.getElementById('emailIcon')?.addEventListener('click', toggleEmailDropdown);
  document.getElementById('profileIcon')?.addEventListener('click', toggleProfileDropdown);
  
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

function toggleDropdown(dropdownId) {
  ['notificationDropdown', 'emailDropdown', 'profileDropdown'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = id === dropdownId && 
      element.style.display !== 'block' ? 'block' : 'none';
  });
}

function toggleNotificationDropdown(e) {
  e.stopPropagation();
  toggleDropdown('notificationDropdown');
}

function toggleEmailDropdown(e) {
  e.stopPropagation();
  toggleDropdown('emailDropdown');
}

function toggleProfileDropdown(e) {
  e.stopPropagation();
  toggleDropdown('profileDropdown');
}

// Initialize page
function initializePage() {
  if (shouldInitializeCharts()) {
    initializeCharts();
    updateDashboard();
    initializeChartToggle(); 
  }
  initializeHeaderIcons();
  
  document.addEventListener('click', () => {
    ['notificationDropdown', 'emailDropdown', 'profileDropdown'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });
  });
}

window.addEventListener('DOMContentLoaded', initializePage);

document.addEventListener('DOMContentLoaded', function() {
  const cropTrackerBrand = document.getElementById('cropTrackerBrand');
  const leafContainer = document.getElementById('leafContainer');
  
  // Array of leaf emojis or colors
  const leaves = [
    '🍁', // Maple leaf
    '🍂', // Fallen leaf
    '🍃', // Leaf fluttering in wind
    '🌿', // Herb
    '🌱', // Seedling
    '🌾', // Ear of rice
    '🥬'  // Leafy green
  ];
  
  // Colors for the leaves
  const colors = [
    '#e67e22', // Pumpkin
    '#e74c3c', // Alizarin
    '#f1c40f', // Sunflower
    '#2ecc71', // Emerald
    '#1abc9c', // Turquoise
    '#3498db', // Peter River
    '#9b59b6'  // Amethyst
  ];
  
  cropTrackerBrand.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Clear any existing leaves
    leafContainer.innerHTML = '';
    
    // Create 50 falling leaves
    for (let i = 0; i < 50; i++) {
      createLeaf();
    }
    
    // Remove leaves after animation completes (5 seconds)
    setTimeout(() => {
      leafContainer.innerHTML = '';
    }, 5000);
  });
  
  function createLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    
    // Random properties for each leaf
    const size = Math.random() * 20 + 10; // 10-30px
    const left = Math.random() * 100; // 0-100% of viewport width
    const animationDuration = Math.random() * 3 + 2; // 2-5 seconds
    const delay = Math.random() * 2; // 0-2 seconds delay
    const rotation = Math.random() * 720; // 0-720 degrees
    
    // Randomly choose between emoji or colored div
    if (Math.random() > 0.5) {
      // Emoji leaf
      const leafEmoji = leaves[Math.floor(Math.random() * leaves.length)];
      leaf.textContent = leafEmoji;
      leaf.style.fontSize = `${size}px`;
    } else {
      // Colored leaf
      const color = colors[Math.floor(Math.random() * colors.length)];
      leaf.style.backgroundColor = color;
      leaf.style.width = `${size}px`;
      leaf.style.height = `${size}px`;
      leaf.style.borderRadius = '50% 0 50% 50%';
      leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
    }
    
    leaf.style.left = `${left}%`;
    leaf.style.top = '-30px';
    leaf.style.animationDuration = `${animationDuration}s`;
    leaf.style.animationDelay = `${delay}s`;
    leaf.style.opacity = Math.random() * 0.5 + 0.5; // 0.5-1 opacity
    
    leafContainer.appendChild(leaf);
  }
});