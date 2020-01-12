@echo off

set VERSION=%1%

docker build -f .\docker\images\%VERSION%.Dockerfile -t arya-runner . 