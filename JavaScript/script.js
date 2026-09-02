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
    initialiseHeroKinetic();
    initialisePageAnimations();
    initialiseHeroParallax();
    initialiseAboutReveal();
    initialiseAboutParallax();
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
        if (window.innerWidth <= 800) {
            media.style.height = "";
            return;
        }

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
        ".about .split > *",
        ".industries h2",
        ".industries .section-intro",
        ".faq-layout > div:first-child",
        ".faq-item",
        ".insights .section-title",
        ".insights .section-intro",
        ".insight-grid article",
        ".accreditations",
        ".footer-content > *",
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
        card.style.setProperty("--reveal-delay", `${index * 250}ms`);
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

/**
 * Kinetic hero typography, applied to the homepage, sector/service hub
 * pages (e.g. property.html), the contact page and services.html/
 * sectors.html. Intentionally excluded from about_us.html.
 * Splits each hero's <h1> into one .hero-kinetic-line per visual line
 * (respecting existing <br> breaks) so lines reveal in sequence with a
 * blur-to-clear cascade, then staggers the kicker/lead/buttons around it:
 * label first, heading line by line, copy, then buttons.
 */
function initialiseHeroKinetic() {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
        return;
    }

    const heroRoots = document.querySelectorAll(
        ".hero-copy, .hub-hero__content, .contact-hero__copy, .services-hero__copy, .detail-hero > .hub-shell, .article-header > .hub-shell"
    );

    heroRoots.forEach(function (root) {
        if (root.dataset.heroKineticReady === "true") {
            return;
        }

        root.dataset.heroKineticReady = "true";

        const heading = root.querySelector("h1");
        const before = [];
        const after = [];
        let passedHeading = false;

        Array.from(root.children).forEach(function (child) {
            if (child === heading) {
                passedHeading = true;
                return;
            }

            (passedHeading ? after : before).push(child);
        });

        before.forEach(function (child, index) {
            child.classList.add("hero-fade-item");
            child.style.setProperty("--line-delay", `${(index * 0.14).toFixed(2)}s`);
        });

        const lineStep = 0.18;
        const lineBase = 0.08;
        const lineCount = heading ? splitHeadingLines(heading, lineBase, lineStep, "hero-kinetic") : 0;
        const headingDuration = lineCount
            ? lineBase + (lineCount - 1) * lineStep + 0.9
            : lineBase;

        after.forEach(function (child, index) {
            child.classList.add("hero-fade-item");
            child.style.setProperty(
                "--line-delay",
                `${(headingDuration + index * 0.18).toFixed(2)}s`
            );
        });
    });
}

/**
 * Moves each existing child node of `heading` into its own
 * <classPrefix>-line > <classPrefix>-line__inner, splitting on <br>
 * elements. Nodes are relocated (not cloned), so this only rearranges the
 * heading's existing text/markup rather than rewriting it. Returns the
 * number of lines produced. Shared by the hero kinetic heading and the
 * homepage About section heading (each with its own CSS timing under its
 * own class prefix).
 */
function splitHeadingLines(heading, lineBase, lineStep, classPrefix) {
    const sourceNodes = Array.from(heading.childNodes);
    const lines = [];
    let currentNodes = [];

    function flushLine() {
        const hasContent = currentNodes.some(function (node) {
            return node.nodeType === 1 || (node.textContent || "").trim() !== "";
        });

        if (hasContent) {
            lines.push(currentNodes);
        }

        currentNodes = [];
    }

    sourceNodes.forEach(function (node) {
        if (node.nodeName === "BR") {
            flushLine();
        } else {
            currentNodes.push(node);
        }
    });
    flushLine();

    if (!lines.length) {
        return 0;
    }

    heading.classList.add(`${classPrefix}-heading`);

    const fragment = document.createDocumentFragment();

    lines.forEach(function (lineNodes, index) {
        const lineSpan = document.createElement("span");
        lineSpan.className = `${classPrefix}-line`;

        const innerSpan = document.createElement("span");
        innerSpan.className = `${classPrefix}-line__inner`;
        innerSpan.style.setProperty(
            "--line-delay",
            `${(lineBase + index * lineStep).toFixed(2)}s`
        );

        lineNodes.forEach(function (node) {
            innerSpan.appendChild(node);
        });

        lineSpan.appendChild(innerSpan);
        fragment.appendChild(lineSpan);
    });

    Array.from(heading.childNodes).forEach(function (node) {
        heading.removeChild(node);
    });

    heading.appendChild(fragment);

    return lines.length;
}

/**
 * Subtle mouse-driven parallax for hero background photos: nudges
 * --hero-parallax-x/-y (consumed by .hero/.hub-hero/.contact-hero/
 * .services-hero background-position in style.css/services.css) toward
 * the cursor.
 */
function initialiseHeroParallax() {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduceMotion || !canHover) {
        return;
    }

    const heroes = document.querySelectorAll(
        ".hero, .hub-hero, .contact-hero, .services-hero, .is-tax-modern .detail-hero"
    );
    const maxOffset = 24;

    heroes.forEach(function (hero) {
        hero.addEventListener("mousemove", function (event) {
            const rect = hero.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

            hero.style.setProperty("--hero-parallax-x", `${(x * maxOffset).toFixed(1)}px`);
            hero.style.setProperty("--hero-parallax-y", `${(y * maxOffset * 0.6).toFixed(1)}px`);
        });

        hero.addEventListener("mouseleave", function () {
            hero.style.setProperty("--hero-parallax-x", "0px");
            hero.style.setProperty("--hero-parallax-y", "0px");
        });
    });
}

/**
 * "About Reckoner Audit" — scroll-triggered entrance sequence. Shared by
 * the homepage's #about section and about_us.html's #about-reckoner
 * section (identical markup, styled via the :is(#about, #about-reckoner)
 * selectors in style.css). Splits the heading into .about-kinetic-line
 * spans (same technique as the hero heading, respecting existing <br>
 * breaks), then watches the section with an IntersectionObserver: the
 * moment it enters the viewport it adds .home-about--revealed once,
 * which fires the whole label → heading → visual → paragraph →
 * checklist cascade via CSS transition-delays. A short time after that
 * cascade finishes, .home-about--settled swaps the visual's transition
 * back to a fast one so the parallax in initialiseAboutParallax() stays
 * responsive.
 */
function initialiseAboutReveal() {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const section = document.querySelector("#about, #about-reckoner");

    if (reduceMotion || !section) {
        return;
    }

    const heading = section.querySelector(".home-about__title");

    if (heading && section.dataset.aboutKineticReady !== "true") {
        section.dataset.aboutKineticReady = "true";
        splitHeadingLines(heading, 0.15, 0.15, "about-kinetic");
    }

    function settle() {
        section.classList.add("home-about--revealed");

        window.setTimeout(function () {
            section.classList.add("home-about--settled");
        }, 1750);
    }

    if (!("IntersectionObserver" in window)) {
        settle();
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            settle();
            observer.unobserve(entry.target);
        });
    }, {
        threshold:0.25
    });

    observer.observe(section);
}

/**
 * Very subtle scroll parallax for the About section (homepage #about or
 * about_us.html's #about-reckoner): nudges --about-parallax (the visual
 * image) and --about-parallax-bg (the soft glow behind it, at a slower
 * rate for depth) as the section moves through the viewport.
 */
function initialiseAboutParallax() {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const section = document.querySelector("#about, #about-reckoner");

    if (reduceMotion || !section) {
        return;
    }

    const maxOffset = 16;
    let ticking = false;

    function update() {
        const rect = section.getBoundingClientRect();
        const viewportHalf = window.innerHeight / 2;
        const sectionCentre = rect.top + rect.height / 2;
        const range = viewportHalf + rect.height / 2;
        const progress = range > 0
            ? Math.max(-1, Math.min(1, (viewportHalf - sectionCentre) / range))
            : 0;

        section.style.setProperty("--about-parallax", `${(progress * maxOffset).toFixed(1)}px`);
        section.style.setProperty("--about-parallax-bg", `${(progress * maxOffset * 0.4).toFixed(1)}px`);
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, {
        passive:true
    });

    update();
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
    initialiseInfiniteCarousel({
        trackSelector:".services-grid",
        carouselSelector:".services-carousel",
        cardSelector:".service-card",
        previousSelector:".service-arrow-left",
        nextSelector:".service-arrow-right",
        speed:34
    });
}

function initialiseIndustryCarousel() {
    initialiseInfiniteCarousel({
        trackSelector:".industry-grid",
        carouselSelector:".industry-carousel",
        cardSelector:"article",
        previousSelector:".industry-arrow-left",
        nextSelector:".industry-arrow-right",
        speed:34
    });
}

/**
 * Infinite, center-focused carousel shared by the "Our Services" and
 * "Industries We Serve" rows. Cards drift continuously right-to-left;
 * whichever card is nearest the viewport centre is scaled up/brightened
 * while the rest settle back down. The track is looped seamlessly by
 * cloning the original card set a few times and wrapping the scroll
 * offset every one-set period — because every clone in a given "slot"
 * is visually identical, the wrap can't be seen. Supports pointer/touch
 * dragging with light momentum, pauses on hover/drag, resumes shortly
 * after interaction, and pops whichever card is hovered.
 */
function initialiseInfiniteCarousel(options) {
    const viewport = document.querySelector(options.trackSelector);
    const carousel = document.querySelector(options.carouselSelector);
    const previousButton = document.querySelector(options.previousSelector);
    const nextButton = document.querySelector(options.nextSelector);

    if (!viewport || !carousel) {
        return;
    }

    const originalCards = Array.from(viewport.children).filter(function (child) {
        return child.matches(options.cardSelector);
    });

    if (!originalCards.length) {
        return;
    }

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const originalCount = originalCards.length;
    const repeats = 4;
    const allCards = originalCards.slice();

    for (let copy = 1; copy < repeats; copy += 1) {
        originalCards.forEach(function (card) {
            const clone = card.cloneNode(true);

            clone.setAttribute("aria-hidden", "true");
            viewport.appendChild(clone);
            allCards.push(clone);
        });
    }

    const hoverProgress = allCards.map(function () {
        return 0;
    });
    let hoveredIndex = -1;

    allCards.forEach(function (card, index) {
        card.addEventListener("mouseenter", function () {
            hoveredIndex = index;
        });
        card.addEventListener("mouseleave", function () {
            if (hoveredIndex === index) {
                hoveredIndex = -1;
            }
        });
    });

    let step = options.fallbackStep || 280;
    let period = step * originalCount;
    let viewportCenter = viewport.clientWidth / 2;

    function measure() {
        const cardRect = originalCards[0].getBoundingClientRect();
        const gridStyles = window.getComputedStyle(viewport);
        const gap = parseFloat(gridStyles.getPropertyValue("--card-gap")) || 20;

        step = cardRect.width + gap;
        period = step * originalCount;
        viewportCenter = viewport.clientWidth / 2;
    }

    measure();
    window.addEventListener("resize", measure);

    function wrapValue(value, mod) {
        return ((value % mod) + mod) % mod;
    }

    let offset = originalCount * step - viewportCenter + step / 2;
    let targetOffset = offset;
    let isHovering = false;
    let isDragging = false;
    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let lastMoveX = 0;
    let lastMoveTime = 0;
    let flingVelocity = 0;
    let resumeAt = 0;
    let lastFrameTime = 0;
    const autoSpeed = options.speed || 34;

    function pauseAutoScroll(duration) {
        resumeAt = performance.now() + (duration || 1400);
    }

    function render() {
        const wrapped = wrapValue(offset, period);

        allCards.forEach(function (card, index) {
            const x = index * step - wrapped;
            const centreX = x + step / 2;
            const distance = centreX - viewportCenter;
            const normalised = Math.min(Math.abs(distance) / (step * 1.05), 1);
            const eased = normalised * normalised * (3 - 2 * normalised);
            const hoverTarget = index === hoveredIndex ? 1 : 0;

            hoverProgress[index] += (hoverTarget - hoverProgress[index]) * 0.22;

            const hover = hoverProgress[index];
            const baseScale = 1.08 - eased * (1.08 - 0.85);
            const scale = baseScale + hover * 0.08;
            const opacity = Math.min(1, 1 - eased * 0.32 + hover * 0.32);
            const lift = eased * 6 - hover * 4;

            card.style.transform =
                `translate3d(${x.toFixed(1)}px, calc(-50% + ${lift.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
            card.style.opacity = opacity.toFixed(3);
            card.style.zIndex = String(200 - Math.round(eased * 100) + Math.round(hover * 50));
        });
    }

    function frame(now) {
        if (!lastFrameTime) {
            lastFrameTime = now;
        }

        const dt = Math.min(now - lastFrameTime, 40);

        lastFrameTime = now;

        if (Math.abs(flingVelocity) > 0.002 && !isDragging) {
            targetOffset += flingVelocity * dt;
            flingVelocity *= 0.92;

            if (Math.abs(flingVelocity) <= 0.002) {
                flingVelocity = 0;
            }
        } else {
            const isPaused =
                reduceMotion || isHovering || isDragging || now < resumeAt;

            if (!isPaused) {
                targetOffset += autoSpeed * (dt / 1000);
            }
        }

        if (isDragging || reduceMotion) {
            offset = targetOffset;
        } else {
            offset += (targetOffset - offset) * 0.14;
        }

        render();
        requestAnimationFrame(frame);
    }

    function onPointerDown(event) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        isDragging = true;
        dragPointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartOffset = offset;
        lastMoveX = event.clientX;
        lastMoveTime = performance.now();
        flingVelocity = 0;
        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
        if (!isDragging || event.pointerId !== dragPointerId) {
            return;
        }

        const delta = event.clientX - dragStartX;

        offset = dragStartOffset - delta;
        targetOffset = offset;

        const now = performance.now();
        const dt = now - lastMoveTime;

        if (dt > 0) {
            flingVelocity = -((event.clientX - lastMoveX) / dt);
        }

        lastMoveX = event.clientX;
        lastMoveTime = now;
    }

    function endDrag(event) {
        if (!isDragging || (event && event.pointerId !== dragPointerId)) {
            return;
        }

        isDragging = false;
        dragPointerId = null;
        viewport.classList.remove("is-dragging");
        pauseAutoScroll(1200);
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });

    viewport.addEventListener("mouseenter", function () {
        isHovering = true;
    });

    viewport.addEventListener("mouseleave", function () {
        isHovering = false;
        pauseAutoScroll(500);
    });

    if (previousButton) {
        previousButton.addEventListener("click", function () {
            flingVelocity = 0;
            targetOffset -= step;
            pauseAutoScroll(1600);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            flingVelocity = 0;
            targetOffset += step;
            pauseAutoScroll(1600);
        });
    }

    render();
    requestAnimationFrame(frame);
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
