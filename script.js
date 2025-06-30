document.addEventListener('DOMContentLoaded', () => {
    const categoryTree = document.getElementById('category-tree');
    const websiteContainer = document.getElementById('website-container');
    const viewToggleButton = document.getElementById('view-toggle-button');
    let currentCategoryTitle = null; // Changed to title as ID
    let isGridView = true; // true for grid, false for timeline (now waterfall)
    let awesomeContentData = []; // To store the fetched awesome_contents.json

    // Function to fetch the awesome_contents.json
    async function fetchAwesomeContent() {
        if (awesomeContentData.length === 0) {
            console.log('Fetching awesome_contents.json...');
            try {
                const response = await fetch('/resources/awesome_contents.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                awesomeContentData = await response.json();
                console.log('Awesome content fetched:', awesomeContentData);
            } catch (error) {
                console.error('Error fetching awesome_contents.json:', error);
                // Fallback or error display
                websiteContainer.innerHTML = '<p>加载数据失败，请检查控制台输出。</p>';
            }
        }
        return awesomeContentData;
    }

    // Intersection Observer for lazy loading images
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazyload');
                observer.unobserve(img);
            }
        });
    });

    // Render category tree (only top-level categories)
    async function renderCategories() {
        await fetchAwesomeContent(); // Ensure data is fetched

        const ul = document.createElement('ul');
        awesomeContentData.forEach(category => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = category.title;
            a.dataset.categoryTitle = category.title; // Use title as identifier
            a.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveCategory(a);
                currentCategoryTitle = category.title;
                // When a top-level category is clicked, render its sub_categories
                renderWebsites(currentCategoryTitle);
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
        categoryTree.innerHTML = '';
        categoryTree.appendChild(ul);

        // Set initial active category and load websites
        const firstCategoryLink = categoryTree.querySelector('a[data-category-title]');
        if (firstCategoryLink) {
            setActiveCategory(firstCategoryLink);
            currentCategoryTitle = firstCategoryLink.dataset.categoryTitle;
            renderWebsites(currentCategoryTitle);
        }
    }

    function setActiveCategory(linkElement) {
        document.querySelectorAll('#category-tree a').forEach(link => {
            link.classList.remove('active');
        });
        linkElement.classList.add('active');
    }

    // Render website cards with skeleton loading and lazy loading
    async function renderWebsites(categoryTitle) {
        if (!categoryTitle) {
            websiteContainer.innerHTML = '<p>请选择一个分类来查看网站。</p>';
            return;
        }

        websiteContainer.innerHTML = ''; // Clear previous content

        // Add skeleton cards
        const numberOfSkeletons = isGridView ? 6 : 3; // More for grid, fewer for timeline
        for (let i = 0; i < numberOfSkeletons; i++) {
            websiteContainer.appendChild(createSkeletonCard(isGridView));
        }

        let websitesToDisplay = [];

        // Search for the selected category/sub-category in the loaded data
        // Modified to return the immediate sub_categories of the found category
        function findCategoryItems(data, targetTitle) {
            for (const item of data) {
                if (item.title === targetTitle) {
                    // This item itself is the category, return its sub_categories
                    return item.sub_categories || [];
                }
                // If not the target, check its sub_categories recursively
                if (item.sub_categories && item.sub_categories.length > 0) {
                    const foundInNested = findCategoryItems(item.sub_categories, targetTitle);
                    if (foundInNested.length > 0 || foundInNested === null) {
                        return foundInNested;
                    }
                }
            }
            return [];
        }
        
        // Find the actual list of items (websites/sub-categories) to display
        // When a top-level category is selected, its direct sub_categories are displayed.
        // These sub_categories can be either actual websites (with 'link') or
        // further nested categories (with 'sub_categories'). We want to display both.
        const foundItems = findCategoryItems(awesomeContentData, categoryTitle);
        
        // Display all found items, regardless if they have a 'link' or 'sub_categories',
        // as the user wants to see the second-level categories in a waterfall.
        websitesToDisplay = foundItems;

        // Simulate network delay for fetching, then clear skeletons
        await new Promise(resolve => setTimeout(resolve, 500)); 
        websiteContainer.innerHTML = ''; // Clear skeletons

        if (websitesToDisplay.length === 0) {
            websiteContainer.innerHTML = '<p>该分类下暂无内容。</p>';
            return;
        }

        if (isGridView) { // This will now act as the waterfall view
            websiteContainer.classList.remove('timeline-view');
            websiteContainer.classList.add('grid-view');
            websitesToDisplay.forEach(item => { // Changed from website to item
                // Check if the item has a 'link' property. If so, it's a website.
                // Otherwise, it's a nested category, which we still want to display as a clickable card.
                websiteContainer.appendChild(createGridCard(item));
            });
        } else {
            // The timeline view is not explicitly requested for waterfall,
            // but we'll keep it for now as an alternative view.
            websiteContainer.classList.remove('grid-view');
            websiteContainer.classList.add('timeline-view');
            // Sort by title for timeline view as releaseDate is not available
            const sortedWebsites = websitesToDisplay.sort((a, b) => a.title.localeCompare(b.title));
            sortedWebsites.forEach(website => {
                websiteContainer.appendChild(createTimelineItem(website));
            });
        }

        // Observe images for lazy loading after rendering
        document.querySelectorAll('img.lazyload').forEach(img => {
            lazyLoadObserver.observe(img);
        });
    }

    function createSkeletonCard(isGridView) {
        const card = document.createElement('div');
        card.className = `skeleton-card ${isGridView ? '' : 'timeline-skeleton'}`;
        card.innerHTML = `
            <div class="skeleton-card-header">
                <div class="skeleton-circle"></div>
                <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-line long"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-footer"></div>
        `;
        return card;
    }

    // Modified createGridCard to handle both websites and nested categories
    function createGridCard(item) {
        const card = document.createElement('a');
        card.href = item.link || '#'; // Use item.link as URL, if it's a website
        card.target = item.link ? '_blank' : '_self'; // Open in new tab if it's a link, otherwise self

        card.className = 'website-card';
        // Use Google Favicon API for logo if link is available, otherwise a placeholder for category
        const logoSrc = item.link ? `https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'; // Folder icon for categories
        
        card.innerHTML = `
            <div class="website-card-header">
                <img data-src="${logoSrc}" alt="${item.title} Logo" class="logo lazyload">
                <h3>${item.title}</h3>
            </div>
            <div class="website-card-body">
                <p>${item.description || (item.sub_categories ? `包含 ${item.sub_categories.length} 个子分类或项目` : '暂无描述')}</p>
            </div>
            <div class="website-card-footer">
                <!-- releaseDate is not available in new data -->
                <!-- You can add other info here if needed -->
            </div>
        `;

        // If it's a category (no link but has sub_categories), make it clickable to render its sub_categories
        if (!item.link && item.sub_categories && item.sub_categories.length > 0) {
            card.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior if it's a category
                currentCategoryTitle = item.title; // Set current category to this sub-category
                renderWebsites(currentCategoryTitle); // Render its sub-categories
            });
        }

        return card;
    }

    function createTimelineItem(item) {
        const timelineDate = item.releaseDate || 'N/A'; // Release date not available, fallback
        const logoSrc = item.link ? `https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L9.54 3.54A5 5 0 0 0 3.54 9.54l3 3a5 5 0 0 0 7.07 7.07L14.46 16.46"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.46-1.46A5 5 0 0 0 20.46 14.46l-3-3a5 5 0 0 0-7.07-7.07L9.54 7.54A5 5 0 0 0 3.54 13.54l3 3"></path></svg>';

        const itemElement = document.createElement('div');
        itemElement.className = 'timeline-item';
        itemElement.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-date">${timelineDate}</div>
            <a href="${item.link || '#'}" target="${item.link ? '_blank' : '_self'}" class="timeline-card">
                <img data-src="${logoSrc}" alt="${item.title} Logo" class="logo lazyload">
                <div class="timeline-card-content">
                    <h3>${item.title}</h3>
                    <span class="timeline-url">${item.link ? new URL(item.link).hostname : (item.sub_categories ? '子分类' : '')}</span>
                </div>
            </a>
        `;
        // If it's a category (no link but has sub_categories), make it clickable to render its sub_categories
        if (!item.link && item.sub_categories && item.sub_categories.length > 0) {
            itemElement.querySelector('.timeline-card').addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior if it's a category
                currentCategoryTitle = item.title; // Set current category to this sub-category
                renderWebsites(currentCategoryTitle); // Render its sub-categories
            });
        }
        return itemElement;
    }

    // Toggle view button logic
    viewToggleButton.addEventListener('click', () => {
        isGridView = !isGridView;
        if (isGridView) {
            viewToggleButton.innerHTML = '<span class="material-icons">grid_view</span><span class="button-text">切换为时间轴</span>';
        } else {
            viewToggleButton.innerHTML = '<span class="material-icons">date_range</span><span class="button-text">切换为栅格</span>';
        }
        renderWebsites(currentCategoryTitle);
    });

    // Initial load
    renderCategories();
});
