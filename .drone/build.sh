#!/usr/bin/env bash
set -e
echo "current user: $(whoami)"
echo "current versions: node=$(node -v), npm=$(npm -v)"
echo "current directory is `pwd`"
echo -e "\nUpdating project dependencies"
npm config set registry http://registry.npmjs.org/
rm -rf ~/.npm
CI=true npm install
echo -e "\nRunning init scripts"
npm run pre-prod

echo "Running tests..."
./test.sh --CI

echo "build complete"
