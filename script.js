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

    // Render category tree
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
                renderWebsites(currentCategoryTitle);
            });
            li.appendChild(a);

            if (category.sub_categories && category.sub_categories.length > 0) {
                const subUl = document.createElement('ul');
                category.sub_categories.forEach(subCategory => {
                    // Check if subCategory has its own sub_categories (nested)
                    // If it has a 'link' and 'description', it's a website/resource
                    // If it only has 'sub_categories', it's a further nested category
                    if (subCategory.link || (subCategory.sub_categories && subCategory.sub_categories.length > 0)) {
                        const subLi = document.createElement('li');
                        const subA = document.createElement('a');
                        subA.href = '#';
                        subA.textContent = subCategory.title;
                        subA.dataset.categoryTitle = subCategory.title; // Use title as identifier
                        subA.addEventListener('click', (e) => {
                            e.preventDefault();
                            setActiveCategory(subA);
                            currentCategoryTitle = subCategory.title;
                            renderWebsites(currentCategoryTitle);
                        });
                        subLi.appendChild(subA);
                        subUl.appendChild(subLi);
                    }
                });
                if (subUl.children.length > 0) { // Only append if there are actual sub-categories to display
                    li.appendChild(subUl);
                }
            }
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
        function findCategoryItems(data, targetTitle) {
            for (const item of data) {
                if (item.title === targetTitle) {
                    // This item itself is the category, return its sub_categories as websites
                    return item.sub_categories || [];
                }
                if (item.sub_categories && item.sub_categories.length > 0) {
                    const foundInNested = findCategoryItems(item.sub_categories, targetTitle);
                    if (foundInNested.length > 0 || foundInNested === null) { // null indicates it was found but has no sub-items
                        return foundInNested;
                    }
                }
            }
            return [];
        }
        
        // Find the actual list of items (websites/sub-categories) to display
        // If an item has a 'link', it's a website. If it has 'sub_categories', it's a nested category.
        const foundItems = findCategoryItems(awesomeContentData, categoryTitle);
        
        // Filter out items that are just categories with no direct link/description but have nested sub_categories
        // We want to display the direct children as "websites" here.
        websitesToDisplay = foundItems.filter(item => item.link || (item.sub_categories && item.sub_categories.length > 0));


        // Simulate network delay for fetching, then clear skeletons
        await new Promise(resolve => setTimeout(resolve, 500)); 
        websiteContainer.innerHTML = ''; // Clear skeletons

        if (websitesToDisplay.length === 0) {
            websiteContainer.innerHTML = '<p>该分类下暂无内容。</p>';
            return;
        }

        if (isGridView) {
            websiteContainer.classList.remove('timeline-view');
            websiteContainer.classList.add('grid-view');
            websitesToDisplay.forEach(website => {
                websiteContainer.appendChild(createGridCard(website));
            });
        } else {
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

    function createGridCard(item) {
        const card = document.createElement('a');
        card.href = item.link || '#'; // Use item.link as URL
        card.target = '_blank';
        card.className = 'website-card';
        // Use Google Favicon API for logo if link is available, otherwise a placeholder
        const logoSrc = item.link ? `https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L9.54 3.54A5 5 0 0 0 3.54 9.54l3 3a5 5 0 0 0 7.07 7.07L14.46 16.46"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.46-1.46A5 5 0 0 0 20.46 14.46l-3-3a5 5 0 0 0-7.07-7.07L9.54 7.54A5 5 0 0 0 3.54 13.54l3 3"></path></svg>';
        
        card.innerHTML = `
            <div class="website-card-header">
                <img data-src="${logoSrc}" alt="${item.title} Logo" class="logo lazyload">
                <h3>${item.title}</h3>
            </div>
            <div class="website-card-body">
                <p>${item.description || '暂无描述'}</p>
            </div>
            <div class="website-card-footer">
                <!-- releaseDate is not available in new data -->
                <!-- You can add other info here if needed -->
            </div>
        `;
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
            <a href="${item.link || '#'}" target="_blank" class="timeline-card">
                <img data-src="${logoSrc}" alt="${item.title} Logo" class="logo lazyload">
                <div class="timeline-card-content">
                    <h3>${item.title}</h3>
                    <span class="timeline-url">${item.link ? new URL(item.link).hostname : ''}</span>
                </div>
            </a>
        `;
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
