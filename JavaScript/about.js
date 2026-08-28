document.addEventListener("DOMContentLoaded", function () {
    const revealItems = Array.from(
        document.querySelectorAll("[data-about-reveal]")
    );
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    document.documentElement.classList.add("about-motion-ready");
    initialiseTeamCards();
    initialiseAboutEnquiryForm();

    [
        ".about-expertise__grid",
        ".about-services__grid",
        ".about-team__grid"
    ].forEach(function (selector) {
        const group = document.querySelector(selector);

        if (!group) {
            return;
        }

        Array.from(group.children).forEach(function (item, index) {
            item.style.setProperty(
                "--about-delay",
                `${Math.min(index, 6) * 70}ms`
            );
        });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(function (item) {
            item.classList.add("is-about-visible");
        });
        return;
    }

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-about-visible");

            if (entry.target.classList.contains("about-team-card")) {
                window.setTimeout(function () {
                    entry.target.classList.add("is-reveal-complete");
                }, 1400);
            }

            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold:0.12,
        rootMargin:"0px 0px -45px"
    });

    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });

    const experienceNumber = document.querySelector("[data-count]");

    if (!experienceNumber) {
        return;
    }

    const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            animateAboutCounter(entry.target);
            counterObserver.unobserve(entry.target);
        });
    }, {
        threshold:0.7
    });

    counterObserver.observe(experienceNumber);
});

function initialiseTeamCards() {
    const cards = Array.from(document.querySelectorAll(".about-team-card"));

    function closeCards(exception) {
        cards.forEach(function (card) {
            if (card === exception) {
                return;
            }

            card.classList.remove("is-profile-open");
            card.setAttribute("aria-expanded", "false");
        });
    }

    cards.forEach(function (card) {
        function toggleCard(event) {
            event.stopPropagation();

            const willOpen = !card.classList.contains("is-profile-open");

            closeCards(card);
            card.classList.toggle("is-profile-open", willOpen);
            card.setAttribute("aria-expanded", String(willOpen));
        }

        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-expanded", "false");
        card.addEventListener("click", toggleCard);
        card.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleCard(event);
            }
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".about-team-card")) {
            closeCards();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeCards();
        }
    });
}

function initialiseAboutEnquiryForm() {
    const form = document.querySelector(".about-cta__form");

    if (!form) {
        return;
    }

    const status = form.querySelector(".about-cta__status");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (status) {
            status.textContent = "Thank you. Our team will be in touch shortly.";
        }

        form.reset();
    });
}

function animateAboutCounter(element) {
    const target = Number(element.dataset.count);
    const duration = 1100;
    const startTime = performance.now();

    function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = `${Math.round(target * eased)}+`;

        if (progress < 1) {
            window.requestAnimationFrame(update);
        }
    }

    element.textContent = "0+";
    window.requestAnimationFrame(update);
}
