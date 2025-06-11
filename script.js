let currentSlide = 0;
const totalSlides = 6;
const slideContainer = document.getElementById('carouselSlides');
const indicators = document.querySelectorAll('.carousel-indicator');
let autoSlideInterval;

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
}

function setupNavigation() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);

            document.getElementById(sectionId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function updateCarousel() {
    const translateX = -currentSlide * (100 / totalSlides);
    slideContainer.style.transform = `translateX(${translateX}%)`;

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
    resetAutoSlide();
}

function previousSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
    resetAutoSlide();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    resetAutoSlide();
}

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 6000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

function handleFormSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

document.addEventListener('DOMContentLoaded', function () {
    showSection('home');

    setupNavigation();

    updateCarousel();
    startAutoSlide();

    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        startAutoSlide();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            previousSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});