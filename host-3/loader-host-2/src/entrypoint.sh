#!/bin/sh

if [ -z $CLIENTS]
then
  CLIENTS=1
fi

locust -f loader.py --host "http://host-2:8888" --headless -u 1 -r 0.00001
