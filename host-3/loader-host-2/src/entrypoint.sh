#!/bin/sh

if [ -z $CLIENTS]
then
  CLIENTS=1
fi

locust -f loader.py --host "http://192.168.1.4:8888" --headless -u 1 -r 0.00000001
