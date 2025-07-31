# clowner
A simple CLI tool to locally clone any website. One command gives you all HTML, CSS, and JS files neatly separated into folders — perfect for offline testing and analysis.

## ✅ Features

- Fetches HTML from any public website
- Automatically downloads linked CSS and JS files
- Saves everything in a clean folder structure
- Works fully offline after cloning
- Includes `clowner update` command to fetch the latest version

## 🚀 Installation

```bash
npm install -g github:lucasenlucas/clowner

## 🔧 Usage
clowner <url> -o <output-folder>

Example:
clowner codeblocks.nl -o local-copy
