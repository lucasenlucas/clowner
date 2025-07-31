#!/usr/bin/env node

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");
const { URL } = require("url");
const { execSync } = require("child_process");

// CLI input
const args = process.argv.slice(2);
const command = args[0];
const outputFlagIndex = args.indexOf("-o");
const outputDir = outputFlagIndex !== -1 ? args[outputFlagIndex + 1] : "clowned";

// =====================
// zo en nu het update gedeelte
// =====================
if (command === "update") {
  console.log("🔄 Updating Clowner CLI...");
  try {
    execSync("npm uninstall -g clowner", { stdio: "inherit" });
    execSync("npm install -g github:lucasenlucas/clowner", { stdio: "inherit" });
    console.log("✅ Clowner successfully updated.");
  } catch (err) {
    console.error("❌ Update failed:", err.message);
  }
  process.exit(0);
}

// =====================
// het prachtige clown command
// =====================
if (!command || command.startsWith("-")) {
  console.log("❌ Usage: clowner <url> -o <output-folder>");
  process.exit(1);
}

const targetUrl = command.startsWith("http") ? command : `https://${command}`;

(async () => {
  try {
    const res = await axios.get(targetUrl);
    const html = res.data;
    const $ = cheerio.load(html);

    // Mappen
    const outHtmlDir = path.join(outputDir, "html");
    const outCssDir = path.join(outputDir, "css");
    const outJsDir = path.join(outputDir, "js");
    await fs.ensureDir(outHtmlDir);
    await fs.ensureDir(outCssDir);
    await fs.ensureDir(outJsDir);

    // Download CSS
    const cssLinks = $("link[rel='stylesheet']");
    await Promise.all(cssLinks.map(async (i, el) => {
      const href = $(el).attr("href");
      if (href) {
        const fullUrl = new URL(href, targetUrl).href;
        const filename = `style${i}.css`;
        try {
          const css = await axios.get(fullUrl);
          await fs.writeFile(path.join(outCssDir, filename), css.data);
          $(el).attr("href", `../css/${filename}`);
        } catch {
          console.log(`⚠️  Failed to download CSS: ${fullUrl}`);
        }
      }
    }).get());

    // Download JS
    const scripts = $("script[src]");
    await Promise.all(scripts.map(async (i, el) => {
      const src = $(el).attr("src");
      if (src) {
        const fullUrl = new URL(src, targetUrl).href;
        const filename = `script${i}.js`;
        try {
          const js = await axios.get(fullUrl);
          await fs.writeFile(path.join(outJsDir, filename), js.data);
          $(el).attr("src", `../js/${filename}`);
        } catch {
          console.log(`⚠️  Failed to download JS: ${fullUrl}`);
        }
      }
    }).get());

    // HTML opslaan
    await fs.writeFile(path.join(outHtmlDir, "index.html"), $.html());

    console.log(`✅ Website cloned to: ${outputDir}/`);
  } catch (err) {
    console.error("❌ Error cloning site:", err.message);
  }
})();

// als je dit ziet, thx voor het gebruiken van mijn tool.

