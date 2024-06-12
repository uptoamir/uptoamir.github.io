const fs = require("fs-extra");
const path = require("path");

const copyDirectoryContentsToRoot = (sourceDir, destDir) => {
  if (fs.existsSync(sourceDir)) {
    fs.readdirSync(sourceDir).forEach((item) => {
      const srcPath = path.join(sourceDir, item);
      const destPath = path.join(destDir, item);
      fs.copySync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    });
  } else {
    console.log(`Directory ${sourceDir} does not exist.`);
  }
};

const main = () => {
  const destDir = path.resolve(__dirname, "dist");

  // Copy contents of 'static' to the root of 'dist'
  const staticDir = path.resolve(__dirname, "static");
  copyDirectoryContentsToRoot(staticDir, destDir);

  // Copy 'webpage' directory to 'dist/webpage'
  const webpageDir = path.resolve(__dirname, "webpage");
  const destWebpageDir = path.join(destDir, "webpage");
  fs.copySync(webpageDir, destWebpageDir);
  console.log(`Copied ${webpageDir} to ${destWebpageDir}`);
};

main();
