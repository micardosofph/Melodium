document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.hero-card, .bento-card, .team-card');

  animatedElements.forEach((element, index) => {
    element.classList.add('is-ready');
    element.style.transitionDelay = `${index * 90}ms`;
  });
});
