document.addEventListener("DOMContentLoaded", () => {
    const headerOffset = 100;
    const LINK_CLASS =
        "t:text-white t:hover:text-[#EC1C23] t:transition-colors t:block sidebar-link";

    // Build the category sidebar from each section's `id` + `data-title-cate`.
    // Clicking an item smooth-scrolls to its section; the scrollspy below keeps
    // the matching item highlighted while scrolling.
    buildCateNav();

    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");

            if (targetId && targetId.startsWith("#") && targetId.length > 1) {
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    e.preventDefault();
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }
        });
    });

    // ScrollSpy effect: Highlight active link when scrolling
    const sections = [];
    sidebarLinks.forEach((link) => {
        const targetId = link.getAttribute("href");
        if (targetId && targetId.startsWith("#") && targetId.length > 1) {
            try {
                const section = document.querySelector(targetId);
                if (section) sections.push({ link, section });
            } catch (e) {
                console.log(e);
            }
        }
    });

    window.addEventListener("scroll", () => {
        let currentSection = null;
        const triggerOffset = 150;

        sections.forEach(({ section }) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= triggerOffset) {
                currentSection = section;
            }
        });

        sidebarLinks.forEach((link) => {
            link.classList.remove("t:text-[#EC1C23]");
            link.classList.add("t:text-white");
        });

        if (currentSection) {
            try {
                const activeLink = document.querySelector(
                    `.sidebar-link[href="#${currentSection.id}"]`,
                );
                if (activeLink) {
                    activeLink.classList.remove("t:text-white");
                    activeLink.classList.add("t:text-[#EC1C23]");
                }
            } catch (e) {
                console.log(e);
            }
        }
    });

    // Render one sidebar item per `<section data-title-cate>` that also has an id.
    // Order follows the sections' order in the document.
    function buildCateNav() {
        const nav = document.querySelector("[data-cate-nav]");
        if (!nav) return;

        const sections = document.querySelectorAll("section[data-title-cate]");
        const frag = document.createDocumentFragment();

        sections.forEach((section) => {
            const id = section.id;
            const title = (section.getAttribute("data-title-cate") || "").trim();
            if (!id || !title) return;

            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `#${id}`;
            a.className = LINK_CLASS;
            a.textContent = title;
            li.appendChild(a);
            frag.appendChild(li);
        });

        nav.replaceChildren(frag);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("custom-video-player");
    if (!video) return;

    const playBtn = document.getElementById("custom-video-play-btn");
    const playIcon = document.getElementById("custom-video-play-icon");
    const pauseIcon = document.getElementById("custom-video-pause-icon");

    const progressContainer = document.getElementById("custom-video-progress-container");
    const progressBar = document.getElementById("custom-video-progress-bar");
    const timeDisplay = document.getElementById("custom-video-time");

    const muteBtn = document.getElementById("custom-video-mute-btn");
    const volUpIcon = document.getElementById("custom-video-vol-up-icon");
    const volOffIcon = document.getElementById("custom-video-vol-off-icon");

    const volContainer = document.getElementById("custom-video-vol-container");
    const volBar = document.getElementById("custom-video-vol-bar");

    // Format time (seconds to MM:SS)
    const formatTime = (time) => {
        const m = Math.floor(time / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${s}`;
    };

    // Initialize time display
    video.addEventListener("loadedmetadata", () => {
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });

    // Play/Pause
    const togglePlay = () => {
        if (video.paused) {
            video.play();
            playIcon.classList.add("t:hidden");
            pauseIcon.classList.remove("t:hidden");
        } else {
            video.pause();
            pauseIcon.classList.add("t:hidden");
            playIcon.classList.remove("t:hidden");
        }
    };

    playBtn.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay); // Play/pause by clicking video

    const progressThumb = document.getElementById("custom-video-progress-thumb-wrapper");

    let isDragging = false;

    // Helper to update progress UI
    const updateProgressUI = (pos) => {
        const percent = pos * 100;
        progressBar.style.width = `${percent}%`;
        if (progressThumb) {
            progressThumb.style.left = `${percent}%`;
        }
        timeDisplay.textContent = `${formatTime(pos * video.duration)} / ${formatTime(video.duration)}`;
    };

    // Update progress
    video.addEventListener("timeupdate", () => {
        if (!video.duration || isDragging) return;
        const pos = video.currentTime / video.duration;
        updateProgressUI(pos);
    });

    // Seek via progress bar
    const handleProgressChange = (e) => {
        const rect = progressContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));

        if (isDragging) {
            updateProgressUI(pos);
        } else {
            video.currentTime = pos * video.duration;
        }
    };

    progressContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        video.pause();
        handleProgressChange(e);
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            handleProgressChange(e);
        }
    });

    document.addEventListener("mouseup", (e) => {
        if (isDragging) {
            isDragging = false;
            const rect = progressContainer.getBoundingClientRect();
            let pos = (e.clientX - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            video.currentTime = pos * video.duration;
            video.play();
            playIcon.classList.add("t:hidden");
            pauseIcon.classList.remove("t:hidden");
        }
    });

    const volThumb = document.getElementById("custom-video-vol-thumb-wrapper");
    let isVolDragging = false;

    const updateVolUI = (pos) => {
        volBar.style.width = `${pos * 100}%`;
        if (volThumb) volThumb.style.left = `${pos * 100}%`;

        if (pos === 0) {
            video.muted = true;
            volUpIcon.classList.add("t:hidden");
            volOffIcon.classList.remove("t:hidden");
        } else {
            video.muted = false;
            volOffIcon.classList.add("t:hidden");
            volUpIcon.classList.remove("t:hidden");
        }
    };

    const handleVolChange = (e) => {
        const rect = volContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        video.volume = pos;
        updateVolUI(pos);
    };

    volContainer.addEventListener("mousedown", (e) => {
        isVolDragging = true;
        handleVolChange(e);
    });

    document.addEventListener("mousemove", (e) => {
        if (isVolDragging) {
            handleVolChange(e);
        }
    });

    document.addEventListener("mouseup", (e) => {
        if (isVolDragging) {
            isVolDragging = false;
            handleVolChange(e);
        }
    });

    // Mute/Unmute
    const toggleMute = () => {
        video.muted = !video.muted;
        if (video.muted) {
            volUpIcon.classList.add("t:hidden");
            volOffIcon.classList.remove("t:hidden");
            volBar.style.width = "0%";
            if (volThumb) volThumb.style.left = "0%";
        } else {
            volOffIcon.classList.add("t:hidden");
            volUpIcon.classList.remove("t:hidden");
            const vol = video.volume > 0 ? video.volume : 1;
            video.volume = vol;
            volBar.style.width = `${vol * 100}%`;
            if (volThumb) volThumb.style.left = `${vol * 100}%`;
        }
    };
    muteBtn.addEventListener("click", toggleMute);
});
