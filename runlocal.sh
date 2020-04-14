#! /bin/bash
rm -f docs/*.html && go run main.go && http-server docs