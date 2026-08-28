(function () {
    const articles = Array.isArray(window.RECKONER_ARTICLES) ? window.RECKONER_ARTICLES : [];
    const params = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash.replace(/^#/, "");
    const hashId = rawHash.indexOf("article=") === 0
        ? decodeURIComponent(rawHash.slice(8))
        : "";
    const requestedId = (hashId || params.get("article") || "insight-detail").toLowerCase();
    const article = articles.find(function (item) { return item.id === requestedId; }) || articles[0];

    const taxModernContent = {
        "badr-article": {
            title: "BADR at 18% and incorporation relief: the reliefs that decide the bill when you sell or restructure",
            intro: "Business Asset Disposal Relief has stepped up twice in two years, from 10% to 14% to 18%, while incorporation relief has not moved at all. Together they decide most of the tax when an owner sells up, retires or moves a business into a company. Here is how each works now, the goodwill trap that catches incorporations, the look through rule that rescues quick sales, and the deadlines that protect a claim.",
            meta: ["Updated July 2026", "Owner managed businesses", "Around an eight minute read"]
        },
        "stamp-duty-land-tax-2026": {
            title: "Stamp Duty Land Tax in 2026: what buyers, landlords and trusts pay now",
            intro: "The thresholds fell in April 2025, the surcharges have hardened, and the last Budget left the rates alone. Here is the whole picture in plain English, from first homes to company purchases, with the traps that cost real money and a quick estimate tool at the end.",
            meta: ["Updated July 2026", "England and Northern Ireland", "Around an eight minute read"]
        },
        "inheritance-tax-final": {
            title: "Inheritance Tax: the freeze, the allowances and what still works",
            intro: "Britain's least loved tax keeps collecting record sums without a single rate rise. The thresholds are frozen into a third decade while homes, portfolios and estates drift upwards, so the bill increasingly lands on families who never expected one. Here is how the allowances work, the myths worth dropping, and the reliefs that still do real work.",
            meta: ["Updated July 2026", "Estates, gifts and succession", "Around a six minute read"]
        }
    };

    if (!article) {
        document.querySelector("[data-article-page]").innerHTML = '<section class="detail-error"><h1>Article unavailable</h1><a href="insights.html">Back to Insights</a></section>';
        return;
    }

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (element) element.textContent = value || "";
    }

    function slugify(value, index) {
        const slug = (value || "section")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        return slug || "section-" + index;
    }

    document.title = article.title + " | Reckoner Audit";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = article.description;

    setText("[data-article-category]", article.category);
    setText("[data-article-title]", article.title);
    setText("[data-article-author]", article.author);
    setText("[data-article-date]", article.displayDate);
    setText("[data-article-read-time]", article.readTime);

    const taxModern = taxModernContent[article.id] || {
        title: article.title,
        intro: article.description,
        meta: [article.displayDate, article.category, article.readTime]
    };

    document.body.classList.add("is-tax-modern");
    document.title = taxModern.title + " | Reckoner Audit";
    setText("[data-article-category]", "Insights");
    setText("[data-article-date]", taxModern.meta[0]);
    setText("[data-article-sector]", taxModern.meta[1]);
    setText("[data-article-read-time]", taxModern.meta[2]);

    const titleElement = document.querySelector("[data-article-title]");
    const titleWords = taxModern.title.split(/\s+/);
    const colonIndex = taxModern.title.indexOf(":");
    const splitIndex = colonIndex > -1
        ? colonIndex + 1
        : taxModern.title.indexOf(" ", Math.floor(taxModern.title.length * .48));
    const safeSplit = splitIndex > 0 ? splitIndex : Math.max(1, titleWords.slice(0, Math.ceil(titleWords.length * .55)).join(" ").length);
    titleElement.textContent = taxModern.title.slice(0, safeSplit).trim() + " ";
    const shine = document.createElement("span");
    shine.className = "detail-title-shine";
    shine.textContent = taxModern.title.slice(safeSplit).trim();
    titleElement.appendChild(shine);

    const intro = document.createElement("p");
    intro.className = "detail-tax-intro";
    intro.textContent = taxModern.intro;
    titleElement.insertAdjacentElement("afterend", intro);

    const authorImage = document.querySelector("[data-article-author-image]");
    authorImage.src = article.authorImage;
    authorImage.alt = article.author;

    const heroImage = document.querySelector("[data-article-image]");
    heroImage.src = article.image;
    heroImage.alt = article.title;
    document.querySelector(".detail-hero").style.backgroundImage = 'url("' + article.image + '")';

    const sourceLink = document.querySelector("[data-article-source]");
    sourceLink.href = article.source;

    const staging = document.createElement("div");
    staging.innerHTML = article.body;
    staging.querySelectorAll("script, style").forEach(function (element) { element.remove(); });

    const legacyContent = staging.querySelector(".newsdetailcontent");
    const content = legacyContent || staging;
    const body = document.querySelector("[data-article-body]");
    body.innerHTML = content.innerHTML;
    body.classList.add("rk-article-local");

    const firstHeading = body.querySelector("h1, h2");
    if (firstHeading) {
        const headingText = firstHeading.textContent.replace(/\s+/g, " ").trim().toLowerCase();
        const titleText = article.title.replace(/\s+/g, " ").trim().toLowerCase();
        if (headingText === titleText || titleText.indexOf(headingText) === 0 || headingText.indexOf(titleText) === 0) {
            firstHeading.remove();
        }
    }

    body.querySelectorAll("a[href]").forEach(function (link) {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("http") && !href.startsWith("mailto:")) {
            link.href = new URL(href, article.source).href;
            link.target = "_blank";
            link.rel = "noopener";
        }
    });

    const headings = Array.from(body.querySelectorAll("h2, h3")).filter(function (heading) {
        return heading.textContent.trim().length > 0;
    });
    const usedIds = new Set();
    headings.forEach(function (heading, index) {
        let id = heading.id || slugify(heading.textContent, index);
        while (usedIds.has(id)) id += "-" + (index + 1);
        usedIds.add(id);
        heading.id = id;
    });

    const toc = document.querySelector("[data-article-toc]");
    headings.slice(0, 10).forEach(function (heading) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent.trim();
        item.appendChild(link);
        toc.appendChild(item);
    });
    if (!toc.children.length) document.querySelector(".detail-toc-card").hidden = true;

    const chips = document.createElement("nav");
    chips.className = "detail-tax-chips";
    const chipsInner = document.createElement("div");
    chipsInner.className = "hub-shell detail-tax-chips__inner";
    const revealSections = Array.from(body.querySelectorAll(".rk-reveal")).slice(0, 7);
    const chipItems = revealSections.length
        ? revealSections.map(function (section, index) {
            const kicker = section.querySelector(".rk-kicker");
            const heading = section.querySelector("h2");
            return {
                target: section,
                label: kicker
                    ? kicker.textContent.trim()
                    : (heading ? heading.textContent.trim() : (index === 0 ? "Overview" : "Section " + (index + 1)))
            };
        })
        : headings.slice(0, 7).map(function (heading) {
            return { target: heading, label: heading.textContent.trim() };
        });

    chipItems.forEach(function (item, index) {
            const target = item.target;
            const link = document.createElement("a");
            if (!target.id) target.id = "article-section-" + (index + 1);
            link.href = "#" + target.id;
            link.textContent = item.label;
            link.addEventListener("click", function (event) {
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                window.history.replaceState(null, "", "#" + target.id);
            });
            chipsInner.appendChild(link);
    });
    if (chipItems.length) {
        chips.appendChild(chipsInner);
        document.querySelector(".detail-content-section").insertAdjacentElement("beforebegin", chips);
    }

    const related = articles
        .filter(function (item) { return item.id !== article.id; })
        .sort(function (a, b) {
            const aMatch = a.category === article.category ? 1 : 0;
            const bMatch = b.category === article.category ? 1 : 0;
            return bMatch - aMatch || new Date(b.date) - new Date(a.date);
        })
        .slice(0, 4);

    const relatedList = document.querySelector("[data-related-articles]");
    related.forEach(function (item) {
        const link = document.createElement("a");
        link.className = "detail-related-item";
        link.href = "article.html#article=" + encodeURIComponent(item.id);
        link.innerHTML = '<span>' + item.category + '</span><strong>' + item.title + '</strong><small>' + item.displayDate + '</small>';
        relatedList.appendChild(link);
    });

    window.addEventListener("hashchange", function () {
        if (window.location.hash.indexOf("#article=") === 0) {
            window.location.reload();
        }
    });
})();
