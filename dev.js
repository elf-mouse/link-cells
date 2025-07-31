const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 1. Get site name from command line arguments
const args = process.argv.slice(2);
const siteName = args.includes('--') ? args[args.indexOf('--') + 1] : args[0];
if (!siteName) {
  console.error('Error: Please provide a site name to develop.');
  console.log('Usage: node dev.js <site_name>');
  process.exit(1);
}

// 2. Define paths
const tempHtmlPath = path.join(__dirname, 'src', 'index.dev.html');
const sourceHtmlPath = path.join(__dirname, 'src', 'index.html');

// 3. Create temporary HTML entry point for development
let htmlContent = fs.readFileSync(sourceHtmlPath, 'utf8');
const scriptTag = `<script type="module" src="./main-${siteName}.js"></script>`;
htmlContent = htmlContent.replace('<!-- SCRIPT_ENTRY_POINT -->', scriptTag);

// Also inject the site name into the title and logo for a better dev experience
const sitesConfigPath = path.join(__dirname, 'sites.json');
const sitesConfig = JSON.parse(fs.readFileSync(sitesConfigPath, 'utf8'));
const siteConfig = sitesConfig[siteName];

if (siteConfig) {
  htmlContent = htmlContent.replace(
    /<title>.*<\/title>/,
    `<title>DEV MODE - ${siteConfig.siteName}<\/title>`
  );
  const logoRegex = /<div class="logo">.*<\/div>/;
  htmlContent = htmlContent.replace(logoRegex, `<div class="logo">${siteConfig.siteName} (Dev)<\/div>`);
}

fs.writeFileSync(tempHtmlPath, htmlContent);

// 4. Start Parcel dev server
const parcelCommand = `parcel ${tempHtmlPath} --dist-dir ${path.join(__dirname, 'dist')}`;
console.log(`Starting development server for site: ${siteName}...`);
console.log(`Executing: ${parcelCommand}`);

const parcelProcess = exec(parcelCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

parcelProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

parcelProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

// 5. Cleanup on exit
const cleanup = () => {
  console.log('\nCleaning up temporary files...');
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
  console.log('Cleanup complete. Exiting.');
  process.exit();
};

process.on('SIGINT', cleanup); // Catches Ctrl+C
process.on('SIGTERM', cleanup);