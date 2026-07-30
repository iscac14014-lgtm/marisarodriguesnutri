const body = document.body;
const header = document.querySelector('.site-header');
const navbarToggle = document.querySelector('.navbar__toggle');
const navbarMenu = document.querySelector('.navbar__menu');
const scrollTopButton = document.querySelector('.scroll-top');
const currentYear = document.querySelector('#current-year');
const toast = document.querySelector('.toast');
const personalAreaLinks = document.querySelectorAll('a[href="personal-area.html"]');
const loadingScreen = document.querySelector('.loading-screen');
const mapTrigger = document.querySelector('[data-map-trigger="gym"]');
const mapPlaceholder = document.querySelector('#mapa-ginasio');
const mapEmbed = document.querySelector('[data-map-embed]');

if (currentYear) {
    currentYear.textContent = new Intl.DateTimeFormat('pt-PT', { year: 'numeric' }).format(new Date());
}

const closeMenu = () => {
    if (!navbarToggle || !navbarMenu) {
        return;
    }

    navbarToggle.setAttribute('aria-expanded', 'false');
    navbarMenu.classList.remove('is-open');
    body.classList.remove('menu-open');
};

const showToast = (message) => {
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2600);
};

if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
        const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
        navbarToggle.setAttribute('aria-expanded', String(!isExpanded));
        navbarMenu.classList.toggle('is-open', !isExpanded);
        body.classList.toggle('menu-open', !isExpanded);
    });

    navbarMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMenu();
    }
});

document.addEventListener('click', (event) => {
    if (!navbarMenu || !navbarToggle) {
        return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
        return;
    }

    const clickInsideMenu = navbarMenu.contains(target) || navbarToggle.contains(target);
    if (!clickInsideMenu) {
        closeMenu();
    }
});

const handleScrollState = () => {
    const offset = window.scrollY;

    if (header) {
        header.classList.toggle('is-scrolled', offset > 24);
    }

    if (scrollTopButton) {
        scrollTopButton.classList.toggle('is-visible', offset > 480);
    }
};

window.addEventListener('scroll', handleScrollState, { passive: true });
handleScrollState();

if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (mapTrigger && mapEmbed && mapPlaceholder) {
    mapTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        mapPlaceholder.hidden = false;
        mapEmbed.hidden = false;
        mapPlaceholder.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const delay = entry.target.getAttribute('data-delay');
            if (delay) {
                entry.target.style.setProperty('--reveal-delay', `${delay}ms`);
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    revealElements.forEach((element) => revealObserver.observe(element));
}

const counters = document.querySelectorAll('[data-counter]');
if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const target = entry.target;
            const endValue = Number(target.getAttribute('data-counter'));
            const duration = 1200;
            const startTime = performance.now();

            const updateCounter = (timestamp) => {
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const currentValue = Math.floor(progress * endValue);
                target.textContent = new Intl.NumberFormat('pt-PT').format(currentValue);

                if (progress < 1) {
                    window.requestAnimationFrame(updateCounter);
                } else {
                    target.textContent = new Intl.NumberFormat('pt-PT').format(endValue);
                }
            };

            window.requestAnimationFrame(updateCounter);
            observer.unobserve(target);
        });
    }, { threshold: 0.55 });

    counters.forEach((counter) => counterObserver.observe(counter));
}

const slider = document.querySelector('[data-slider]');
if (slider) {
    const slides = Array.from(slider.querySelectorAll('.testimonial'));
    const dotsContainer = document.querySelector('.testimonials__dots');
    let currentSlide = 0;
    let sliderTimer = null;

    const setSlide = (index) => {
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dotsContainer?.querySelectorAll('button').forEach((dot, dotIndex) => {
            dot.setAttribute('aria-selected', String(dotIndex === index));
            dot.setAttribute('tabindex', dotIndex === index ? '0' : '-1');
        });

        currentSlide = index;
    };

    const startSlider = () => {
        window.clearInterval(sliderTimer);
        sliderTimer = window.setInterval(() => {
            const nextIndex = (currentSlide + 1) % slides.length;
            setSlide(nextIndex);
        }, 4800);
    };

    if (dotsContainer) {
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Ver testemunho ${index + 1}`);
            dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
            dot.addEventListener('click', () => {
                setSlide(index);
                startSlider();
            });
            dotsContainer.appendChild(dot);
        });
    }

    setSlide(0);
    startSlider();
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    const formLoadedAt = Date.now();
    const minimumSubmitDelayMs = 4000;
    const honeypotField = contactForm.elements.namedItem('website');

    const validators = {
        nome: {
            test: (value) => value.trim().length >= 3,
            message: 'Introduza o seu nome completo.'
        },
        email: {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value.trim()),
            message: 'Introduza um endereço de email válido.'
        },
        telemovel: {
            test: (value) => /^(\+351\s?)?(9\d{2})(\s?\d{3}){2}$/u.test(value.trim()),
            message: 'Introduza um número de telemóvel válido em formato português.'
        },
        mensagem: {
            test: (value) => value.trim().length >= 12,
            message: 'Escreva uma mensagem com pelo menos 12 caracteres.'
        }
    };

    const setFieldState = (field, valid, message = '') => {
        field.setAttribute('aria-invalid', String(!valid));
        const errorElement = field.parentElement?.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = valid ? '' : message;
        }
    };

    Object.keys(validators).forEach((fieldName) => {
        const field = contactForm.elements.namedItem(fieldName);
        if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
            return;
        }

        field.addEventListener('input', () => {
            const rule = validators[fieldName];
            setFieldState(field, rule.test(field.value), rule.message);
        });
    });

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const statusElement = contactForm.querySelector('.contact-form__status');

        if (honeypotField instanceof HTMLInputElement && honeypotField.value.trim() !== '') {
            statusElement.textContent = 'Não foi possível validar o envio. Tente novamente.';
            return;
        }

        if ((Date.now() - formLoadedAt) < minimumSubmitDelayMs) {
            statusElement.textContent = 'Aguarde alguns segundos antes de enviar o pedido.';
            return;
        }

        let firstInvalidField = null;
        let allValid = true;

        Object.entries(validators).forEach(([fieldName, rule]) => {
            const field = contactForm.elements.namedItem(fieldName);
            if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
                return;
            }

            const isValid = rule.test(field.value);
            setFieldState(field, isValid, rule.message);

            if (!isValid && !firstInvalidField) {
                firstInvalidField = field;
            }

            allValid = allValid && isValid;
        });

        if (!allValid) {
            statusElement.textContent = 'Verifique os campos assinalados antes de enviar o pedido.';
            firstInvalidField?.focus();
            return;
        }

        statusElement.textContent = 'Pedido validado com sucesso. A integração de envio será ativada em breve.';
        contactForm.reset();
        contactForm.querySelectorAll('input, textarea').forEach((field) => {
            field.setAttribute('aria-invalid', 'false');
        });
    });
}

personalAreaLinks.forEach((link) => {
    link.addEventListener('click', () => {
        if (document.documentElement.classList.contains('coming-soon-page')) {
            return;
        }

        showToast('Funcionalidade de login disponível em breve.');
    });
});

const hideLoadingScreen = () => {
    body.classList.add('is-loaded');
    loadingScreen?.classList.add('is-hidden');
};

if (document.readyState === 'complete') {
    hideLoadingScreen();
} else {
    window.addEventListener('load', hideLoadingScreen, { once: true });
}

window.setTimeout(hideLoadingScreen, 1600);