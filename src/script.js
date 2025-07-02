document.addEventListener("DOMContentLoaded", () => {
  const categoryTree = document.getElementById("category-tree");
  const websiteContainer = document.getElementById("website-container");
  const menuButton = document.getElementById("menu-button");
  const sidebar = document.getElementById("sidebar");
  const scrimOverlay = document.getElementById("scrim-overlay");
  let currentCategoryName = null;
  let awesomeContentData = [];

  // --- Navigation Logic ---
  const toggleSidebar = () => {
    sidebar.classList.toggle("is-visible");
    scrimOverlay.classList.toggle("is-visible");
    document.body.classList.toggle("no-scroll");
  };

  menuButton.addEventListener("click", toggleSidebar);
  scrimOverlay.addEventListener("click", toggleSidebar);

  async function fetchAwesomeContent() {
    if (awesomeContentData.length === 0) {
      try {
        const response = await fetch("https://awesome-data.hub.so.kg/awesome.json");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        awesomeContentData = await response.json();
      } catch (error) {
        console.error("Error fetching awesome_contents.json:", error);
        websiteContainer.innerHTML = "<p>加载数据失败，请检查网络连接或稍后再试。</p>";
      }
    }
    return awesomeContentData;
  }

  const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazyload");
        observer.unobserve(img);
      }
    });
  });

  async function renderCategories() {
    await fetchAwesomeContent();
    const ul = document.createElement("ul");
    awesomeContentData.forEach((category) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = category.name;
      a.dataset.categoryName = category.name;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveCategory(a);
        currentCategoryName = category.name;
        renderWebsites(currentCategoryName);
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 1023) {
          toggleSidebar();
        }
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    categoryTree.innerHTML = "";
    categoryTree.appendChild(ul);

    const firstCategoryLink = categoryTree.querySelector("a[data-category-name]");
    if (firstCategoryLink) {
      setActiveCategory(firstCategoryLink);
      currentCategoryName = firstCategoryLink.dataset.categoryName;
      renderWebsites(currentCategoryName);
    }
  }

  function setActiveCategory(linkElement) {
    document.querySelectorAll("#category-tree a").forEach(link => link.classList.remove("active"));
    linkElement.classList.add("active");
  }

  async function renderWebsites(categoryName) {
    if (!categoryName) {
      websiteContainer.innerHTML = "<p>请选择一个分类。</p>";
      return;
    }

    websiteContainer.innerHTML = "";
    const numberOfSkeletons = 9;
    for (let i = 0; i < numberOfSkeletons; i++) {
      websiteContainer.appendChild(createSkeletonCard());
    }

    function findItemsRecursively(items, name) {
        for (const item of items) {
            if (item.name === name) {
                return item.sub_categories || [];
            }
            if (item.sub_categories) {
                const result = findItemsRecursively(item.sub_categories, name);
                if (result !== null) {
                    return result;
                }
            }
        }
        return null;
    }

    const itemsToDisplay = findItemsRecursively(awesomeContentData, categoryName);

    await new Promise(resolve => setTimeout(resolve, 300));
    websiteContainer.innerHTML = "";

    if (itemsToDisplay === null || itemsToDisplay.length === 0) {
      websiteContainer.innerHTML = "<p>该分类下暂无内容。</p>";
      return;
    }

    websiteContainer.className = "grid-view";

    itemsToDisplay.forEach(item => {
      websiteContainer.appendChild(createGridCard(item));
    });

    document.querySelectorAll("img.lazyload").forEach(img => lazyLoadObserver.observe(img));
  }

  function createSkeletonCard() {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-card-header">
        <div class="skeleton-circle"></div>
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line medium"></div>
    `;
    return card;
  }

  function createGridCard(item) {
    const card = document.createElement("div");
    card.className = "website-card";

    const logoSrc = item.repo
      ? `https://www.google.com/s2/favicons?domain=${new URL(item.repo).hostname}`
      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';

    // Conditionally build the card body
    let cardBodyHTML = '';
    const description = item.brief || (item.sub_categories ? `包含 ${item.sub_categories.length} 个项目` : null);
    if (description) {
        cardBodyHTML = `
        <div class="website-card-body">
          <p>${description}</p>
        </div>`;
    }

    // Card content remains clickable for navigation if it's a sub-category
    const cardContent = `
      <div class="website-card-content">
        <div class="website-card-header">
          <img data-src="${logoSrc}" alt="${item.name} Logo" class="logo lazyload">
          <h3>${item.name}</h3>
        </div>
        ${cardBodyHTML}
      </div>
    `;

    const buttonGroup = `
      <div class="card-button-group">
        <a href="${item.repo || '#'}" target="_blank" class="card-button primary">
          <span class="material-icons">code</span> GitHub
        </a>
        <a href="${item.url || '#'}" target="_blank" class="card-button secondary">
          <span class="material-icons">link</span> Visit
        </a>
      </div>
    `;

    card.innerHTML = cardContent + buttonGroup;

    if (!item.repo && item.sub_categories) {
      card.querySelector('.website-card-content').addEventListener("click", (e) => {
        e.preventDefault();
        currentCategoryName = item.name;
        renderWebsites(currentCategoryName);
      });
    }

    return card;
  }

  renderCategories();
});
