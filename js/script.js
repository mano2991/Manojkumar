
// Auto-calculate age from birthday

(function () {
    const ageEl = document.getElementById('age-value');
    if (!ageEl) return;
    const birthDate = new Date(1991, 8, 29); // 29 September 1991
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!hasHadBirthdayThisYear) age--;
    ageEl.textContent = age;
})();

// Publications pagination — show N per page, with page-dot navigation

(function () {
    const PER_PAGE = 5;
    const list = document.querySelector('.publication-list'),
        pagination = document.getElementById('pubPagination');
    if (!list || !pagination) return;

    const cards = Array.from(list.children).filter(function (el) {
        return el.classList.contains('publication-card');
    });
    const pageCount = Math.ceil(cards.length / PER_PAGE);
    if (pageCount <= 1) return;

    let currentPage = 0;

    function renderDots() {
        pagination.innerHTML = '';
        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'pub-page-dot';
            dot.textContent = String(i + 1);
            dot.setAttribute('aria-label', 'Page ' + (i + 1) + ' of ' + pageCount);
            if (i === currentPage) dot.classList.add('active');
            dot.addEventListener('click', function () {
                goToPage(i);
            });
            pagination.appendChild(dot);
        }
    }

    function goToPage(page) {
        currentPage = page;
        cards.forEach(function (card, i) {
            const cardPage = Math.floor(i / PER_PAGE);
            card.style.display = cardPage === currentPage ? '' : 'none';
        });
        renderDots();
        list.closest('.section').scrollTop = 0;
    }

    goToPage(0);
})();

// iTyped

window.ityped.init(document.querySelector('.iTyped'), {
    strings: ["I'm a Bioinformatician", "I'm a Computational Neurobiologist", "I'm a Software Developer", "I'm a Web Developer", "I'm a Wildlife Photographer", "I'm a Gamer", "I love cooking"],
    loop: true
});

// Portfolio Item Filter

const filterContainer = document.querySelector('.portfolio-filter'),
    filterBtns = filterContainer.children,
    totalFilterBtn = filterBtns.length,
    portfolioItems = document.querySelectorAll('.portfolio-item'),
    totalPortfolioItem = portfolioItems.length;

    for (let i = 0; i < totalFilterBtn; i++) {
        filterBtns[i].addEventListener("click", function(){
            filterContainer.querySelector('.active').classList.remove('active');
            this.classList.add("active");

            const filterValue = this.getAttribute('data-filter');
            for (let k = 0; k < totalPortfolioItem; k++) {
                if (filterValue === portfolioItems[k].getAttribute('data-category')) {
                    portfolioItems[k].classList.remove('hide');
                    portfolioItems[k].classList.add('show');
                } else{
                    portfolioItems[k].classList.remove('show');
                    portfolioItems[k].classList.add('hide');
                }
                if (filterValue === 'all') {
                    portfolioItems[k].classList.remove('hide');
                    portfolioItems[k].classList.add('show');
                }
            }
        });
    }

// Sidebar — mobile toggle

const navToggler = document.getElementById('navToggler'),
    sidebar = document.getElementById('sidebar');

if (navToggler && sidebar) {
    navToggler.addEventListener('click', function () {
        navToggler.classList.toggle('open');
        sidebar.classList.toggle('open');
        const expanded = navToggler.classList.contains('open');
        navToggler.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    sidebar.querySelectorAll('a[data-nav]').forEach(function (link) {
        link.addEventListener('click', function () {
            navToggler.classList.remove('open');
            sidebar.classList.remove('open');
            navToggler.setAttribute('aria-expanded', 'false');
        });
    });
}

// Panel navigation — one full-screen section active at a time, with slide transition

const navLinks = document.querySelectorAll('[data-nav]'),
    panels = document.querySelectorAll('main .section');

function setActiveNav(id) {
    navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-nav') === id);
    });
}

function goToSection(id) {
    const target = document.getElementById(id);
    if (!target || target.classList.contains('active')) return;

    panels.forEach(function (panel) {
        if (panel.classList.contains('active')) {
            panel.classList.remove('active');
            panel.classList.add('back-section');
        } else if (panel !== target) {
            panel.classList.remove('back-section');
        }
    });

    target.classList.remove('back-section');
    target.classList.add('active');
    target.scrollTop = 0;

    setActiveNav(id);
}

navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        goToSection(link.getAttribute('data-nav'));
    });
});

// Contact Form (Formspree)

const contactForm = document.querySelector('#contactForm');

if (contactForm) {
    const formStatus = contactForm.querySelector('#form-status');

    contactForm.addEventListener('submit', function(e){
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        formStatus.textContent = 'Sending...';
        formStatus.className = '';

        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        })
        .then(function(response){
            if (response.ok) {
                formStatus.textContent = 'Thanks! Your message has been sent.';
                formStatus.className = 'success';
                contactForm.reset();
            } else {
                formStatus.textContent = 'Something went wrong. Please email me directly instead.';
                formStatus.className = 'error';
            }
        })
        .catch(function(){
            formStatus.textContent = 'Something went wrong. Please email me directly instead.';
            formStatus.className = 'error';
        })
        .finally(function(){
            submitBtn.disabled = false;
        });
    });
}
