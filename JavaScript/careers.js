(function () {
    "use strict";

    const jobs = Array.isArray(window.RECKONER_JOBS) ? window.RECKONER_JOBS : [];
    const activeJobs = jobs.filter(function (job) { return job.status === "active"; });

    function getJob() {
        const id = new URLSearchParams(window.location.search).get("job");
        return activeJobs.find(function (job) { return job.id === id; }) || activeJobs[0];
    }

    function detailUrl(job) {
        return "job-details.html?job=" + encodeURIComponent(job.id);
    }

    function applyUrl(job) {
        return "job-application.html?job=" + encodeURIComponent(job.id);
    }

    function icon(name) {
        const icons = {
            location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
            briefcase: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
            team: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c.4-4.2 2.4-6 6-6s5.6 1.8 6 6M15 15c3.5-.5 5.4 1.1 6 4"/></svg>',
            level: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10M10 20V6h4v14M16 20V3h4v17"/></svg>',
            calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>'
        };
        return icons[name] || "";
    }

    function cardMarkup(job) {
        return '<article class="career-job-card">' +
            '<div class="career-job-card__top"><span class="career-job-card__department">' + job.department + '</span><span class="career-job-card__status">Open</span></div>' +
            '<h3>' + job.title + '</h3>' +
            '<div class="career-job-card__meta">' +
                '<span>' + icon("location") + job.location + '</span>' +
                '<span>' + icon("briefcase") + job.jobType + '</span>' +
                '<span>' + icon("level") + job.experienceRequired + '</span>' +
            '</div>' +
            '<p>' + job.summary + '</p>' +
            '<a class="career-text-link" href="' + detailUrl(job) + '" aria-label="View ' + job.title + ' vacancy">View job <span aria-hidden="true">→</span></a>' +
        '</article>';
    }

    function initListings() {
        const list = document.querySelector("[data-job-list]");
        if (!list) return;

        const search = document.querySelector("[data-job-search]");
        const department = document.querySelector("[data-filter-department]");
        const location = document.querySelector("[data-filter-location]");
        const type = document.querySelector("[data-filter-type]");
        const level = document.querySelector("[data-filter-level]");
        const count = document.querySelector("[data-job-count]");
        const empty = document.querySelector("[data-jobs-empty]");
        const resets = document.querySelectorAll("[data-filter-reset]");

        Array.from(new Set(activeJobs.map(function (job) { return job.location; }))).forEach(function (place) {
            const option = document.createElement("option");
            option.value = place;
            option.textContent = place;
            location.appendChild(option);
        });

        function render() {
            const term = search.value.trim().toLowerCase();
            const filtered = activeJobs.filter(function (job) {
                return (!term || (job.title + " " + job.department + " " + job.summary).toLowerCase().includes(term)) &&
                    (!department.value || job.department === department.value) &&
                    (!location.value || job.location === location.value) &&
                    (!type.value || job.jobType === type.value) &&
                    (!level.value || job.experienceLevel === level.value);
            });

            list.innerHTML = filtered.map(cardMarkup).join("");
            count.textContent = filtered.length + (filtered.length === 1 ? " open position" : " open positions");
            empty.hidden = filtered.length !== 0;
        }

        [search, department, location, type, level].forEach(function (control) {
            control.addEventListener(control === search ? "input" : "change", render);
        });

        resets.forEach(function (reset) {
            reset.addEventListener("click", function () {
                search.value = "";
                department.value = "";
                location.value = "";
                type.value = "";
                level.value = "";
                render();
                search.focus();
            });
        });

        render();
    }

    function metaItem(iconName, label, value) {
        return '<div class="career-role-meta__item"><span class="career-role-meta__icon">' + icon(iconName) + '</span><div><small>' + label + '</small><strong>' + value + '</strong></div></div>';
    }

    function initDetails() {
        const page = document.querySelector("[data-job-detail]");
        if (!page) return;
        const job = getJob();
        if (!job) return;

        document.title = job.title + " | Careers | Reckoner Audit";
        document.querySelectorAll("[data-job-title]").forEach(function (el) { el.textContent = job.title; });
        document.querySelector("[data-job-department]").textContent = job.department;
        document.querySelector("[data-job-summary]").textContent = job.about;
        document.querySelector("[data-job-meta]").innerHTML =
            metaItem("location", "Location", job.location) +
            metaItem("briefcase", "Job type", job.jobType) +
            metaItem("team", "Department", job.department) +
            metaItem("level", "Experience", job.experienceRequired);
        document.querySelector("[data-responsibilities]").innerHTML = job.responsibilities.map(function (item) { return "<li>" + item + "</li>"; }).join("");
        document.querySelector("[data-requirements]").innerHTML = job.requirements.map(function (item) { return "<li>" + item + "</li>"; }).join("");
        document.querySelector("[data-qualifications]").innerHTML = job.qualifications.map(function (item) { return "<li>" + item + "</li>"; }).join("");
        document.querySelector("[data-benefits]").innerHTML = job.benefits.map(function (item) {
            return '<article class="career-benefit"><span class="career-benefit__icon" aria-hidden="true">' + benefitIcon(item) + '</span><h3>' + item + '</h3><p>' + benefitDescription(item) + '</p></article>';
        }).join("");
        document.querySelector("[data-job-deadline]").textContent = job.deadline;
        document.querySelectorAll("[data-apply-link]").forEach(function (link) { link.href = applyUrl(job); });
    }

    function benefitIcon(title) {
        const icons = {
            "Professional Development": '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="career-benefit-icon-gradient" x1="3" y1="4" x2="21" y2="20"><stop stop-color="#ea1738"/><stop offset="1" stop-color="#f4a950"/></linearGradient></defs><path d="M4 19.5V5.8a1.8 1.8 0 0 1 1.8-1.8H20v15.5H5.8A1.8 1.8 0 0 0 4 21.3"/><path d="M4 19.5c0-1 0.8-1.8 1.8-1.8H20M8 8h8M8 12h5"/></svg>',
            "Learning & Training": '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="career-benefit-icon-gradient" x1="3" y1="4" x2="21" y2="20"><stop stop-color="#ea1738"/><stop offset="1" stop-color="#f4a950"/></linearGradient></defs><path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M7 10.2v5.1c2.7 2.2 7.3 2.2 10 0v-5.1M21 8v6"/></svg>',
            "Career Growth": '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="career-benefit-icon-gradient" x1="3" y1="4" x2="21" y2="20"><stop stop-color="#ea1738"/><stop offset="1" stop-color="#f4a950"/></linearGradient></defs><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 6-7"/><path d="M16 6h4v4"/></svg>',
            "Collaborative Environment": '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="career-benefit-icon-gradient" x1="3" y1="4" x2="21" y2="20"><stop stop-color="#ea1738"/><stop offset="1" stop-color="#f4a950"/></linearGradient></defs><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.4-3.2 2.2-5 5.5-5s5.1 1.8 5.5 5M14 15.5c3.5-.6 5.8 1 6.5 4.5"/></svg>',
            "Exposure to Diverse Clients": '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="career-benefit-icon-gradient" x1="3" y1="4" x2="21" y2="20"><stop stop-color="#ea1738"/><stop offset="1" stop-color="#f4a950"/></linearGradient></defs><rect x="3" y="6" width="18" height="14" rx="1.5"/><path d="M8 6V4h8v2M3 11h18M9 14h6"/></svg>',
            "Mentorship & Support": '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="career-benefit-icon-gradient" x1="3" y1="4" x2="21" y2="20"><stop stop-color="#ea1738"/><stop offset="1" stop-color="#f4a950"/></linearGradient></defs><path d="M12 20s-7-4.4-7-10.1C5 7.7 6.7 6 8.8 6c1.4 0 2.6.8 3.2 2 .6-1.2 1.8-2 3.2-2C17.3 6 19 7.7 19 9.9 19 15.6 12 20 12 20Z"/><path d="M8.5 12h2l1-2 1.5 4 1-2h1.5"/></svg>'
        };
        return icons[title] || '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8"/><path d="m9 12 2 2 4-4"/></svg>';
    }

    function benefitDescription(title) {
        const copy = {
            "Professional Development": "Support for recognised qualifications and continuous professional learning.",
            "Learning & Training": "Structured learning shaped around your role and long-term ambitions.",
            "Career Growth": "Clear opportunities to take on responsibility and progress with confidence.",
            "Collaborative Environment": "Work alongside thoughtful people who share knowledge openly.",
            "Exposure to Diverse Clients": "Build broad experience through varied sectors and assignments.",
            "Mentorship & Support": "Practical guidance from experienced professionals invested in your growth."
        };
        return copy[title] || "Benefits designed to help you do your best work.";
    }

    function initApplication() {
        const form = document.querySelector("[data-application-form]");
        if (!form) return;
        const job = getJob();
        if (!job) return;

        document.title = "Apply for " + job.title + " | Reckoner Audit";
        form.elements.position.value = job.title;
        document.querySelector("[data-back-to-job]").href = detailUrl(job);
        document.querySelector("[data-audit-fields]").hidden = job.department !== "Audit & Assurance";

        const fileInput = form.elements.resume;
        const fileName = document.querySelector("[data-file-name]");
        const fileState = document.querySelector("[data-file-state]");

        function setFieldError(field, message) {
            const group = field.closest(".career-field, .career-consent, .career-upload");
            if (!group) return;
            const error = group.querySelector(".career-field__error");
            group.classList.toggle("has-error", Boolean(message));
            field.setAttribute("aria-invalid", message ? "true" : "false");
            if (error) error.textContent = message || "";
        }

        function validFile() {
            const file = fileInput.files[0];
            if (!file) {
                setFieldError(fileInput, "Please upload your CV or resume.");
                return false;
            }
            const allowed = /\.(pdf|doc|docx)$/i.test(file.name);
            if (!allowed) {
                setFieldError(fileInput, "Upload a PDF, DOC or DOCX file.");
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                setFieldError(fileInput, "Your file must be 10 MB or smaller.");
                return false;
            }
            setFieldError(fileInput, "");
            return true;
        }

        fileInput.addEventListener("change", function () {
            if (!validFile()) {
                fileName.textContent = "Choose a PDF, DOC or DOCX";
                fileState.textContent = "";
                return;
            }
            const file = fileInput.files[0];
            fileName.textContent = file.name;
            fileState.textContent = "Uploading…";
            window.setTimeout(function () { fileState.textContent = "Ready to submit"; }, 650);
        });

        Array.from(form.elements).forEach(function (field) {
            if (!field.name || field.type === "file" || field.type === "hidden" || field.type === "submit") return;
            field.addEventListener("blur", function () {
                if (field.required && !field.checkValidity()) {
                    setFieldError(field, field.type === "email" && field.value ? "Enter a valid email address." : "This field is required.");
                } else {
                    setFieldError(field, "");
                }
            });
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            let valid = true;
            Array.from(form.elements).forEach(function (field) {
                if (!field.required || field.type === "file") return;
                if (!field.checkValidity()) {
                    setFieldError(field, field.type === "email" && field.value ? "Enter a valid email address." : "This field is required.");
                    valid = false;
                } else {
                    setFieldError(field, "");
                }
            });
            if (!validFile()) valid = false;

            if (!valid) {
                const firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
                if (firstError) firstError.focus();
                document.querySelector("[data-form-status]").textContent = "Please review the highlighted fields.";
                return;
            }

            const button = form.querySelector("button[type='submit']");
            button.disabled = true;
            button.innerHTML = 'Submitting application <span class="career-button-spinner" aria-hidden="true"></span>';
            document.querySelector("[data-form-status]").textContent = "Your application is being submitted securely.";

            window.setTimeout(function () {
                const hero = document.querySelector("[data-application-hero]");
                if (hero) hero.hidden = true;
                document.querySelector("[data-application-panel]").hidden = true;
                const success = document.querySelector("[data-application-success]");
                success.hidden = false;
                success.querySelector("[data-success-job]").textContent = job.title;
                window.scrollTo({ top: 0, behavior: "smooth" });
                success.focus();
            }, 1100);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initListings();
        initDetails();
        initApplication();
    });
})();
