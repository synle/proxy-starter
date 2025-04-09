#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Defaults
const DEFAULT_PORT = 9090;
const DEFAULT_TARGET_URL = "http://localhost:8080";

// Parse command-line args
const args = process.argv.slice(2);
let PORT = args.find((arg) => arg.startsWith("PORT="))?.split("=")[1];
let TARGET_URL = args.find((arg) => arg.startsWith("TARGET_URL="))?.split("=")[1];

// If PORT or TARGET_URL is not provided, show an error and exit
if (!PORT || !TARGET_URL) {
  console.error("Error: Both PORT and TARGET_URL must be provided as arguments.");
  console.log("Usage: node new-proxy.js PORT=<port> TARGET_URL=<target_url>");
  process.exit(1);
}

// Ensure protocol for TARGET_URL
if (!/^https?:\/\//i.test(TARGET_URL)) {
  TARGET_URL = `http://${TARGET_URL}`;
}

// Generate timestamped filename
const timestamp = Date.now();
const indexFilename = `index.${timestamp}.js`;

// Create package.json
const packageJson = {
  name: "proxy-starter",
  version: "1.0.0",
  main: "index.js",
  scripts: {
    start: "node index.js",
    format: "npx prettier --write ./*.js ./*.json",
  },
  bin: {
    "proxy-starter": "index.js",
  },
  author: "Sy Le",
  license: "ISC",
  description:
    "A Node.js script for setting up an HTTPS reverse proxy with a self-signed certificate.",
  dependencies: {
    "http-proxy": "^1.18.1",
    selfsigned: "^2.4.1",
  },
};

fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
console.log("✅ Created package.json");

// Write index file
const indexContent = `
const PORT = ${PORT};
const TARGET_URL = "${TARGET_URL}";
const CERT_FILE = "./ssl_cert.txt";
const KEY_FILE = "./ssl_privatekey.txt";

const fs = require("fs");
const https = require("https");
const httpProxy = require("http-proxy");
const selfsigned = require("selfsigned");

function ensureSSLCertificates() {
  if (!fs.existsSync(CERT_FILE) || !fs.existsSync(KEY_FILE)) {
    console.log("SSL certificate or key not found. Generating self-signed certificate...");
    const attrs = [{ name: "commonName", value: "localhost" }];
    const pems = selfsigned.generate(attrs, { days: 365 });
    fs.writeFileSync(CERT_FILE, pems.cert);
    fs.writeFileSync(KEY_FILE, pems.private);
    console.log("Self-signed SSL certificate generated.");
  }
}

ensureSSLCertificates();

const sslOptions = {
  key: fs.readFileSync(KEY_FILE),
  cert: fs.readFileSync(CERT_FILE),
};

const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true,
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  res.writeHead(502, { "Content-Type": "text/plain" });
  res.end("Bad gateway");
});

https
  .createServer(sslOptions, (req, res) => {
    proxy.web(req, res);
  })
  .listen(PORT, () => {
    console.log(
      \`HTTPS proxy server listening on port \${PORT}, forwarding to \${TARGET_URL}\`
    );
  });
`;

fs.writeFileSync(indexFilename, indexContent.trimStart());
console.log(`✅ Created ${indexFilename}`);
