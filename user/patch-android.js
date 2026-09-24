const fs = require('fs');
const path = require('path');

// 1. Ensure res/xml directory exists
const xmlDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'xml');
if (!fs.existsSync(xmlDir)) {
  fs.mkdirSync(xmlDir, { recursive: true });
}

// 2. Write network_security_config.xml
const configContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;
fs.writeFileSync(path.join(xmlDir, 'network_security_config.xml'), configContent, 'utf8');

// 3. Patch AndroidManifest.xml
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android:usesCleartextTraffic')) {
    manifest = manifest.replace('<application ', '<application android:usesCleartextTraffic="true" ');
  }
  if (!manifest.includes('android:networkSecurityConfig')) {
    manifest = manifest.replace('<application ', '<application android:networkSecurityConfig="@xml/network_security_config" ');
  }
  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('✓ AndroidManifest.xml and network_security_config.xml configured for cleartext HTTP/WS.');
} else {
  console.warn('⚠️ AndroidManifest.xml not found at:', manifestPath);
}
