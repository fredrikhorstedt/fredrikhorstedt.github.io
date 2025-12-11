(() => {
    const dataUrl = 'resources/data/china-timeline.json';
    let categories = {};
    let timelineData = [];
    let activeCategories = new Set();
    let searchInput;
    let legendContainer;
    let timelineContainer;

    document.addEventListener('DOMContentLoaded', () => {
        searchInput = document.getElementById('searchInput');
        legendContainer = document.getElementById('legend');
        timelineContainer = document.getElementById('timeline');

        if (!searchInput || !legendContainer || !timelineContainer) {
            console.error('Timeline mount points are missing.');
            return;
        }

        fetch(dataUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then((payload) => {
                categories = payload.categories || {};
                timelineData = payload.timelineData || [];
                activeCategories = new Set(Object.keys(categories));

                attachSearchListener();
                renderLegend();
                renderTimeline();
                layoutTimeline();

                window.addEventListener('resize', layoutTimeline);
                window.addEventListener('load', layoutTimeline);
                setTimeout(layoutTimeline, 100);
                setTimeout(layoutTimeline, 500);
            })
            .catch((error) => {
                console.error('Failed to bootstrap timeline', error);
                if (timelineContainer) {
                    timelineContainer.innerHTML = '<p>Unable to load timeline data.</p>';
                }
            });
    });

    function attachSearchListener() {
        searchInput.addEventListener('input', filterTimeline);
    }

    function renderLegend() {
        legendContainer.querySelectorAll('.legend-item').forEach((node) => node.remove());

        Object.entries(categories).forEach(([key, value]) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.dataset.category = key;
            item.title = 'Click to toggle, Double-click to show only this';
            item.innerHTML = `
                <div class="legend-dot" style="background-color: ${value.color}"></div>
                <span>${value.label}</span>
            `;

            item.addEventListener('click', () => {
                if (activeCategories.has(key)) {
                    activeCategories.delete(key);
                    item.classList.add('inactive');
                } else {
                    activeCategories.add(key);
                    item.classList.remove('inactive');
                }
                filterTimeline();
            });

            item.addEventListener('dblclick', (event) => {
                event.stopPropagation();
                const isOnlyActive = activeCategories.size === 1 && activeCategories.has(key);

                if (isOnlyActive) {
                    Object.keys(categories).forEach((category) => activeCategories.add(category));
                } else {
                    activeCategories.clear();
                    activeCategories.add(key);
                }

                document.querySelectorAll('.legend-item').forEach((el) => {
                    if (activeCategories.has(el.dataset.category)) {
                        el.classList.remove('inactive');
                    } else {
                        el.classList.add('inactive');
                    }
                });

                filterTimeline();
            });

            legendContainer.appendChild(item);
        });
    }

    function renderTimeline() {
        timelineContainer.innerHTML = '';

        timelineData.forEach((era) => {
            const eraTitle = document.createElement('div');
            eraTitle.className = 'era-title';
            eraTitle.innerHTML = `<span>${era.era}</span>`;

            const eraSection = document.createElement('div');
            eraSection.className = 'era-section';
            eraSection.appendChild(eraTitle);

            era.events.forEach((event) => {
                const catConfig = categories[event.category];
                if (!catConfig) {
                    return;
                }

                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.dataset.category = event.category;
                item.innerHTML = `
                    <div class="timeline-content" style="--cat-color: ${catConfig.color}; border-top-color: ${catConfig.color}">
                        <div class="year">${event.year}</div>
                        <div class="category-label" style="background-color: ${catConfig.color}">${event.category}</div>
                        <div class="event-title">${event.title}</div>
                        <div class="description">${event.desc}</div>
                        <div class="more-info">${event.moreInfo || ''}</div>
                    </div>
                `;

                eraSection.appendChild(item);
            });

            timelineContainer.appendChild(eraSection);
        });
    }

    function filterTimeline() {
        const query = searchInput.value.trim().toLowerCase();
        const items = document.querySelectorAll('.timeline-item');

        items.forEach((item) => {
            const category = item.dataset.category;
            const title = item.querySelector('.event-title').innerText.toLowerCase();
            const desc = item.querySelector('.description').innerText.toLowerCase();
            const year = item.querySelector('.year').innerText;

            const matchesCategory = activeCategories.has(category);
            const matchesSearch = !query || title.includes(query) || desc.includes(query) || year.includes(query);

            if (matchesCategory && matchesSearch) {
                item.classList.remove('hidden');
                item.style.display = 'block';
            } else {
                item.classList.add('hidden');
            }
        });

        layoutTimeline();
    }

    function layoutTimeline() {
        if (!timelineContainer) {
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const eraSections = timelineContainer.querySelectorAll('.era-section');

        eraSections.forEach((section) => {
            if (isMobile) {
                section.style.height = 'auto';
                section.querySelectorAll('.timeline-item').forEach((item) => {
                    item.style.top = '';
                    item.style.left = '';
                    item.style.position = '';
                    item.style.width = '';
                    item.style.display = item.classList.contains('hidden') ? 'none' : 'block';
                });
                return;
            }

            const visibleItems = Array.from(section.querySelectorAll('.timeline-item')).filter((item) => !item.classList.contains('hidden'));
            const title = section.querySelector('.era-title');
            const titleHeight = (title ? title.offsetHeight : 0) + 20;
            const colHeights = [titleHeight, titleHeight, titleHeight, titleHeight];
            const colWidthPercent = 25;

            visibleItems.forEach((item) => {
                item.style.position = 'absolute';
                item.style.width = '25%';
                item.style.display = 'block';

                const minHeight = Math.min(...colHeights);
                const colIndex = colHeights.indexOf(minHeight);

                item.style.top = `${minHeight}px`;
                item.style.left = `${colIndex * colWidthPercent}%`;

                colHeights[colIndex] += item.offsetHeight;
            });

            const maxHeight = Math.max(...colHeights);
            section.style.height = `${maxHeight + 40}px`;
        });
    }
})();
