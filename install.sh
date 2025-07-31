#!/bin/bash

echo "📦 Cloning Clowner..."
git clone https://github.com/lucasenlucas/clowner.git

cd clowner || exit
echo "🛠 Installing Clowner globally..."
sudo npm install -g .

echo "✅ Done! You can now run all the commands!"
