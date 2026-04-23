document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Smooth Fade-In Effect
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 50);

    // 2. Back Button Override (Smooth Fade Out)
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            if (window.history.length > 1) {
                e.preventDefault();
                document.body.style.opacity = '0';
                setTimeout(() => {
                    window.history.back();
                }, 400); 
            }
        });
    }

    // 3. Up/Down Arrow Key Control for Snap Scrolling
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'textarea') {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
            }
        }
    });

    // 4. THE SMART AUTO-LOADER
    const gallery = document.getElementById('dynamic-gallery');
    let currentIndex = 1;
    const maxFiles = 50; 
    
    function tryLoadMedia(index) {
        if (index > maxFiles) {
            const loader = document.querySelector('.loading-pulse');
            if (loader) loader.remove();
            return;
        }

        let numStr = index.toString().padStart(2, '0'); // Formats 1 to "01"
        let extensions = ['.jpg', '.jpeg', '.png', '.mp4'];
        let extIndex = 0;

        function checkNextExtension() {
            // If we checked all extensions for a number and found nothing, we reached the end of the folder!
            if (extIndex >= extensions.length) {
                const loader = document.querySelector('.loading-pulse');
                if (loader) loader.remove(); // Safely remove loader ONLY when everything is done
                return; 
            }

            let ext = extensions[extIndex];
            let url = `${numStr}${ext}`;

            if (ext === '.mp4') {
                let vid = document.createElement('video');
                vid.src = url;
                
                // If this number IS a video...
                vid.onloadeddata = () => {
                    vid.autoplay = true; 
                    vid.muted = true; 
                    vid.loop = true; 
                    vid.playsInline = true;
                    vid.controls = true; 
                    vid.className = 'project-media snap-section'; 
                    gallery.appendChild(vid);
                    
                    // Keep pushing the loader below the new media
                    const loader = document.querySelector('.loading-pulse');
                    if (loader) gallery.appendChild(loader);

                    // Move on to the next number
                    tryLoadMedia(index + 1); 
                };
                
                // If this number IS NOT a video, try the next extension...
                vid.onerror = () => {
                    extIndex++; 
                    checkNextExtension(); 
                };
            } else {
                let img = new Image();
                img.src = url;
                
                // If this number IS an image...
                img.onload = () => {
                    img.className = 'project-media snap-section';
                    img.loading = "lazy";
                    img.alt = `Project Media ${numStr}`;
                    gallery.appendChild(img);
                    
                    // Keep pushing the loader below the new media
                    const loader = document.querySelector('.loading-pulse');
                    if (loader) gallery.appendChild(loader);

                    // Move on to the next number
                    tryLoadMedia(index + 1); 
                };
                
                // If this number IS NOT this image type, try the next extension...
                img.onerror = () => {
                    extIndex++; 
                    checkNextExtension(); 
                };
            }
        }
        
        // Start the hunt for the current number
        checkNextExtension();
    }

    // Kick off the auto-loader starting at file 01
    if (gallery) {
        tryLoadMedia(currentIndex);
    }

   // 5. RANDOM "EXPLORE MORE" GENERATOR
    const projectDatabase = [
        // --- PHOTOGRAPHY ---
        { title: "Error 404: Light not found", thumb: "../../../works/photography/404/thumb.jpg", link: "../../../works/photography/404/project.html" },
        { title: "Photowalk: Mullick Ghat", thumb: "../../../works/photography/mullick/thumb.jpg", link: "../../../works/photography/mullick/project.html" },
        { title: "Runway: Vilom", thumb: "../../../works/photography/vilom/thumb.jpg", link: "../../../works/photography/vilom/project.html" },
        { title: "Sundarban: Biosphere and Tiger Reserve", thumb: "../../../works/photography/sundarban/thumb.jpg", link: "../../../works/photography/sundarban/project.html" },
        { title: "Photowalk: Vilom", thumb: "../../../works/photography/villom2/thumb.jpg", link: "../../../works/photography/villom2/project.html" },
        { title: "Puja of Innocence", thumb: "../../../works/photography/pandal/thumb.jpg", link: "../../../works/photography/pandal/project.html" },

        // --- CREATIVE DIRECTION ---
        { title: "Once upon a time in hollywood", thumb: "../../../works/creative-direction/once-upon-a-time-in-hollywood/thumb.jpg", link: "../../../works/creative-direction/once-upon-a-time-in-hollywood/project.html" },
        { title: "La Vie en Rose", thumb: "../../../works/creative-direction/la-vie-en-rose/thumb.jpg", link: "../../../works/creative-direction/la-vie-en-rose/project.html" },
        { title: "Tailored to Silence the Room", thumb: "../../../works/creative-direction/fashion-photography/thumb.jpg", link: "../../../works/creative-direction/fashion-photography/project.html" },
        { title: "The Sartorial Edit", thumb: "../../../works/creative-direction/styling-shoot/thumb.jpg", link: "../../../works/creative-direction/styling-shoot/project.html" },
        { title: "Coastal Campaign", thumb: "../../../works/creative-direction/beach-shoot/thumb.jpg", link: "../../../works/creative-direction/beach-shoot/project.html" },

        // --- BRANDING ---
        { title: "Gaia Dimiourgia", thumb: "../../../works/branding/gaia-dimiourgia/thumb.jpg", link: "../../../works/branding/gaia-dimiourgia/project.html" },
        { title: "UI/UX and Branding: Proto", thumb: "../../../works/branding/proto/thumb.jpg", link: "../../../works/branding/proto/project.html" },
        { title: "Typeface design: Looped", thumb: "../../../works/branding/looped/thumb.jpg", link: "../../../works/branding/looped/project.html" },

        // --- MISCELLANEOUS (Archive) ---
        { title: "Vilom Trailer", thumb: "../../../works/archive/vilom-trailer/thumb.jpg", link: "../../../works/archive/vilom-trailer/project.html" },
        { title: "Branding: Loco Lock", thumb: "../../../works/archive/loco-lock/thumb.jpg", link: "../../../works/archive/loco-lock/project.html" },
        { title: "Kumartuli Shoot", thumb: "../../../works/archive/kumartuli-shoot/thumb.jpg", link: "../../../works/archive/kumartuli-shoot/project.html" },
        { title: "Rivayath:Styling", thumb: "../../../works/archive/rivayath/thumb.jpg", link: "../../../works/archive/rivayath/project.html" },
        { title: "Agomoni", thumb: "../../../works/archive/agomoni/thumb.jpg", link: "../../../works/archive/agomoni/project.html" },
        { title: "Character Card", thumb: "../../../works/archive/character-card/thumb.jpg", link: "../../../works/archive/character-card/project.html" }
    ];

    const randomGrid = document.getElementById('random-projects-grid');
    
    if (randomGrid) {
        const currentProjectTitle = document.querySelector('.project-title').innerText;

        // Filter out the current project
        let availableProjects = projectDatabase.filter(p => p.title !== currentProjectTitle);

        // Shuffle the array
        for (let i = availableProjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableProjects[i], availableProjects[j]] = [availableProjects[j], availableProjects[i]];
        }

        // Pick top 3 for Desktop, top 2 for Mobile
        const numberOfProjects = window.innerWidth <= 900 ? 2 : 3;
        const selectedProjects = availableProjects.slice(0, numberOfProjects);

        // Build the HTML cards
        selectedProjects.forEach(project => {
            const cardHTML = `
                <a href="${project.link}" class="explore-card">
                    <div class="explore-thumb">
                        <img src="${project.thumb}" alt="${project.title}">
                    </div>
                    <p class="explore-name">${project.title}</p>
                </a>
            `;
            randomGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
});
