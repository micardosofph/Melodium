document.addEventListener('DOMContentLoaded', () => {
  const heroCard = document.querySelector('.hero-card');
  const levelChips = Array.from(document.querySelectorAll('.level-chip'));
  const trainingCards = Array.from(document.querySelectorAll('.training-card'));

  if (heroCard) heroCard.classList.add('is-ready');

  levelChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const selectedLevel = chip.dataset.level;

      levelChips.forEach((item) => item.classList.toggle('active', item === chip));

      trainingCards.forEach((card) => {
        const matchesLevel = selectedLevel === 'all' || card.dataset.level === selectedLevel;
        card.classList.toggle('hidden', !matchesLevel);
      });
    });
  });
});
