// Swiss Echo Interactions

document.addEventListener('DOMContentLoaded', () => {
  // Simple intersection observer for reveals if needed
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-wrap').forEach(el => observer.observe(el));
});
