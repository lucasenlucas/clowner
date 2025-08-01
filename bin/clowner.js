#!/usr/bin/env node

const cheerio = require("cheerio");
const fs = require("fs-extra");
const https = require("https");
const http = require("http");
const path = require("path");
const { URL } = require("url");

// ────────── CLI Input ────────── //
const args = process.argv.slice(2);
const command = args[0];
const outputFlagIndex = args.indexOf("-o");
const outputDir = outputFlagIndex !== -1 ? args[outputFlagIndex + 1] : "clowned";

if (!command || command.startsWith("-")) {
  console.log("❌ Usage: clowner <url> -o <output-folder>");
  process.exit(1);
}

const targetUrl = command.startsWith("http") ? command : `https://${command}`;

// ────────── Helpers ────────── //

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed. Status code: ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function downloadToFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`Failed to download: ${url}`));
      fs.ensureDirSync(path.dirname(outputPath));
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => resolve());
    }).on("error", reject);
  });
}

// ────────── Cloning Logic ────────── //

(async () => {
  try {
    const html = await fetchRaw(targetUrl);
    const $ = cheerio.load(html);

    const htmlDir = path.join(outputDir, "html");
    const cssDir = path.join(outputDir, "css");
    const jsDir = path.join(outputDir, "js");
    const assetsDir = path.join(outputDir, "assets");

    await fs.ensureDir(htmlDir);
    await fs.ensureDir(cssDir);
    await fs.ensureDir(jsDir);
    await fs.ensureDir(assetsDir);

    const downloadables = [];

    // 🎨 CSS
    $("link[rel='stylesheet']").each((i, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const fullUrl = new URL(href, targetUrl).href;
      const filename = `style${i}.css`;
      const localPath = path.join("css", filename);
      downloadables.push(downloadToFile(fullUrl, path.join(outputDir, localPath)));
      $(el).attr("href", `../${localPath}`);
    });

    // 📜 JS
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src");
      if (!src) return;
      const fullUrl = new URL(src, targetUrl).href;
      const filename = `script${i}.js`;
      const localPath = path.join("js", filename);
      downloadables.push(downloadToFile(fullUrl, path.join(outputDir, localPath)));
      $(el).attr("src", `../${localPath}`);
    });

    // 🖼️ Assets
    $("[src], [href]").each((i, el) => {
      const attr = $(el).attr("src") ? "src" : "href";
      const value = $(el).attr(attr);
      if (!value || value.startsWith("data:") || value.startsWith("#")) return;

      const ext = path.extname(value).toLowerCase();
      const isAsset = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".otf", ".mp4", ".webm"].includes(ext);
      if (!isAsset) return;

      const fullUrl = new URL(value, targetUrl).href;
      const filename = `asset_${i}${ext}`;
      const localPath = path.join("assets", filename);
      downloadables.push(downloadToFile(fullUrl, path.join(outputDir, localPath)));
      $(el).attr(attr, `../${localPath}`);
    });

    await Promise.all(downloadables);

    // 💾 Save HTML
    await fs.writeFile(path.join(htmlDir, "index.html"), $.html());
    console.log(`✅ Site cloned successfully to '${outputDir}/'`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
