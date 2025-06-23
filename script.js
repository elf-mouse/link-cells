document.addEventListener('DOMContentLoaded', () => {
    const categoryTree = document.getElementById('category-tree');
    const websiteContainer = document.getElementById('website-container');
    const viewToggleButton = document.getElementById('view-toggle-button');
    let currentCategoryId = null;
    let isGridView = true; // true for grid, false for timeline

    const API_BASE_URL = 'http://localhost:3000'; // Assuming a local server for demo

    // Helper to simulate API calls
    async function fetchData(url) {
        // In a real application, you would use fetch(url)
        // For this demo, we'll use a simple mock data structure
        console.log(`Fetching data from: ${url}`);
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        return mockApiResponses[url] || [];
    }

    const mockApiResponses = {
        '/api/categories': [
            {
                "id": "frontend-frameworks",
                "name": "前端框架",
                "subCategories": [
                    {
                        "id": "react",
                        "name": "React"
                    },
                    {
                        "id": "vue",
                        "name": "Vue.js"
                    },
                    {
                        "id": "angular",
                        "name": "Angular"
                    }
                ]
            },
            {
                "id": "backend-languages",
                "name": "后端语言",
                "subCategories": [
                    {
                        "id": "python",
                        "name": "Python"
                    },
                    {
                        "id": "nodejs",
                        "name": "Node.js"
                    },
                    {
                        "id": "java",
                        "name": "Java"
                    }
                ]
            },
            {
                "id": "databases",
                "name": "数据库",
                "subCategories": [
                    {
                        "id": "sql",
                        "name": "SQL"
                    },
                    {
                        "id": "nosql",
                        "name": "NoSQL"
                    }
                ]
            },
            {
                "id": "design-tools",
                "name": "设计工具",
                "subCategories": []
            }
        ],
        '/api/websites?categoryId=react': [
            {
                "id": "react-dev",
                "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
                "title": "React 官方网站",
                "url": "https://react.dev/",
                "intro": "用于构建用户界面的 JavaScript 库。",
                "releaseDate": "2013-05-29"
            },
            {
                "id": "nextjs",
                "logo": "https://assets.vercel.com/image/upload/v1672304997/front/nextjs/assets/handbook/logo-nextjs.png",
                "title": "Next.js",
                "url": "https://nextjs.org/",
                "intro": "基于 React 的全栈 Web 框架。",
                "releaseDate": "2016-10-25"
            },
            {
                "id": "create-react-app",
                "logo": "https://create-react-app.dev/img/logo.svg",
                "title": "Create React App",
                "url": "https://create-react-app.dev/",
                "intro": "通过单个命令行设置现代 Web 应用程序。",
                "releaseDate": "2016-07-22"
            },
            {
                "id": "storybook",
                "logo": "https://storybook.js.org/images/logos/logo-storybook.png",
                "title": "Storybook",
                "url": "https://storybook.js.org/",
                "intro": "构建和测试 UI 组件的工具。",
                "releaseDate": "2016-09-08"
            }
        ],
        '/api/websites?categoryId=vue': [
            {
                "id": "vuejs",
                "logo": "https://vuejs.org/logo.svg",
                "title": "Vue.js 官方网站",
                "url": "https://vuejs.org/",
                "intro": "渐进式 JavaScript 框架。",
                "releaseDate": "2014-02-01"
            },
            {
                "id": "nuxtjs",
                "logo": "https://nuxtjs.org/design-pro.png",
                "title": "Nuxt.js",
                "url": "https://nuxt.com/",
                "intro": "直观的 Vue 框架。",
                "releaseDate": "2016-10-26"
            }
        ],
        '/api/websites?categoryId=angular': [
            {
                "id": "angular-dev",
                "logo": "https://angular.io/assets/images/logos/angular/angular.svg",
                "title": "Angular 官方网站",
                "url": "https://angular.io/",
                "intro": "一个应用设计框架与开发平台。",
                "releaseDate": "2016-09-14"
            }
        ],
        '/api/websites?categoryId=python': [
            {
                "id": "python-org",
                "logo": "https://www.python.org/static/favicon.ico",
                "title": "Python 官方网站",
                "url": "https://www.python.org/",
                "intro": "一门解释型、面向对象、动态数据类型的高级程序设计语言。",
                "releaseDate": "1991-02-20"
            }
        ],
        '/api/websites?categoryId=nodejs': [
            {
                "id": "nodejs-org",
                "logo": "https://nodejs.org/static/images/favicons/favicon.ico",
                "title": "Node.js 官方网站",
                "url": "https://nodejs.org/en/",
                "intro": "一个基于 Chrome V8 引擎的 JavaScript 运行环境。",
                "releaseDate": "2009-05-27"
            }
        ],
        '/api/websites?categoryId=java': [
            {
                "id": "oracle-java",
                "logo": "https://www.oracle.com/favicon.ico",
                "title": "Oracle Java",
                "url": "https://www.oracle.com/java/",
                "intro": "全球领先的开发平台。",
                "releaseDate": "1995-05-23"
            }
        ],
        '/api/websites?categoryId=sql': [
            {
                "id": "mysql-dev",
                "logo": "https://www.mysql.com/favicon.ico",
                "title": "MySQL",
                "url": "https://www.mysql.com/",
                "intro": "流行的开源关系型数据库。",
                "releaseDate": "1995-05-23"
            }
        ],
        '/api/websites?categoryId=nosql': [
            {
                "id": "mongodb",
                "logo": "https://www.mongodb.com/assets/images/global/favicon.ico",
                "title": "MongoDB",
                "url": "https://www.mongodb.com/",
                "intro": "领先的非关系型数据库。",
                "releaseDate": "2009-02-11"
            }
        ],
        '/api/websites?categoryId=design-tools': [
            {
                "id": "figma",
                "logo": "https://www.figma.com/favicon.ico",
                "title": "Figma",
                "url": "https://www.figma.com/",
                "intro": "在线协作式 UI/UX 设计工具。",
                "releaseDate": "2016-09-27"
            },
            {
                "id": "sketch",
                "logo": "https://www.sketch.com/images/favicon/apple-touch-icon.png",
                "title": "Sketch",
                "url": "https://www.sketch.com/",
                "intro": "macOS 平台上的矢量绘图软件。",
                "releaseDate": "2010-09-07"
            }
        ]
    };


    // Render category tree
    async function renderCategories() {
        const categories = await fetchData(API_BASE_URL + '/api/categories');
        const ul = document.createElement('ul');
        categories.forEach(category => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = category.name;
            a.dataset.categoryId = category.id;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveCategory(a);
                currentCategoryId = category.id;
                renderWebsites(currentCategoryId);
            });
            li.appendChild(a);

            if (category.subCategories && category.subCategories.length > 0) {
                const subUl = document.createElement('ul');
                category.subCategories.forEach(subCategory => {
                    const subLi = document.createElement('li');
                    const subA = document.createElement('a');
                    subA.href = '#';
                    subA.textContent = subCategory.name;
                    subA.dataset.categoryId = subCategory.id;
                    subA.addEventListener('click', (e) => {
                        e.preventDefault();
                        setActiveCategory(subA);
                        currentCategoryId = subCategory.id;
                        renderWebsites(currentCategoryId);
                    });
                    subLi.appendChild(subA);
                    subUl.appendChild(subLi);
                });
                li.appendChild(subUl);
            }
            ul.appendChild(li);
        });
        categoryTree.innerHTML = '';
        categoryTree.appendChild(ul);

        // Set initial active category and load websites
        const firstCategoryLink = categoryTree.querySelector('a[data-category-id]');
        if (firstCategoryLink) {
            setActiveCategory(firstCategoryLink);
            currentCategoryId = firstCategoryLink.dataset.categoryId;
            renderWebsites(currentCategoryId);
        }
    }

    function setActiveCategory(linkElement) {
        document.querySelectorAll('#category-tree a').forEach(link => {
            link.classList.remove('active');
        });
        linkElement.classList.add('active');
    }

    // Render website cards
    async function renderWebsites(categoryId) {
        if (!categoryId) {
            websiteContainer.innerHTML = '<p>请选择一个分类来查看网站。</p>';
            return;
        }

        const websites = await fetchData(API_BASE_URL + `/api/websites?categoryId=${categoryId}`);
        websiteContainer.innerHTML = ''; // Clear previous content

        if (isGridView) {
            websiteContainer.classList.remove('timeline-view');
            websiteContainer.classList.add('grid-view');
            websites.forEach(website => {
                websiteContainer.appendChild(createGridCard(website));
            });
        } else {
            websiteContainer.classList.remove('grid-view');
            websiteContainer.classList.add('timeline-view');
            // Sort by releaseDate for timeline view
            const sortedWebsites = websites.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
            sortedWebsites.forEach(website => {
                websiteContainer.appendChild(createTimelineItem(website));
            });
        }
    }

    function createGridCard(website) {
        const card = document.createElement('a');
        card.href = website.url;
        card.target = '_blank';
        card.className = 'website-card';
        card.innerHTML = `
            <div class="website-card-header">
                <img src="${website.logo}" alt="${website.title} Logo" class="logo">
                <h3>${website.title}</h3>
            </div>
            <div class="website-card-body">
                <p>${website.intro}</p>
            </div>
            <div class="website-card-footer">
                发布日期: ${website.releaseDate}
            </div>
        `;
        return card;
    }

    function createTimelineItem(website) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-date">${website.releaseDate}</div>
            <a href="${website.url}" target="_blank" class="timeline-card">
                <img src="${website.logo}" alt="${website.title} Logo" class="logo">
                <div class="timeline-card-content">
                    <h3>${website.title}</h3>
                    <span class="timeline-url">${new URL(website.url).hostname}</span>
                </div>
            </a>
        `;
        return item;
    }

    // Toggle view button logic
    viewToggleButton.addEventListener('click', () => {
        isGridView = !isGridView;
        if (isGridView) {
            viewToggleButton.innerHTML = '<span class="material-icons">grid_view</span><span class="button-text">切换为时间轴</span>';
        } else {
            viewToggleButton.innerHTML = '<span class="material-icons">date_range</span><span class="button-text">切换为栅格</span>';
        }
        renderWebsites(currentCategoryId);
    });

    // Initial load
    renderCategories();
});
