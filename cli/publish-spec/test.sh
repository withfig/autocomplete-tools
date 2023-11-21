#!/usr/bin/env bash

set -e

# We had to extract this script to a file because pnpm crashes when it finds a `!` in an npm script
# We are using npm here because the pid returned by pnpm is wrong and would not shut down the server 
TEST_PORT=3005 node --import tsx test/server.ts & 
SERVER_PID=$! &&
sleep 2 && # Arbitrary time
npm run test:fixtures
kill $SERVER_PID