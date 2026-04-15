/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: 'com.snapscreen.app',
  productName: 'SnapScreen',
  copyright: 'Copyright © 2026',
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
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: false
  },
  extraResources: [
    {
      from: 'assets',
      to: 'assets',
      filter: ['**/*']
    },
    {
      from: 'node_modules/ffmpeg-static',
      to: 'ffmpeg-static',
      filter: ['ffmpeg.exe']
    }
  ]
}
