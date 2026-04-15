/**
 * @type {import('electron-builder').Configuration}
 *
 * TASK-041: Code Signing Setup
 * To sign the installer and avoid Windows SmartScreen warnings:
 * 1. Purchase an OV (Organization Validation) code signing certificate (~$70-200/year)
 *    Recommended providers: Certum, Sectigo, DigiCert
 * 2. Set environment variables before building:
 *    - CSC_LINK: path to the .pfx certificate file
 *    - CSC_KEY_PASSWORD: certificate password
 * 3. Run: npm run dist
 * electron-builder will automatically sign the exe and installer.
 *
 * For EV certificates (instant SmartScreen trust):
 * - Requires a hardware token (USB dongle)
 * - Set win.signingHashAlgorithms: ['sha256']
 * - Cost: ~$300-500/year
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
    icon: 'assets/icon.ico',
    // Uncomment when certificate is available:
    // signingHashAlgorithms: ['sha256'],
    // certificateSubjectName: 'Your Company Name',
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
