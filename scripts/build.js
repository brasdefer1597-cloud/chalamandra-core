const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🦎 Building Chalamandra Core Chrome Extension...');

class BuildManager {
  constructor() {
    this.buildDir = 'build';
    this.version = this.getVersion();
  }

  getVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  }

  build() {
    this.createBuildDirectory();
    this.copyEssentialFiles();
    this.createVersionFile();
    this.createZipPackage();
    this.printBuildSummary();
  }

  createBuildDirectory() {
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true });
    }
    fs.mkdirSync(this.buildDir, { recursive: true });
    console.log('✅ Created build directory');
  }

  copyEssentialFiles() {
    const filesToCopy = [
      'manifest.json',
      'popup/',
      'content/',
      'background/',
      'core/',
      'icons/'
    ];

    filesToCopy.forEach(item => {
      const source = item;
      const destination = path.join(this.buildDir, item);
      
      if (item.endsWith('/')) {
        this.copyDirectory(source.slice(0, -1), destination);
      } else {
        this.copyFile(source, destination);
      }
    });
    
    console.log('✅ Copied all extension files');
  }

  copyFile(source, destination) {
    try {
      fs.copyFileSync(source, destination);
      console.log(`   📄 ${source} → ${path.relative(this.buildDir, destination)}`);
    } catch (error) {
      console.error(`   ❌ Error copying ${source}:`, error.message);
    }
  }

  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        this.copyFile(sourcePath, destPath);
      }
    });
  }

  createVersionFile() {
    const versionInfo = {
      name: 'Chalamandra Core',
      version: this.version,
      buildDate: new Date().toISOString(),
      hackathon: {
        name: 'Google Chrome Built-in AI Challenge 2025',
        category: 'Most Helpful Chrome Extension',
        submissionDate: '2025-10-31'
      },
      features: [
        'Multidimensional Communication Analysis',
        'Sarcasm and Incongruence Detection',
        'Explainable AI (XAI)',
        'Hybrid Privacy-First Architecture',
        'Chrome AI APIs Integration'
      ]
    };

    const versionPath = path.join(this.buildDir, 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    console.log('✅ Created version metadata');
  }

  createZipPackage() {
    const zipName = `chalamandra-core-v${this.version}.zip`;
    const zipPath = path.join(this.buildDir, zipName);
    
    try {
      // This would use a proper zip library in real implementation
      // For now, just note that packaging is ready
      console.log('✅ Build ready for packaging');
      console.log(`   📦 Run: cd ${this.buildDir} && zip -r ${zipName} .`);
    } catch (error) {
      console.log('📦 Manual packaging required');
      console.log(`   Run: cd ${this.buildDir} && zip -r ${zipName} .`);
    }
  }

  printBuildSummary() {
    console.log('\n🎉 BUILD COMPLETED SUCCESSFULLY!');
    console.log('================================');
    console.log(`Version: ${this.version}`);
    console.log(`Build directory: ${this.buildDir}`);
    console.log(`Total files: ${this.countFiles(this.buildDir)}`);
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Load extension in Chrome:');
    console.log('   chrome://extensions → Enable "Developer mode"');
    console.log('   → "Load unpacked" → Select "build" folder');
    console.log('2. Test all analysis modes');
    console.log('3. Create demo video');
    console.log('4. Submit to hackathon!');
  }

  countFiles(dir) {
    let count = 0;
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        count += this.countFiles(itemPath);
      } else {
        count++;
      }
    });
    
    return count;
  }
}

// Run build
const buildManager = new BuildManager();
buildManager.build();
