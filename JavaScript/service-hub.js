/**
 * Reusable service-tab hub.
 * Renders a horizontally scrollable tab list and a two-column detail panel
 * from a plain data array, so the same markup/JS works for pages with any
 * number of services. Consuming pages provide `window.SERVICE_HUB_DATA`
 * (an array of {id, name, description, image, imageAlt, benefits[], cta})
 * before this script runs.
 */
(function () {
    "use strict";

    function initHub(root) {
        var data = window.SERVICE_HUB_DATA;

        if (!Array.isArray(data) || !data.length) {
            return;
        }

        var track = root.querySelector("[data-hub-track]");
        var viewport = root.querySelector("[data-hub-viewport]");
        var tabsWrap = root.querySelector("[data-hub-tabs]");
        var prevButton = root.querySelector("[data-hub-prev]");
        var nextButton = root.querySelector("[data-hub-next]");
        var panelInner = root.querySelector("[data-hub-panel-inner]");

        if (!track || !panelInner) {
            return;
        }

        var reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        var activeIndex = 0;
        var tabButtons = [];
        var isDragging = false;
        var dragMoved = false;
        var dragStartX = 0;
        var dragStartScroll = 0;

        data.forEach(function (service, index) {
            var button = document.createElement("button");
            var numberLabel = String(index + 1).padStart(2, "0");

            button.type = "button";
            button.className = "hub-tab";
            button.id = "hub-tab-" + service.id;
            button.setAttribute("role", "tab");
            button.setAttribute("aria-selected", index === 0 ? "true" : "false");
            button.setAttribute("aria-controls", "hub-panel-content");
            button.setAttribute("tabindex", index === 0 ? "0" : "-1");
            button.innerHTML =
                '<span class="hub-tab__index">' + numberLabel + "</span><span>" +
                (service.navLabel || service.name) + "</span>";

            button.addEventListener("click", function () {
                if (dragMoved) {
                    return;
                }

                activate(index, {
                    focusTab:false
                });
            });

            track.appendChild(button);
            tabButtons.push(button);
        });

        track.setAttribute("role", "tablist");

        function renderPanel(index) {
            var service = data[index];
            var benefitItems = (service.benefits || [])
                .map(function (item) {
                    return "<li>" + item + "</li>";
                })
                .join("");
            var ctaLabel = (service.cta && service.cta.label) || "Get in touch";
            var ctaHref = (service.cta && service.cta.href) || "#contact";

            // Cache-bust image src so local file updates appear immediately in browser
            var imgSrc = service.image || '';
            if (imgSrc) {
                imgSrc += (imgSrc.indexOf('?') === -1 ? '?v=' : '&v=') + Date.now();
            }

            panelInner.innerHTML =
                '<div class="hub-panel__media">' +
                    '<img src="' + imgSrc + '" alt="' + service.imageAlt + '" loading="lazy">' +
                "</div>" +
                '<div class="hub-panel__content">' +
                    '<p class="hub-kicker">Service ' + String(service.serviceNumber || (index + 1)).padStart(2, "0") + "</p>" +
                    "<h2>" + service.name + "</h2>" +
                    '<p class="hub-panel__desc">' + service.description + "</p>" +
                    '<p class="hub-panel__label">What we help with</p>' +
                    '<ul class="hub-panel__list">' + benefitItems + "</ul>" +
                    '<a class="hub-btn hub-btn--dark hub-panel__cta" href="' + ctaHref + '">' +
                        ctaLabel + " &rarr;" +
                    "</a>" +
                "</div>";

            panelInner.setAttribute("id", "hub-panel-content");
            panelInner.setAttribute("role", "tabpanel");
            panelInner.setAttribute(
                "aria-labelledby",
                "hub-tab-" + service.id
            );
        }

        function activate(index, options) {
            var settings = options || {};

            if (index === activeIndex && panelInner.childNodes.length) {
                return;
            }

            activeIndex = index;

            tabButtons.forEach(function (button, buttonIndex) {
                var isActive = buttonIndex === index;

                button.setAttribute("aria-selected", isActive ? "true" : "false");
                button.setAttribute("tabindex", isActive ? "0" : "-1");
            });

            if (settings.focusTab) {
                tabButtons[index].focus();
            }

            scrollTabIntoView(tabButtons[index]);

            if (reduceMotion) {
                renderPanel(index);
            } else {
                panelInner.classList.add("is-fading");
                window.setTimeout(function () {
                    renderPanel(index);
                    panelInner.classList.remove("is-fading");
                }, 220);
            }
        }

        function scrollTabIntoView(tabButton) {
            if (!tabButton) {
                return;
            }

            var trackRect = track.getBoundingClientRect();
            var tabRect = tabButton.getBoundingClientRect();

            if (tabRect.left < trackRect.left || tabRect.right > trackRect.right) {
                tabButton.scrollIntoView({
                    behavior:reduceMotion ? "auto" : "smooth",
                    inline:"center",
                    block:"nearest"
                });
            }
        }

        function updateOverflowState() {
            var maxScroll = track.scrollWidth - track.clientWidth;
            var isScrollable = maxScroll > 4;

            if (tabsWrap) {
                tabsWrap.classList.toggle("is-scrollable", isScrollable);
            }

            if (prevButton) {
                prevButton.disabled = !isScrollable || track.scrollLeft <= 2;
            }

            if (nextButton) {
                nextButton.disabled = !isScrollable || track.scrollLeft >= maxScroll - 2;
            }

            if (viewport) {
                viewport.classList.toggle(
                    "is-fade-left",
                    isScrollable && track.scrollLeft > 2
                );
                viewport.classList.toggle(
                    "is-fade-right",
                    isScrollable && track.scrollLeft < maxScroll - 2
                );
            }
        }

        function scrollByAmount(direction) {
            var firstTab = tabButtons[0];
            var step = firstTab ? firstTab.offsetWidth + 40 : 220;

            track.scrollBy({
                left:direction * step,
                behavior:reduceMotion ? "auto" : "smooth"
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                scrollByAmount(-1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                scrollByAmount(1);
            });
        }

        track.addEventListener("scroll", updateOverflowState, {
            passive:true
        });
        window.addEventListener("resize", updateOverflowState);

        track.addEventListener("wheel", function (event) {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }

            var maxScroll = track.scrollWidth - track.clientWidth;

            if (maxScroll <= 0) {
                return;
            }

            event.preventDefault();
            track.scrollLeft += event.deltaY;
        }, {
            passive:false
        });

        track.addEventListener("pointerdown", function (event) {
            if (event.pointerType === "touch") {
                return;
            }

            isDragging = true;
            dragMoved = false;
            dragStartX = event.clientX;
            dragStartScroll = track.scrollLeft;
            track.classList.add("is-dragging");
        });

        window.addEventListener("pointermove", function (event) {
            if (!isDragging) {
                return;
            }

            var delta = event.clientX - dragStartX;

            if (Math.abs(delta) > 4) {
                dragMoved = true;
            }

            track.scrollLeft = dragStartScroll - delta;
        });

        window.addEventListener("pointerup", function () {
            if (!isDragging) {
                return;
            }

            isDragging = false;
            track.classList.remove("is-dragging");
            window.setTimeout(function () {
                dragMoved = false;
            }, 0);
        });

        track.addEventListener("keydown", function (event) {
            var currentIndex = tabButtons.indexOf(document.activeElement);
            var targetIndex = null;

            if (currentIndex === -1) {
                return;
            }

            if (event.key === "ArrowRight") {
                targetIndex = Math.min(currentIndex + 1, data.length - 1);
            } else if (event.key === "ArrowLeft") {
                targetIndex = Math.max(currentIndex - 1, 0);
            } else if (event.key === "Home") {
                targetIndex = 0;
            } else if (event.key === "End") {
                targetIndex = data.length - 1;
            }

            if (targetIndex === null) {
                return;
            }

            event.preventDefault();
            activate(targetIndex, {
                focusTab:true
            });
        });

        var initialIndex = 0;
        var hash = window.location.hash.replace("#", "");
        var hashIndex = data.findIndex(function (service) {
            return service.id === hash;
        });

        if (hashIndex > -1) {
            initialIndex = hashIndex;
        }

        activeIndex = initialIndex;
        tabButtons.forEach(function (button, buttonIndex) {
            var isActive = buttonIndex === initialIndex;

            button.setAttribute("aria-selected", isActive ? "true" : "false");
            button.setAttribute("tabindex", isActive ? "0" : "-1");
        });
        renderPanel(initialIndex);
        updateOverflowState();

        if (initialIndex > 0) {
            window.requestAnimationFrame(function () {
                scrollTabIntoView(tabButtons[initialIndex]);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("[data-service-hub]").forEach(initHub);
    });
})();
