document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("category-tree"),t=document.getElementById("website-container"),n=document.getElementById("menu-button"),a=document.getElementById("sidebar"),s=document.getElementById("scrim-overlay"),r=[],i=()=>{a.classList.toggle("is-visible"),s.classList.toggle("is-visible"),document.body.classList.toggle("no-scroll")};async function o(){if(0===r.length)try{let e=await fetch("https://awesome-data.hub.so.kg/awesome.json");if(!e.ok)throw Error(`HTTP error! status: ${e.status}`);r=await e.json()}catch(e){console.error("Error fetching awesome_contents.json:",e),t.innerHTML="<p>加载数据失败，请检查网络连接或稍后再试。</p>"}return r}n.addEventListener("click",i),s.addEventListener("click",i);let l=new IntersectionObserver((e,t)=>{e.forEach(e=>{if(e.isIntersecting){let n=e.target;n.src=n.dataset.src,n.classList.remove("lazyload"),t.unobserve(n)}})});function c(e){document.querySelectorAll("#category-tree a").forEach(e=>e.classList.remove("active")),e.classList.add("active")}async function d(e){if(!e){t.innerHTML="<p>请选择一个分类。</p>";return}t.innerHTML="";for(let e=0;e<9;e++)t.appendChild(function(){let e=document.createElement("div");return e.className="skeleton-card",e.innerHTML=`
      <div class="skeleton-card-header">
        <div class="skeleton-circle"></div>
        <div class="skeleton-title"></div>
      </div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line medium"></div>
    `,e}());let n=function e(t,n){for(let a of t){if(a.name===n)return a.sub_categories||[];if(a.sub_categories){let t=e(a.sub_categories,n);if(null!==t)return t}}return null}(r,e);if(await new Promise(e=>setTimeout(e,300)),t.innerHTML="",null===n||0===n.length){t.innerHTML="<p>该分类下暂无内容。</p>";return}t.className="grid-view",n.forEach(e=>{t.appendChild(function(e){let t=document.createElement("div");t.className="website-card";let n=e.repo?`https://www.google.com/s2/favicons?domain=${new URL(e.repo).hostname}`:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',a="",s=e.brief||(e.sub_categories?`\u{5305}\u{542B} ${e.sub_categories.length} \u{4E2A}\u{9879}\u{76EE}`:null);return s&&(a=`
        <div class="website-card-body">
          <p>${s}</p>
        </div>`),t.innerHTML=`
      <div class="website-card-content">
        <div class="website-card-header">
          <img data-src="${n}" alt="${e.name} Logo" class="logo lazyload">
          <h3>${e.name}</h3>
        </div>
        ${a}
      </div>
    
      <div class="card-button-group">
        <a href="${e.repo||"#"}" target="_blank" class="card-button primary">
          <span class="material-icons">code</span> GitHub
        </a>
        <a href="${e.url||"#"}" target="_blank" class="card-button secondary">
          <span class="material-icons">link</span> Visit
        </a>
      </div>
    `,!e.repo&&e.sub_categories&&t.querySelector(".website-card-content").addEventListener("click",t=>{t.preventDefault(),d(e.name)}),t}(e))}),document.querySelectorAll("img.lazyload").forEach(e=>l.observe(e))}(async function t(){await o();let t=document.createElement("ul");r.forEach(e=>{let n=document.createElement("li"),a=document.createElement("a");a.href="#",a.textContent=e.name,a.dataset.categoryName=e.name,a.addEventListener("click",t=>{t.preventDefault(),c(a),d(e.name),window.innerWidth<=1023&&i()}),n.appendChild(a),t.appendChild(n)}),e.innerHTML="",e.appendChild(t);let n=e.querySelector("a[data-category-name]");n&&(c(n),d(n.dataset.categoryName))})()});