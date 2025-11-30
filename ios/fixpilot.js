#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { IS_CONVERGING_NOW, CI } = process.env;

const shell = process.env.SHELL || '/bin/bash';
const stdio = 'inherit';

if (IS_CONVERGING_NOW === 'true' || CI === 'true') {
  process.exit(0);
}

if (os.platform() !== 'darwin') {
  console.log('ℹ️ No Apple\'s in your way, you\'re gonna have a much better day!');
  process.exit(0);
}

function run (cmd, options = {}) {
  const out = execSync(cmd, { stdio, shell, ...options });
  const str = out?.toString();
  if (str) console.log(str);
}

console.log(`
   _  ____   _____   ______ _      _____ _ _  __   _   
  (_)/ __ \\ / ____| |  ____(_)    |  __ (_) | \\_\\ | |  
   _| |  | | (___   | |__   ___  _| |__) || | ___ | |_ 
  | | |  | |\\___ \\  |  __| | \\ \\/ /  ___/ | |/ _ \\| __|
  | | |__| |____) | | |    | |>  <| |   | | | (_) | |_ 
  |_|\\____/|_____/  |_|    |_/_/\\_\\_|   |_|_|\\___/ \\__|
                                                      
  Because Apple and Meta always do it all right at the first go,
  but we cannot™.

This script will clean up and prepare the iOS build environment and make sure everything is in a good state.
`);

process.on('SIGINT', () => {
  console.log('\n❌ Operation cancelled by user');
  process.exit(1);
});

try {
  // Change to project root directory
  process.chdir(path.resolve(__dirname, '..'));

  // check node version is that in .nvmrc
  const nvmrc = fs.readFileSync('.nvmrc', 'utf-8').trim();
  const nodeVersion = process.version;
  if (nodeVersion !== nvmrc) {
    console.log(`⚠️  Node version ${nodeVersion} does not match .nvmrc version ${nvmrc}.`);
    console.log(`Use nvm install ${nvmrc} && nvm use ${nvmrc} to switch to the correct version.`);
    process.exit(1);
  }

  const rvmrc = fs.readFileSync('.ruby-version', 'utf-8').trim();
  const rubyVersion = execSync('ruby -e "puts RUBY_VERSION"').toString().trim();
  if (rubyVersion !== rvmrc) {
    console.log(`⚠️  Ruby version ${rubyVersion} does not match .ruby-version version ${rvmrc}.`);
    console.log(`Use rvm install ${rvmrc} && rvm use ${rvmrc} to switch to the correct version.`);
    process.exit(1);
  }

  if (!process.argv.includes('--skip-derived')) {
    console.log('You may be prompted for your password to delete some files.');
    console.log('⚠️  Your XCode DerivedData folder will be erased, it shouldn\'t affect projects but be aware of it.');
    // Prompt user to continue
    try {
      run('echo "Press Enter to continue or Ctrl+C to abort: " && read dummy');
    } catch (error) {
      console.log('❌  Canceled');
      process.exit(1);
    }

    console.log('♻️  cleaning DerivedData');
    run('sudo rm -rf ~/Library/Developer/Xcode/DerivedData');
  }

  // Clean Pods and build files
  console.log('🎵  cleaning Pods and build files');
  run('rm -rf ios/Pods ios/build ios/.xcode.env.local');

  // Clean android build files
  console.log('🤖  cleaning Android build files');
  run('rm -rf android/app/build android/build');

  if (!process.argv.includes('--skip-modules')) {
    console.log('🪢  cleaning node_modules');
    run('rm -rf node_modules');

    console.log('Installing node modules');
    run('npm install', {
      env: { ...process.env, IS_CONVERGING_NOW: 'true' }
    });
  }

  console.log('💎  Running bundle install');
  run('bundle install');

  console.log('📦  Running pod install');
  try {
    run('npm run pod-install');
  } catch (error) {
    console.log('🛁  Pod install failed, trying harder');
    run('rm -f ios/Podfile.lock');
    run('cd ios && bundle exec pod repo update');
    run('npm run pod-install');
  }

  console.log('✅  Done');

} catch (error) {
  console.error('❌  An error occurred:', error.message);
  process.exit(1);
}
