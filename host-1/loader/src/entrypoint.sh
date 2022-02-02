#!/bin/sh

if [ -z $CLIENTS]
then
  CLIENTS=1
fi

locust -f loader.py --host "$HOST" --headless -u 1 -r 0.00000001
