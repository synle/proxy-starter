# 🚀 Simple HTTPS Proxy with Node.js

## 🧩 What Is This?

A quick and easy Node.js-based HTTPS reverse proxy setup — no need for complex Nginx configurations. This script:

- Spins up an HTTPS proxy server locally.
- Automatically generates a self-signed SSL certificate.
- Forwards HTTPS traffic to a target HTTP server.

Ideal for developers who want a secure proxy with minimal setup, as long as Node.js is installed.

---

## ⚡ Quick Start

### 🔧 Easiest Way (via `npx`)

Start the HTTPS proxy with one line:

```bash
npx https://github.com/synle/proxy-starter
```

### 🔄 Customize Port and Target

Pass `PORT` and `TARGET_URL` as arguments to customize the setup:

```bash
npx https://github.com/synle/proxy-starter PORT=4443 TARGET_URL=http://localhost:8000
```

```bash
npx https://github.com/synle/proxy-starter PORT=9090 TARGET_URL=http://localhost:3000
```

**Available Parameters:**

- `PORT` – The port for the HTTPS proxy (default: `9090`).
- `TARGET_URL` – The HTTP target to forward to (default: `http://localhost:8080`).

---

## 📦 Generate a Local Static Version

Clone and generate the proxy script locally using one of the following options:

#### For macOS/Linux
```bash
# For macOS/Linux (using curl):
curl -sL "https://github.com/synle/proxy-starter/blob/head/new-proxy.js?raw=1" | node - PORT=3000 TARGET_URL=http://example.com
```

#### For Windows
```bash
curl -L "https://github.com/synle/proxy-starter/blob/head/new-proxy.js?raw=1" --output new-proxy.js
node new-proxy.js PORT=3000 TARGET_URL=http://example.com
```
