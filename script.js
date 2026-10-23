const changingText = document.getElementById("changing-text");
const themeToggle = document.getElementById("theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const scrollProgress = document.getElementById("scroll-progress");
const scrollCurrent = document.getElementById("scroll-current");
const scrollMarker = document.getElementById("scroll-marker");
const scrollNav = document.querySelector(".scroll-rail-nav");
const scrollLinks = [...document.querySelectorAll(".scroll-rail-nav a")];
const sections = [...document.querySelectorAll("main > section")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const savedTheme = document.documentElement.dataset.theme || "light";

themeToggle.setAttribute("aria-pressed", String(savedTheme === "dark"));
themeToggle.setAttribute("aria-label", `Switch to ${savedTheme === "dark" ? "light" : "dark"} mode`);
themeToggle.querySelector(".theme-toggle-label").textContent = savedTheme === "dark" ? "LIGHT" : "DARK";
themeColor.content = savedTheme === "dark" ? "#111111" : "#f3f3ef";

const revealItems = document.querySelectorAll(
    "main > section:not(.hero), .section-heading, .about > p, .section-grid > .card, #pc-specs .specs-divider, #pc-specs .peripherals-title"
);

revealItems.forEach((item) => item.classList.add("reveal"));
document.querySelectorAll(".section-grid").forEach((grid) => {
    grid.querySelectorAll(":scope > .card").forEach((card, index) => {
        card.style.setProperty("--reveal-delay", `${Math.min(index * 80, 320)}ms`);
    });
});

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach((item) => revealObserver.observe(item));
}

themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme !== "dark";
    const theme = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("bedanta-theme", theme);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeToggle.querySelector(".theme-toggle-label").textContent = isDark ? "LIGHT" : "DARK";
    themeColor.content = isDark ? "#111111" : "#f3f3ef";
});

const texts = [
    "Electrical Engineering Student",
    "Really Good Video Gamer",
    "Building Weird Internet Things"
];

let textIndex = 0;

setInterval(() => {
    if (document.hidden) {
        return;
    }

    textIndex = (textIndex + 1) % texts.length;
    changingText.textContent = texts[textIndex];
    changingText.classList.remove("text-change");
    void changingText.offsetWidth;
    changingText.classList.add("text-change");
}, 2500);

const updateScrollProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    const normalizedProgress = Math.min(Math.max(progress, 0), 1);
    scrollProgress.style.setProperty("--scroll-progress", String(normalizedProgress));

    if (!prefersReducedMotion.matches) {
        document.documentElement.style.setProperty(
            "--background-parallax-y",
            `${window.scrollY * -0.04}px`
        );
    }

    const activationLine = window.scrollY + 32;
    const sectionOffsets = sections.map((section) => section.getBoundingClientRect().top + window.scrollY);
    const navBounds = scrollNav.getBoundingClientRect();
    const isCompact = window.matchMedia("(max-width: 1100px)").matches;
    const markerPositions = scrollLinks.map((link) => {
        const bounds = link.getBoundingClientRect();
        return isCompact
            ? bounds.left - navBounds.left + bounds.width / 2 - scrollMarker.offsetWidth / 2
            : bounds.top - navBounds.top + bounds.height / 2 - scrollMarker.offsetHeight / 2;
    });

    let activeIndex = 0;
    while (activeIndex < sectionOffsets.length - 1 && activationLine >= sectionOffsets[activeIndex + 1]) {
        activeIndex++;
    }

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        activeIndex = sections.length - 1;
    }

    const markerPosition = markerPositions[activeIndex];

    scrollMarker.style.setProperty(
        isCompact ? "--rail-marker-x" : "--rail-marker-y",
        `${markerPosition}px`
    );
    setActiveSection(sections[activeIndex].id);
};

let progressFrame = 0;
const scheduleProgressUpdate = () => {
    if (progressFrame) {
        return;
    }

    progressFrame = window.requestAnimationFrame(() => {
        updateScrollProgress();
        progressFrame = 0;
    });
};

window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
window.addEventListener("resize", scheduleProgressUpdate);
if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleProgressUpdate).observe(document.querySelector(".container"));
}

const setActiveSection = (sectionId) => {
    const activeLink = scrollLinks.find((link) => link.hash === `#${sectionId}`);
    if (!activeLink) {
        return;
    }

    scrollLinks.forEach((link) => {
        if (link === activeLink) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    scrollCurrent.textContent = activeLink.dataset.sectionName;
};

updateScrollProgress();
