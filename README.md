# Clowner

A simple CLI tool to locally clone any website. One command gives you all HTML, CSS, and JS files neatly separated into folders — perfect for offline testing and analysis.

 

## ✅ Features

- Fetches HTML from any public website  
- Automatically downloads linked CSS and JS files  
- Saves everything in a clean folder structure  
- Works fully offline after cloning  
- Includes `clowner update` command to fetch the latest version  

 

## 🚀 Installation

Clowner requires Node.js (v18 or higher). Here's how to set everything up:

### 1. Install Node.js (for Linux)

If you don't have Node.js or need to upgrade:

```
sudo apt remove nodejs npm -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```
Check version: ```node -v``` and ```npm -v``` (Should be v18.x or higher)
 
### 2. Clone the repo
```git clone https://github.com/lucasenlucas/clowner.git```
```cd clowner```

### 3. Make the script executable
```chmod +x bin/clowner.js```

### 4. Install globally
```sudo npm install -g .```

Done! You can now run clowner anywhere in your terminal:

```
clowner <url> -o <output-folder>
```

Example:

```
clowner example.com -o copy_example
```



## ⚠️ Disclaimer

This tool is for educational purposes only.
Do **not** use it to clone websites without permission.
The developer is not responsible for any misuse.



👨‍💻 scripted by **Lucas Mangroelal**
