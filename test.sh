#!/usr/bin/env bash

#-------
# Setup
#-------
export BROWSERSTACK_USERNAME=rohm BROWSERSTACK_ACCESS_KEY=9LyWuES7p4h5hB8IjHUT

echo "Setting up infrastructure to run tests"
sudo apt-get install -y screen curl unzip
mkdir -p ~/tmp/screen && chmod 700 ~/tmp/screen
export SCREENDIR=$HOME/tmp/screen

# Install Browserstack Local
echo 'Installing browserstack local'
npm install -g nodemon
curl https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip -o bs.zip
unzip -o bs.zip

# Run bs local
echo 'Starting BrowserStackLocal'
screen -dmS browserstack-local bash -c "./BrowserStackLocal $BROWSERSTACK_ACCESS_KEY 2>&1 1>./bsLog"
sleep 10

# Run gulp tasks
echo 'Running gulp tasks'
screen -dmS gulp-tasks bash -c './node_modules/.bin/gulp watch 2>&1 1>./gulpLog'
sleep 7

# Start server
echo 'Starting Server'
if [[ "$*" == *'--CI'* ]]; then
    screen -dmS web-server bash -c 'cd server && NODE_ENV=production nodemon > ../nodeLog 2>&1'
else
    screen -dmS web-server bash -c 'cd server && nodemon > ../nodeLog 2>&1'
fi
sleep 7
# END


#-----------
# Run tests
#-----------
if [[ "$*" != *'--local'* ]]; then
    echo "Running test remotely"
    ./node_modules/.bin/intern-runner config=tests/intern\
    base_url=http://localhost:8000
    TESTS_PASSED=$?
fi
# END


#----------
# Teardown
#----------
# Stop gulp task
screen -X -S gulp-tasks quit
kill -9 $(ps aux | grep '[g]ulp' | awk '{print $2}')
echo "Gulp tasks stopped"

# Stop server
screen -X -S web-server quit
kill -9 $(ps aux | grep '[n]odemon' | awk '{print $2}')
kill -9 $(ps aux | grep '[n]ode index.js' | awk '{print $2}')
echo "Server stopped"

# Stop browserstack-local
screen -X -S browserstack-local quit
kill -9 $(ps aux | grep '[B]rowserStackLocal' | awk '{print $2}')
echo "BrowserStackLocal stopped"
# END

if [[ $TESTS_PASSED == 1 ]]
  then
    echo "Test(s) failed, screen logs below..."
    echo "bsLog" && cat bsLog
    echo "gulpLog" && cat gulpLog
    echo "nodeLog" && cat nodeLog
    exit 1
fi
