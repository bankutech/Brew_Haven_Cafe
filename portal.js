// portal.js - Logic for Brew Haven Master Portal

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check local storage for preference
  const currentTheme = localStorage.getItem('theme') || 'dark'; // Portal defaults to dark
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Load shared points
  const points = localStorage.getItem('brewhaven_points') || 0;
  const globalPoints = document.getElementById('global-points');
  if (globalPoints) {
    globalPoints.textContent = parseInt(points).toLocaleString();
  }
});
