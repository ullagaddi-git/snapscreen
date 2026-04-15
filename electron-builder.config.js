/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: 'com.snapscreen.app',
  productName: 'SnapScreen',
  directories: {
    output: 'dist',
    buildResources: 'assets'
  },
  files: [
    'out/**/*',
    'assets/**/*'
  ],
  win: {
    target: 'nsis',
    icon: 'assets/icon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  extraResources: [
    {
      from: 'assets',
      to: 'assets',
      filter: ['**/*']
    }
  ]
}
