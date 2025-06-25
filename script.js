document.addEventListener('DOMContentLoaded', () => {
    const categoryTree = document.getElementById('category-tree');
    const websiteContainer = document.getElementById('website-container');
    const viewToggleButton = document.getElementById('view-toggle-button');
    let currentCategoryId = null;
    let isGridView = true; // true for grid, false for timeline (now waterfall)

    const API_BASE_URL = 'http://localhost:3000'; // Assuming a local server for demo

    // Helper to simulate API calls
    async function fetchData(url) {
        console.log(`Fetching data from: ${url}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
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
                "intro": "用于构建用户界面的 JavaScript 库。React 起源于 Facebook 的内部项目，因为该公司对市场上所有 JavaScript MVC 框架都不满意，就决定自己写一套，用来架设 Instagram 的网站。于 2013 年 5 月开源。",
                "releaseDate": "2013-05-29"
            },
            {
                "id": "nextjs",
                "logo": "https://assets.vercel.com/image/upload/v1672304997/front/nextjs/assets/handbook/logo-nextjs.png",
                "title": "Next.js",
                "url": "https://nextjs.org/",
                "intro": "基于 React 的全栈 Web 框架。它允许您通过服务器端渲染（SSR）和静态站点生成（SSG）来构建高性能的 React 应用程序，提供了更快的页面加载速度和更好的 SEO。",
                "releaseDate": "2016-10-25"
            },
            {
                "id": "create-react-app",
                "logo": "https://create-react-app.dev/img/logo.svg",
                "title": "Create React App",
                "url": "https://create-react-app.dev/",
                "intro": "通过单个命令行设置现代 Web 应用程序。这是一个由 Facebook 官方维护的工具链，旨在帮助开发者快速启动一个 React 项目，无需复杂的构建配置。",
                "releaseDate": "2016-07-22"
            },
            {
                "id": "storybook",
                "logo": "https://storybook.js.org/images/logos/logo-storybook.png",
                "title": "Storybook",
                "url": "https://storybook.js.org/",
                "intro": "构建和测试 UI 组件的工具。它允许您在隔离的环境中开发组件，从而提高组件的复用性、可测试性和开发效率。",
                "releaseDate": "2016-09-08"
            },
            {
                "id": "material-ui",
                "logo": "https://mui.com/static/icons/1.png",
                "title": "MUI (Material-UI)",
                "url": "https://mui.com/",
                "intro": "一个流行的 React UI 框架，实现了 Google 的 Material Design。它提供了大量预构建的、可定制的 UI 组件，帮助开发者快速构建美观的 React 应用程序。",
                "releaseDate": "2014-07-16"
            },
            {
                "id": "antd",
                "logo": "https://gw.alipayobjects.com/zos/rmsportal/KDpgUmfMtkdHwh3sRyzz.svg",
                "title": "Ant Design",
                "url": "https://ant.design/",
                "intro": "一套企业级 UI 设计语言和 React 实现。它由阿里巴巴开发，提供了丰富的组件和一套完整的设计体系，广泛应用于企业级中后台产品。",
                "releaseDate": "2015-08-01"
            },
            {
                "id": "react-router",
                "logo": "https://reactrouter.com/favicon.ico",
                "title": "React Router",
                "url": "https://reactrouter.com/",
                "intro": "React 的声明式路由库。它允许您在 React 应用程序中轻松管理导航和 URL 路由，提供了一套强大的 API 来构建单页应用（SPA）。",
                "releaseDate": "2014-04-12"
            }
        ],
        '/api/websites?categoryId=vue': [
            {
                "id": "vuejs",
                "logo": "https://vuejs.org/logo.svg",
                "title": "Vue.js 官方网站",
                "url": "https://vuejs.org/",
                "intro": "渐进式 JavaScript 框架。Vue.js 易于上手，也便于与其他库或现有项目整合。另一方面，它完全有能力驱动复杂的单页应用。",
                "releaseDate": "2014-02-01"
            },
            {
                "id": "nuxtjs",
                "logo": "https://nuxtjs.org/design-pro.png",
                "title": "Nuxt.js",
                "url": "https://nuxt.com/",
                "intro": "直观的 Vue 框架。Nuxt.js 构建在 Vue.js 基础上，提供了服务器端渲染（SSR）、静态站点生成（SSG）和路由等开箱即用的功能，极大地简化了 Vue 应用程序的开发。",
                "releaseDate": "2016-10-26"
            }
        ],
        '/api/websites?categoryId=angular': [
            {
                "id": "angular-dev",
                "logo": "https://angular.io/assets/images/logos/angular/angular.svg",
                "title": "Angular 官方网站",
                "url": "https://angular.io/",
                "intro": "一个应用设计框架与开发平台。Angular 是一个由 Google 开发的用于构建单页客户端应用的 TypeScript 框架。它提供了强大的工具和结构，适用于构建大型、复杂的企业级应用。",
                "releaseDate": "2016-09-14"
            }
        ],
        '/api/websites?categoryId=python': [
            {
                "id": "python-org",
                "logo": "https://www.python.org/static/favicon.ico",
                "title": "Python 官方网站",
                "url": "https://www.python.org/",
                "intro": "一门解释型、面向对象、动态数据类型的高级程序设计语言。Python 以其简洁明了的语法和丰富的库生态系统而闻名，广泛应用于 Web 开发、数据科学、人工智能等领域。",
                "releaseDate": "1991-02-20"
            }
        ],
        '/api/websites?categoryId=nodejs': [
            {
                "id": "nodejs-org",
                "logo": "https://nodejs.org/static/images/favicons/favicon.ico",
                "title": "Node.js 官方网站",
                "url": "https://nodejs.org/en/",
                "intro": "一个基于 Chrome V8 引擎的 JavaScript 运行环境。Node.js 使得 JavaScript 可以在服务器端运行，从而实现了前后端同构开发，提高了开发效率。",
                "releaseDate": "2009-05-27"
            }
        ],
        '/api/websites?categoryId=java': [
            {
                "id": "oracle-java",
                "logo": "https://www.oracle.com/favicon.ico",
                "title": "Oracle Java",
                "url": "https://www.oracle.com/java/",
                "intro": "全球领先的开发平台。Java 是一种广泛使用的计算机编程语言，拥有跨平台、面向对象、健壮性等特点，在企业级应用开发领域占据主导地位。",
                "releaseDate": "1995-05-23"
            }
        ],
        '/api/websites?categoryId=sql': [
            {
                "id": "mysql-dev",
                "logo": "https://www.mysql.com/favicon.ico",
                "title": "MySQL",
                "url": "https://www.mysql.com/",
                "intro": "流行的开源关系型数据库。MySQL 是最受欢迎的关系型数据库管理系统之一，广泛应用于各种 Web 应用程序。",
                "releaseDate": "1995-05-23"
            }
        ],
        '/api/websites?categoryId=nosql': [
            {
                "id": "mongodb",
                "logo": "https://www.mongodb.com/assets/images/global/favicon.ico",
                "title": "MongoDB",
                "url": "https://www.mongodb.com/",
                "intro": "领先的非关系型数据库。MongoDB 是一个面向文档的 NoSQL 数据库，以其高可扩展性、高性能和灵活性而闻名。",
                "releaseDate": "2009-02-11"
            }
        ],
        '/api/websites?categoryId=design-tools': [
            {
                "id": "figma",
                "logo": "https://www.figma.com/favicon.ico",
                "title": "Figma",
                "url": "https://www.figma.com/",
                "intro": "在线协作式 UI/UX 设计工具。Figma 允许设计师在浏览器中进行实时协作，极大地提高了设计团队的工作效率。",
                "releaseDate": "2016-09-27"
            },
            {
                "id": "sketch",
                "logo": "https://www.sketch.com/images/favicon/apple-touch-icon.png",
                "title": "Sketch",
                "url": "https://www.sketch.com/",
                "intro": "macOS 平台上的矢量绘图软件。Sketch 是一款专为 UI/UX 设计师打造的专业工具，拥有强大的矢量编辑功能和丰富的插件生态。",
                "releaseDate": "2010-09-07"
            }
        ]
    };

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

    // Render website cards with skeleton loading and lazy loading
    async function renderWebsites(categoryId) {
        if (!categoryId) {
            websiteContainer.innerHTML = '<p>请选择一个分类来查看网站。</p>';
            return;
        }

        websiteContainer.innerHTML = ''; // Clear previous content

        // Add skeleton cards
        const numberOfSkeletons = isGridView ? 6 : 3; // More for grid, fewer for timeline
        for (let i = 0; i < numberOfSkeletons; i++) {
            websiteContainer.appendChild(createSkeletonCard(isGridView));
        }

        const websites = await fetchData(API_BASE_URL + `/api/websites?categoryId=${categoryId}`);

        websiteContainer.innerHTML = ''; // Clear skeletons

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

    function createGridCard(website) {
        const card = document.createElement('a');
        card.href = website.url;
        card.target = '_blank';
        card.className = 'website-card';
        card.innerHTML = `
            <div class="website-card-header">
                <img data-src="${website.logo}" alt="${website.title} Logo" class="logo lazyload">
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
                <img data-src="${website.logo}" alt="${website.title} Logo" class="logo lazyload">
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
