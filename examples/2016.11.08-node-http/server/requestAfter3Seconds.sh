#!/bin/bash
for i in `seq 1 3` 
    do curl http://127.0.0.1:3000;
done 

sleep 4

curl http://127.0.0.1:3000