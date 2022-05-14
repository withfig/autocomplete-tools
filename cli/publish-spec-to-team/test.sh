#!/usr/bin/env bash

# We had to extract this script to a file because yarn crashes when it finds a `!` in an npm script
# We are using npm here because the pid returned by yarn is wrong and would not shut down the server 
npm run test:server & SERVER_PID=$!
sleep 2
yarn test:fixtures
kill $SERVER_PID