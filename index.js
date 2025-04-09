#!/usr/bin/env node

const fs = require("fs");
const https = require("https");
const httpProxy = require("http-proxy");
const selfsigned = require("selfsigned");

// Default values
const DEFAULT_PORT = 9090;
const DEFAULT_TARGET_URL = "http://localhost:8080";

const CERT_FILE = "./ssl_cert.txt";
const KEY_FILE = "./ssl_privatekey.txt";

// Parse command-line arguments
const args = process.argv.slice(2);
let PORT = (
  args.find((arg) => arg.startsWith("PORT="))?.split("=")[1] || ""
).trim();
let TARGET_URL = (
  args.find((arg) => arg.startsWith("TARGET_URL="))?.split("=")[1] || ""
).trim();

// Function to prompt user for input
function promptUserForInput(field, defaultValue, rl) {
  return new Promise((resolve) => {
    rl.question(`${field} (default: ${defaultValue}): `, (input) => {
      resolve((input || defaultValue).trim());
    });
  });
}

// Prompt user for values if not provided through command-line arguments
async function promptForValues() {
  let needsPrompt = false;

  if (isNaN(parseInt(PORT))) needsPrompt = true;
  if (!TARGET_URL) needsPrompt = true;

  if (!needsPrompt) {
    // Prepend "http://" if TARGET_URL doesn't already have a protocol
    if (!/^https?:\/\//i.test(TARGET_URL)) {
      TARGET_URL = `http://${TARGET_URL}`;
    }

    runProxy();
    return;
  }

  // Only create readline interface if needed
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (isNaN(parseInt(PORT))) {
    PORT = await promptUserForInput("Enter PORT", DEFAULT_PORT, rl);
  }

  if (!TARGET_URL) {
    TARGET_URL = await promptUserForInput("Enter TARGET_URL", DEFAULT_TARGET_URL, rl);
  }

  if (!/^https?:\/\//i.test(TARGET_URL)) {
    TARGET_URL = `http://${TARGET_URL}`;
  }

  console.log(
    `
====

npx https://github.com/synle/proxy-starter PORT=${PORT} TARGET_URL=${TARGET_URL}

====
    `.trim()
  );

  rl.close();
  runProxy();
}

// Generate self-signed certificate if not found
function ensureSSLCertificates() {
  const certExists = fs.existsSync(CERT_FILE);
  const keyExists = fs.existsSync(KEY_FILE);

  if (!certExists || !keyExists) {
    console.log("SSL certificate or key not found. Generating self-signed certificate...");
    const attrs = [{ name: "commonName", value: "localhost" }];
    const pems = selfsigned.generate(attrs, { days: 365 });

    fs.writeFileSync(CERT_FILE, pems.cert);
    fs.writeFileSync(KEY_FILE, pems.private);

    console.log("Self-signed SSL certificate generated.");
  }
}

// Run the proxy server
function runProxy() {
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
      proxy.web(req, res); // Proxy the request to the target URL
    })
    .listen(PORT, () => {
      console.log(
        `HTTPS proxy server listening on port ${PORT}, forwarding to ${TARGET_URL}`
      );
    });
}

// Start the process
promptForValues();
