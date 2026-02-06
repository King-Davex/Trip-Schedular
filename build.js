const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Function to copy file
function copyFile(src, dest) {
    fs.copyFileSync(src, dest);
}

// Function to copy directory
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

// Copy index.html
console.log('Copying index.html...');
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    copyFile(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
}

// Copy css folder
console.log('Copying css/...');
if (fs.existsSync(path.join(__dirname, 'css'))) {
    copyDir(path.join(__dirname, 'css'), path.join(distDir, 'css'));
}

// Copy js folder
console.log('Copying js/...');
if (fs.existsSync(path.join(__dirname, 'js'))) {
    copyDir(path.join(__dirname, 'js'), path.join(distDir, 'js'));
}

console.log('Build completed successfully!');
