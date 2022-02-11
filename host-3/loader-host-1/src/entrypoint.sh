#!/bin/sh

if [ -z $CLIENTS]
then
  CLIENTS=1
fi

locust -f loader.py --host "http://10.132.0.38:8888" --headless -u 1 -r 0.000001
