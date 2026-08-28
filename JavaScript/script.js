document.addEventListener("DOMContentLoaded", async function () {
    await loadComponent("components/header.html", "header-container");
    initialiseHeaderMenu();
    initialiseHeaderScroll();
    initialiseActiveNav();

    await loadComponent("components/footer.html", "footer-container");
    initialiseFooterForm();
    initialiseChatbot();
    initialiseContactForm();
    initialiseContactBranches();
    initialiseServiceCarousel();
    initialiseIndustryCarousel();
    initialiseLogoCarousel();
    initialiseAccordions();
    initialiseChooseMedia();
    initialisePageAnimations();
});

function initialiseContactBranches() {
    const tabs = document.querySelectorAll(".contact-branches__tab");

    if (!tabs.length) {
        return;
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            const office = tab.dataset.office;

            tabs.forEach(function (otherTab) {
                const isActive = otherTab === tab;
                otherTab.classList.toggle("is-active", isActive);
                otherTab.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            document.querySelectorAll(".contact-branches__panel").forEach(function (panel) {
                panel.classList.toggle("is-active", panel.dataset.officePanel === office);
            });
        });
    });
}

function initialiseChooseMedia() {
    const media = document.querySelector(".sector-choose__media");
    const content = document.querySelector(".sector-choose__content");

    if (!media || !content) {
        return;
    }

    function syncHeight() {
        media.style.height = `${Math.min(content.offsetHeight, 680)}px`;
    }

    syncHeight();
    window.addEventListener("resize", syncHeight);
}

function initialiseAccordions() {
    document.querySelectorAll(".sector-accordion").forEach(function (accordion) {
        const items = Array.from(
            accordion.querySelectorAll(".sector-accordion__item")
        );

        items.forEach(function (item) {
            const trigger = item.querySelector(".sector-accordion__trigger");

            if (!trigger) {
                return;
            }

            trigger.addEventListener("click", function () {
                const willOpen = !item.classList.contains("is-active");

                items.forEach(function (other) {
                    other.classList.remove("is-active");
                    other
                        .querySelector(".sector-accordion__trigger")
                        .setAttribute("aria-expanded", "false");
                });

                if (willOpen) {
                    item.classList.add("is-active");
                    trigger.setAttribute("aria-expanded", "true");
                }
            });
        });
    });
}

function initialisePageAnimations() {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const revealSelectors = [
        ".stats > div",
        ".services .section-title",
        ".service-card",
        ".about .split > *",
        ".industries h2",
        ".industries .section-intro",
        ".industry-grid article",
        ".faq-layout > div:first-child",
        ".faq-item",
        ".insights .section-title",
        ".insights .section-intro",
        ".insight-grid article",
        ".accreditations",
        ".footer-content > *",
        ".hub-hero__content > *",
        ".hub-callout__panel > *",
        ".hub-other__card",
        ".hub-value__statement > *",
        ".hub-value__image",
        ".hub-value__item",
        ".hub-process__step",
        ".sector-service-card",
        ".insight-featured",
        ".insight-card",
        ".article-related__card",
        ".sector-landscape__marker",
        ".sector-choose__media",
        ".sector-accordion__item",
        ".sector-stack__word",
        ".contact-reveal"
    ];
    const revealItems = [];

    revealSelectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (element, index) {
            if (element.dataset.revealReady === "true") {
                return;
            }

            element.dataset.revealReady = "true";
            element.classList.add("reveal-item");
            element.style.setProperty(
                "--reveal-delay",
                `${Math.min(index % 6, 5) * 85}ms`
            );
            revealItems.push(element);
        });
    });

    document.querySelectorAll(".sector-service-card").forEach(function (card, index) {
        card.style.setProperty("--reveal-delay", `${index * 180}ms`);
    });

    const aboutImage = document.querySelector(".about img");
    const aboutCopy = document.querySelector(".about .split > div");
    const faqIntro = document.querySelector(".faq-layout > div:first-child");

    if (aboutImage) {
        aboutImage.classList.add("reveal-from-right");
    }

    [aboutCopy, faqIntro].forEach(function (element) {
        if (element) {
            element.classList.add("reveal-from-left");
        }
    });

    document.documentElement.classList.add("motion-ready");

    window.requestAnimationFrame(function () {
        document.body.classList.add("page-entered");
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(function (element) {
            element.classList.add("is-visible");
        });
        return;
    }

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold:0.12,
        rootMargin:"0px 0px -45px"
    });

    revealItems.forEach(function (element) {
        revealObserver.observe(element);
    });

    const statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            animateStatNumber(entry.target);
            statObserver.unobserve(entry.target);
        });
    }, {
        threshold:0.65
    });

    document.querySelectorAll(".stats strong").forEach(function (stat) {
        statObserver.observe(stat);
    });
}

function initialiseContactForm() {
    const contactForm = document.querySelector(".contact-form");

    if (!contactForm) {
        return;
    }

    const status = contactForm.querySelector(".contact-form__status");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const fileInput = contactForm.querySelector(".contact-form__file-input");
    const fileName = contactForm.querySelector(".contact-form__file-name");

    if (fileInput && fileName) {
        fileInput.addEventListener("change", function () {
            fileName.textContent = fileInput.files.length ? fileInput.files[0].name : "No file chosen";
        });
    }

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Enquiry received";
        status.textContent = "Thank you. A member of our team will be in touch shortly.";
        contactForm.reset();

        if (fileName) {
            fileName.textContent = "No file chosen";
        }

        window.setTimeout(function () {
            submitButton.disabled = false;
            submitButton.innerHTML = "Send enquiry <span aria-hidden=\"true\">&rarr;</span>";
        }, 2500);
    });
}

function animateStatNumber(element) {
    const finalText = element.textContent.trim();
    const target = parseInt(finalText, 10);

    if (!Number.isFinite(target)) {
        return;
    }

    const suffix = finalText.replace(String(target), "");
    const duration = 1200;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        element.textContent = `${Math.round(target * easedProgress)}${suffix}`;

        if (progress < 1) {
            window.requestAnimationFrame(updateNumber);
        }
    }

    element.textContent = `0${suffix}`;
    window.requestAnimationFrame(updateNumber);
}

function initialiseLogoCarousel() {
    const logoTrack = document.querySelector(".logos");

    if (!logoTrack || logoTrack.dataset.carouselReady === "true") {
        return;
    }

    Array.from(logoTrack.children).forEach(function (logo) {
        const clone = logo.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        logoTrack.appendChild(clone);
    });

    logoTrack.dataset.carouselReady = "true";
}

function initialiseServiceCarousel() {
    initialiseSlowCarousel({
        trackSelector:".services-grid",
        carouselSelector:".services-carousel",
        cardSelector:".service-card",
        previousSelector:".service-arrow-left",
        nextSelector:".service-arrow-right",
        fallbackAmount:313,
        speed:15
    });
}

function initialiseIndustryCarousel() {
    initialiseSlowCarousel({
        trackSelector:".industry-grid",
        carouselSelector:".industry-carousel",
        cardSelector:"article",
        previousSelector:".industry-arrow-left",
        nextSelector:".industry-arrow-right",
        fallbackAmount:305,
        speed:15
    });
}

function initialiseSlowCarousel(options) {
    const track = document.querySelector(options.trackSelector);
    const carousel = document.querySelector(options.carouselSelector);
    const previousButton = document.querySelector(options.previousSelector);
    const nextButton = document.querySelector(options.nextSelector);
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    let direction = 1;
    let lastFrameTime = 0;
    let isHovered = false;
    let isFocused = false;
    let isInteracting = false;
    let autoPosition = 0;
    let manualPauseUntil = performance.now() + 650;

    if (!track || !carousel || !previousButton || !nextButton) {
        return;
    }

    autoPosition = track.scrollLeft;

    function getScrollAmount() {
        const firstCard = track.querySelector(options.cardSelector);
        const trackStyles = window.getComputedStyle(track);
        const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;

        return firstCard ? firstCard.offsetWidth + gap : options.fallbackAmount;
    }

    function getMaximumScroll() {
        return Math.max(track.scrollWidth - track.clientWidth, 0);
    }

    function updateArrowState() {
        const maximumScroll = getMaximumScroll();

        previousButton.disabled = track.scrollLeft <= 1;
        nextButton.disabled = track.scrollLeft >= maximumScroll - 1;
    }

    function updateActiveServiceCard() {
        if (options.trackSelector !== ".services-grid") {
            return;
        }

        const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
        let closestCard = null;
        let closestDistance = Infinity;

        track.querySelectorAll(options.cardSelector).forEach(function (card) {
            const cardRect = card.getBoundingClientRect();
            const distance = Math.abs(cardRect.left + cardRect.width / 2 - trackCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestCard = card;
            }
        });

        track.querySelectorAll(options.cardSelector).forEach(function (card) {
            card.classList.toggle("is-active", card === closestCard);
        });
    }

    function pauseAfterInteraction(duration) {
        manualPauseUntil = performance.now() + (duration || 2400);
    }

    function moveByCard(moveDirection) {
        pauseAfterInteraction();
        track.scrollBy({
            left:moveDirection * getScrollAmount(),
            behavior:"smooth"
        });
    }

    function autoScroll(currentTime) {
        const maximumScroll = getMaximumScroll();
        const frameDuration = Math.min(currentTime - lastFrameTime, 34);
        const isPaused =
            reduceMotion ||
            isHovered ||
            isFocused ||
            isInteracting ||
            currentTime < manualPauseUntil ||
            maximumScroll <= 1;

        if (!isPaused && lastFrameTime) {
            autoPosition += direction * options.speed * (frameDuration / 1000);

            if (autoPosition >= maximumScroll) {
                autoPosition = maximumScroll;
                direction = -1;
            } else if (autoPosition <= 0) {
                autoPosition = 0;
                direction = 1;
            }

            track.scrollLeft = autoPosition;
        } else {
            autoPosition = track.scrollLeft;
        }

        lastFrameTime = currentTime;
        window.requestAnimationFrame(autoScroll);
    }

    previousButton.addEventListener("click", function () {
        moveByCard(-1);
    });
    nextButton.addEventListener("click", function () {
        moveByCard(1);
    });
    track.addEventListener("scroll", updateArrowState, {
        passive:true
    });
    track.addEventListener("scroll", updateActiveServiceCard, {
        passive:true
    });
    carousel.addEventListener("mouseenter", function () {
        isHovered = true;
    });
    carousel.addEventListener("mouseleave", function () {
        isHovered = false;
        pauseAfterInteraction(900);
    });
    carousel.addEventListener("focusin", function () {
        isFocused = true;
    });
    carousel.addEventListener("focusout", function () {
        isFocused = false;
        pauseAfterInteraction(900);
    });
    track.addEventListener("pointerdown", function () {
        isInteracting = true;
    }, {
        passive:true
    });
    window.addEventListener("pointerup", function () {
        if (isInteracting) {
            isInteracting = false;
            pauseAfterInteraction();
        }
    }, {
        passive:true
    });
    track.addEventListener("wheel", function () {
        pauseAfterInteraction();
    }, {
        passive:true
    });
    window.addEventListener("resize", updateArrowState);
    window.addEventListener("resize", updateActiveServiceCard);

    updateArrowState();
    updateActiveServiceCard();

    if (!reduceMotion) {
        window.requestAnimationFrame(autoScroll);
    }
}

async function loadComponent(componentPath, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error("Container not found:", containerId);
        return;
    }

    const componentURL = new URL(componentPath, window.location.href);

    console.log("Loading component from:", componentURL.href);

    try {
        const response = await fetch(componentURL.href);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        const html = await response.text();
        const componentDocument = new DOMParser().parseFromString(
            html,
            "text/html"
        );

        componentDocument.querySelectorAll("style").forEach(function (style) {
            const componentStyle = document.createElement("style");
            componentStyle.dataset.component = componentPath;
            componentStyle.textContent = style.textContent;
            document.head.appendChild(componentStyle);
        });

        componentDocument.querySelectorAll("[src]").forEach(function (element) {
            element.src = new URL(
                element.getAttribute("src"),
                componentURL
            ).href;
        });

        componentDocument.querySelectorAll("script").forEach(function (script) {
            script.remove();
        });

        container.innerHTML = componentDocument.body.innerHTML;
    } catch (error) {
        console.error(
            `Could not load ${componentPath}:`,
            error
        );

        container.innerHTML = `
            <div style="
                margin: 20px;
                padding: 20px;
                border: 1px solid red;
                background: #ffecec;
                color: red;
                font-family: "DM Sans", sans-serif;
            ">
                <strong>Component loading error</strong><br>
                File: ${componentURL.href}<br>
                Error: ${error.message}
            </div>
        `;
    }
}

function initialiseHeaderMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const dropdownPointer = document.querySelector(".dropdown-pointer");
    const dropdownItems = Array.from(
        document.querySelectorAll(".has-dropdown")
    );

    if (!menuToggle || !navMenu) {
        return;
    }

    function positionPointerFor(item) {
        if (!dropdownPointer) {
            return;
        }

        const anchor = item.querySelector(".nav-split-trigger") || item.querySelector(".dropdown-trigger");

        if (!anchor) {
            return;
        }

        const rect = anchor.getBoundingClientRect();

        dropdownPointer.style.left = `${rect.left + rect.width / 2}px`;
        dropdownPointer.classList.add("is-visible");
    }

    function hidePointer() {
        if (dropdownPointer) {
            dropdownPointer.classList.remove("is-visible");
        }
    }

    function closeDropdowns(exception) {
        dropdownItems.forEach(function (item) {
            if (item === exception) {
                return;
            }

            item.classList.remove("open");

            const trigger = item.querySelector(".dropdown-trigger");

            if (trigger) {
                trigger.setAttribute("aria-expanded", "false");
            }
        });

        if (!exception) {
            hidePointer();
        }
    }

    menuToggle.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        if (!isOpen) {
            closeDropdowns();
        }

        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    dropdownItems.forEach(function (item) {
        item.addEventListener("mouseenter", function () {
            positionPointerFor(item);
        });

        item.addEventListener("mouseleave", function () {
            hidePointer();
        });

        item.addEventListener("focusin", function () {
            positionPointerFor(item);
        });

        item.addEventListener("focusout", function (event) {
            if (!item.contains(event.relatedTarget)) {
                hidePointer();
            }
        });

        const trigger = item.querySelector(".dropdown-trigger");

        if (!trigger) {
            return;
        }

        trigger.addEventListener("click", function (event) {
            event.stopPropagation();

            const willOpen = !item.classList.contains("open");

            closeDropdowns(item);
            item.classList.toggle("open", willOpen);
            trigger.setAttribute("aria-expanded", String(willOpen));

            if (willOpen) {
                positionPointerFor(item);
            } else {
                hidePointer();
            }
        });
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("active");
            closeDropdowns();
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".has-dropdown")) {
            closeDropdowns();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        closeDropdowns();
        navMenu.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
    });
}

function initialiseHeaderScroll() {
    const heroHeader = document.querySelector(".hero-header");

    if (!heroHeader) {
        return;
    }

    function syncPinnedState() {
        heroHeader.classList.toggle("is-pinned", window.scrollY > 24);
    }

    syncPinnedState();
    window.addEventListener("scroll", syncPinnedState, { passive: true });
}

function initialiseActiveNav() {
    const navItems = document.querySelectorAll(".nav-menu > li");

    if (!navItems.length) {
        return;
    }

    let currentFile = decodeURIComponent(
        window.location.pathname.split("/").pop() || ""
    ).toLowerCase();

    if (currentFile === "") {
        currentFile = "index.html";
    }

    function fileOf(href) {
        return decodeURIComponent(
            href.split("#")[0].split("?")[0].split("/").pop()
        ).toLowerCase();
    }

    function findMatch(selector) {
        let matchedItem = null;

        navItems.forEach(function (item) {
            const links = item.querySelectorAll(selector);

            const isMatch = Array.prototype.some.call(links, function (link) {
                return fileOf(link.getAttribute("href")) === currentFile;
            });

            if (isMatch) {
                matchedItem = item;
            }
        });

        return matchedItem;
    }

    // Only the section's own primary link/rows count toward the active
    // state — sidebar "explore" cross-links and the CTA button link to
    // other sections and must not light up their host dropdown too.
    const target =
        findMatch(":scope > a, .nav-split-trigger > .nav-primary-link") ||
        findMatch(".dropdown-rows a");

    navItems.forEach(function (item) {
        item.classList.toggle("nav-active", item === target);
    });
}

function initialiseChatbot() {
    const CHAT_EMAIL = "info@thereckoner.co.uk";
    // Sign up free at https://formspree.io, verify info@thereckoner.co.uk as the
    // recipient, then replace this with your real endpoint (https://formspree.io/f/xxxxxxx)
    // to have messages delivered to the inbox automatically.
    const FORM_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";

    const toggle = document.getElementById("chatbotToggle");
    const closeButton = document.getElementById("chatbotClose");
    const panel = document.getElementById("chatbotPanel");
    const messages = document.getElementById("chatbotMessages");
    const placeholder = document.getElementById("chatbotPlaceholder");
    const form = document.getElementById("chatbotForm");
    const nameInput = document.getElementById("chatbotName");
    const emailInput = document.getElementById("chatbotEmail");
    const messageInput = document.getElementById("chatbotInput");

    if (!toggle || !panel || !messages || !form || !nameInput || !emailInput || !messageInput) {
        return;
    }

    function addMessage(text, sender) {
        if (placeholder) {
            placeholder.remove();
        }

        const bubble = document.createElement("div");
        bubble.className = `chatbot-msg chatbot-msg--${sender}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function openPanel() {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        nameInput.focus();
    }

    function closePanel() {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
        if (panel.hidden) {
            openPanel();
        } else {
            closePanel();
        }
    });

    if (closeButton) {
        closeButton.addEventListener("click", closePanel);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !email || !message) {
            form.reportValidity();
            return;
        }

        if (!isValidEmail(email)) {
            emailInput.focus();
            form.reportValidity();
            return;
        }

        addMessage(message, "user");

        const subject = `Website chatbot enquiry from ${name}`;

        if (FORM_ENDPOINT.includes("REPLACE_WITH_YOUR_FORM_ID")) {
            const body =
                `Name: ${name}\n` +
                `Email: ${email}\n\n` +
                `Message:\n${message}\n\n` +
                `Sent via the Reckoner Audit website chatbot.`;

            window.location.href =
                `mailto:${CHAT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            addMessage(
                `Thanks! I've opened your email app with this ready to send to ${CHAT_EMAIL} — just hit send there and our team will get back to you within one working day.`,
                "bot"
            );

            messageInput.value = "";
            messageInput.focus();
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";

        fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new URLSearchParams({
                name: name,
                email: email,
                message: message,
                _subject: subject
            })
        })
            .then(function (response) {
                if (response.ok) {
                    addMessage(
                        "Thanks! Your message has been sent to our team — we'll get back to you within one working day.",
                        "bot"
                    );
                    messageInput.value = "";
                } else {
                    addMessage(
                        `Sorry, something went wrong sending your message. Please try again or email us directly at ${CHAT_EMAIL}.`,
                        "bot"
                    );
                }
            })
            .catch(function () {
                addMessage(
                    `Sorry, something went wrong sending your message. Please try again or email us directly at ${CHAT_EMAIL}.`,
                    "bot"
                );
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = "Send";
                messageInput.focus();
            });
    });
}

function initialiseFooterForm() {
    const footerForm = document.querySelector(".footer-form");
    const formMessage = document.querySelector(".form-message");
    const enquiryForm = document.querySelector(".footer-enquiry-form");

    if (enquiryForm) {
        enquiryForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const response = enquiryForm.querySelector(
                ".footer-enquiry-response"
            );

            if (response) {
                response.innerHTML =
                    "<span>&#10003;</span> Thank you. We will be in touch shortly.";
            }

            enquiryForm.reset();
        });
    }

    if (!footerForm) {
        return;
    }

    footerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = footerForm.querySelector(
            'input[type="email"]'
        );

        if (!emailInput) {
            return;
        }

        if (formMessage) {
            formMessage.textContent =
                "Thank you for subscribing.";
        }

        footerForm.reset();
    });
}
