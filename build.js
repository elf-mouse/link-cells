const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Get site name from command line arguments
const siteName = process.argv[2];
if (!siteName) {
  console.error('Error: Please provide a site name as an argument.');
  console.log('Usage: node build.js <site_name>');
  process.exit(1);
}

// 2. Read sites.json
const sitesConfigPath = path.join(__dirname, 'sites.json');
const sitesConfig = JSON.parse(fs.readFileSync(sitesConfigPath, 'utf8'));
const siteConfig = sitesConfig[siteName];

if (!siteConfig) {
  console.error(`Error: Site "${siteName}" not found in sites.json.`);
  process.exit(1);
}

const { analyticsId, siteName: configSiteName, description, keywords } = siteConfig;

// 3. Prepare for build
const distDir = path.join(__dirname, 'dist');
const tempHtmlPath = path.join(__dirname, 'src', 'index.temp.html');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 4. Create temporary HTML entry point
const sourceHtmlPath = path.join(__dirname, 'src', 'index.html');
let htmlContent = fs.readFileSync(sourceHtmlPath, 'utf8');

const scriptTag = `<script type="module" src="./main-${siteName}.js"></script>`;
htmlContent = htmlContent.replace('<!-- SCRIPT_ENTRY_POINT -->', scriptTag);

fs.writeFileSync(tempHtmlPath, htmlContent);

// 5. Run Parcel build
const parcelCommand = `NODE_ENV=production parcel build ${tempHtmlPath} --no-source-maps --dist-dir ${distDir}`;

console.log(`Building site: ${siteName}...`);
console.log(`Executing: ${parcelCommand}`);

try {
  execSync(parcelCommand, { stdio: 'inherit' });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // 6. Clean up temporary HTML file from src
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}

// 7. Post-build processing of the final index.html
const builtHtmlPath = path.join(distDir, 'index.temp.html'); // Parcel names it after the entry file
const finalHtmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(builtHtmlPath)) {
  let finalHtmlContent = fs.readFileSync(builtHtmlPath, 'utf8');

  // Inject SEO content
  finalHtmlContent = finalHtmlContent.replace(
    /<title>.*<\/title>/,
    `<title>LinkCells - ${configSiteName}<\/title>`
  );

  const headEndTag = '<\/head>';
  const seoMetaTags = `\n    <meta name="description" content="${description}">\n    <meta name="keywords" content="${keywords}">\n  `;
  finalHtmlContent = finalHtmlContent.replace(headEndTag, `${seoMetaTags}${headEndTag}`);

  // Update logo text
  const logoRegex = /<div class="logo">.*<\/div>/;
  finalHtmlContent = finalHtmlContent.replace(logoRegex, `<div class="logo">LinkCells - ${configSiteName}<\/div>`);

  // Add analytics script
  const analyticsScript = `<script src="https://analytics.balmjs.com/api/script.js" data-site-id="${analyticsId}" defer><\/script>`;
  const bodyEndTag = '<\/body>';
  if (finalHtmlContent.includes(bodyEndTag)) {
    finalHtmlContent = finalHtmlContent.replace(bodyEndTag, `    ${analyticsScript}\n${bodyEndTag}`);
  } else {
    finalHtmlContent += analyticsScript;
  }

  fs.writeFileSync(builtHtmlPath, finalHtmlContent);
  fs.renameSync(builtHtmlPath, finalHtmlPath);

  console.log('Post-build processing complete.');
} else {
  console.error('Error: dist/index.temp.html not found after build.');
}
