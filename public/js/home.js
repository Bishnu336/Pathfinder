document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function () {
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});


const track = document.querySelector('.carousel-track');
const leftBtn = document.querySelector('.carousel-arrow.left');
const rightBtn = document.querySelector('.carousel-arrow.right');
const cards = document.querySelectorAll('.carousel-track .card');

let currentIndex = 0;

function updateCarousel() {
    const cardWidth = cards[0].offsetWidth;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

rightBtn.addEventListener('click', () => {
    const maxIndex = cards.length - 4; // 4 visible cards
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
    }
});

leftBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

window.addEventListener('resize', updateCarousel);

