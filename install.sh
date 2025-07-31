#!/bin/bash

git clone https://github.com/lucasenlucas/clowner.git

cd clowner || exit

sudo npm install -g .

echo "✅ Done! You can now run all the commands!"
