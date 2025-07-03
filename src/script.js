document.addEventListener("DOMContentLoaded", () => {
  const categoryTree = document.getElementById("category-tree");
  const websiteContainer = document.getElementById("website-container");
  const menuButton = document.getElementById("menu-button");
  const sidebar = document.getElementById("sidebar");
  const scrimOverlay = document.getElementById("scrim-overlay");
  const searchInput = document.getElementById("search-input"); // Get search input element
  let currentCategoryName = null;
  let awesomeContentData = [];

  // Define Material 3 color palettes for rainbow colors
  const colorPalettes = [
    // Red
    {
      "--md-sys-color-primary": "#BA1A1A", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#FFDAD6", "--md-sys-color-on-primary-container": "#410002",
      "--md-sys-color-secondary": "#775653", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#FFDAD6", "--md-sys-color-on-secondary-container": "#2C1513",
      "--md-sys-color-tertiary": "#705C2E", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#FCDFA6", "--md-sys-color-on-tertiary-container": "#261A00",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FFFBFF", "--md-sys-color-on-background": "#201A19",
      "--md-sys-color-surface": "#FFFBFF", "--md-sys-color-on-surface": "#201A19",
      "--md-sys-color-surface-variant": "#F5DDDA", "--md-sys-color-on-surface-variant": "#534341",
      "--md-sys-color-outline": "#857370", "--md-sys-color-outline-variant": "#D8C2BE",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#352F2E", "--md-sys-color-inverse-on-surface": "#F8EEEC",
      "--md-sys-color-inverse-primary": "#FFB4AB",
    },
    // Orange
    {
      "--md-sys-color-primary": "#9C4100", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#FFDBCA", "--md-sys-color-on-primary-container": "#331200",
      "--md-sys-color-secondary": "#775749", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#FFDBCA", "--md-sys-color-on-secondary-container": "#2C160B",
      "--md-sys-color-tertiary": "#646032", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#EBE5AC", "--md-sys-color-on-tertiary-container": "#1F1D00",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FFFBFF", "--md-sys-color-on-background": "#201A17",
      "--md-sys-color-surface": "#FFFBFF", "--md-sys-color-on-surface": "#201A17",
      "--md-sys-color-surface-variant": "#F5DDD4", "--md-sys-color-on-surface-variant": "#53433E",
      "--md-sys-color-outline": "#85736B", "--md-sys-color-outline-variant": "#D8C2BA",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#352F2B", "--md-sys-color-inverse-on-surface": "#F8EFEA",
      "--md-sys-color-inverse-primary": "#FFB68F",
    },
    // Yellow
    {
      "--md-sys-color-primary": "#6B5F00", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#F8E46F", "--md-sys-color-on-primary-container": "#201C00",
      "--md-sys-color-secondary": "#625F42", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#E9E4BF", "--md-sys-color-on-secondary-container": "#1E1C06",
      "--md-sys-color-tertiary": "#406650", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#C2ECCA", "--md-sys-color-on-tertiary-container": "#002111",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FFFBFF", "--md-sys-color-on-background": "#1D1C16",
      "--md-sys-color-surface": "#FFFBFF", "--md-sys-color-on-surface": "#1D1C16",
      "--md-sys-color-surface-variant": "#E7E3D0", "--md-sys-color-on-surface-variant": "#48473A",
      "--md-sys-color-outline": "#7A7768", "--md-sys-color-outline-variant": "#CBC7B5",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#32312A", "--md-sys-color-inverse-on-surface": "#F5F2E7",
      "--md-sys-color-inverse-primary": "#DBCA56",
    },
    // Green
    {
      "--md-sys-color-primary": "#006E20", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#98F991", "--md-sys-color-on-primary-container": "#002204",
      "--md-sys-color-secondary": "#53634F", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#D6E8CF", "--md-sys-color-on-secondary-container": "#111F10",
      "--md-sys-color-tertiary": "#386569", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#BCEAF0", "--md-sys-color-on-tertiary-container": "#002023",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FCFCF6", "--md-sys-color-on-background": "#1A1C19",
      "--md-sys-color-surface": "#FCFCF6", "--md-sys-color-on-surface": "#1A1C19",
      "--md-sys-color-surface-variant": "#DEE5D9", "--md-sys-color-on-surface-variant": "#424940",
      "--md-sys-color-outline": "#727970", "--md-sys-color-outline-variant": "#C2C9BE",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#2F312D", "--md-sys-color-inverse-on-surface": "#F1F1EB",
      "--md-sys-color-inverse-primary": "#7DDC78",
    },
    // Cyan (青)
    {
      "--md-sys-color-primary": "#006874", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#9EEFFB", "--md-sys-color-on-primary-container": "#001F24",
      "--md-sys-color-secondary": "#4A6267", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#CDE7ED", "--md-sys-color-on-secondary-container": "#051F23",
      "--md-sys-color-tertiary": "#525E7D", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#DAE2FF", "--md-sys-color-on-tertiary-container": "#0E1A37",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FBFCFD", "--md-sys-color-on-background": "#191C1D",
      "--md-sys-color-surface": "#FBFCFD", "--md-sys-color-on-surface": "#191C1D",
      "--md-sys-color-surface-variant": "#DBE4E6", "--md-sys-color-on-surface-variant": "#3F484A",
      "--md-sys-color-outline": "#6F797B", "--md-sys-color-outline-variant": "#BFC8CA",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#2E3132", "--md-sys-color-inverse-on-surface": "#EFF1F2",
      "--md-sys-color-inverse-primary": "#82D3E3",
    },
    // Blue
    {
      "--md-sys-color-primary": "#0061A4", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#D4E3FF", "--md-sys-color-on-primary-container": "#001D35",
      "--md-sys-color-secondary": "#535F70", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#D7E3F7", "--md-sys-color-on-secondary-container": "#101C2B",
      "--md-sys-color-tertiary": "#6B5778", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#F3DBFF", "--md-sys-color-on-tertiary-container": "#251431",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FBFCFF", "--md-sys-color-on-background": "#1A1C1E",
      "--md-sys-color-surface": "#FBFCFF", "--md-sys-color-on-surface": "#1A1C1E",
      "--md-sys-color-surface-variant": "#DFE2EB", "--md-sys-color-on-surface-variant": "#43474E",
      "--md-sys-color-outline": "#73777F", "--md-sys-color-outline-variant": "#C3C6CF",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#2F3033", "--md-sys-color-inverse-on-surface": "#F1F0F4",
      "--md-sys-color-inverse-primary": "#A5C8FF",
    },
    // Purple (紫)
    {
      "--md-sys-color-primary": "#6750A4", "--md-sys-color-on-primary": "#FFFFFF",
      "--md-sys-color-primary-container": "#EADDFF", "--md-sys-color-on-primary-container": "#21005D",
      "--md-sys-color-secondary": "#625B71", "--md-sys-color-on-secondary": "#FFFFFF",
      "--md-sys-color-secondary-container": "#E8DEF8", "--md-sys-color-on-secondary-container": "#1D192B",
      "--md-sys-color-tertiary": "#7D5260", "--md-sys-color-on-tertiary": "#FFFFFF",
      "--md-sys-color-tertiary-container": "#FFD8E4", "--md-sys-color-on-tertiary-container": "#31111D",
      "--md-sys-color-error": "#BA1A1A", "--md-sys-color-on-error": "#FFFFFF",
      "--md-sys-color-error-container": "#FFDAD6", "--md-sys-color-on-error-container": "#410002",
      "--md-sys-color-background": "#FFFBFE", "--md-sys-color-on-background": "#1C1B1F",
      "--md-sys-color-surface": "#FFFBFE", "--md-sys-color-on-surface": "#1C1B1F",
      "--md-sys-color-surface-variant": "#E7E0EC", "--md-sys-color-on-surface-variant": "#49454F",
      "--md-sys-color-outline": "#79747E", "--md-sys-color-outline-variant": "#CAC4D0",
      "--md-sys-color-shadow": "#000000", "--md-sys-color-scrim": "#000000",
      "--md-sys-color-inverse-surface": "#313033", "--md-sys-color-inverse-on-surface": "#F4EFF4",
      "--md-sys-color-inverse-primary": "#D0BCFF",
    },
  ];

  // Function to apply a color palette to CSS variables
  function applyColorPalette(palette) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(palette)) {
      root.style.setProperty(key, value);
    }
  }

  // Function to set a daily random color
  function setDailyRandomColor() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const selectedIndex = dayOfYear % colorPalettes.length;
    applyColorPalette(colorPalettes[selectedIndex]);
  }

  // Call this function at the start to set the daily theme
  setDailyRandomColor();

  // --- Rest of your existing script.js code ---
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
        searchInput.value = ''; // Clear search input on category change
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
      searchInput.value = ''; // Clear search input on initial category load
      renderWebsites(currentCategoryName);
    }
  }

  function setActiveCategory(linkElement) {
    document.querySelectorAll("#category-tree a").forEach(link => link.classList.remove("active"));
    linkElement.classList.add("active");
  }

  async function renderWebsites(categoryName, searchTerm = '') {
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

    let itemsToDisplay = findItemsRecursively(awesomeContentData, categoryName);

    // Filter items based on search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      itemsToDisplay = itemsToDisplay.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    websiteContainer.innerHTML = "";

    if (itemsToDisplay === null || itemsToDisplay.length === 0) {
      websiteContainer.innerHTML = "<p>No content available for this category.</p>";
      websiteContainer.classList.remove("grid-view"); // Remove grid-view if no items
      return;
    }

    websiteContainer.classList.add("grid-view"); // Add grid-view if there are items

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

    const logoSrc = item.logo
      ? item.logo
      : item.repo
      ? `https://www.google.com/s2/favicons?domain=${new URL(item.repo).hostname}`
      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';

    // Conditionally build the card body
    let cardBodyHTML = '';
    const description = item.brief || (item.sub_categories ? `Contains ${item.sub_categories.length} items` : null);
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
        ${item.url ? `<a href="${item.url}" target="_blank" class="card-button secondary">
          <span class="material-icons">link</span> Visit
        </a>` : ''}
      </div>
    `;

    card.innerHTML = cardContent + buttonGroup;

    if (!item.repo && item.sub_categories) {
      card.querySelector('.website-card-content').addEventListener("click", (e) => {
        e.preventDefault();
        currentCategoryName = item.name;
        searchInput.value = ''; // Clear search input when navigating into a sub-category
        renderWebsites(currentCategoryName);
      });
    }

    return card;
  }

  // Add event listener for search input
  searchInput.addEventListener("input", () => {
    renderWebsites(currentCategoryName, searchInput.value);
  });

  renderCategories();
});
