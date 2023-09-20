#!/bin/bash

kill $(lsof -ti:8002)

echo "turso dev db stopped"