#! /bin/bash
rm -f docs/*.html
go run main.go
npx http-server docs
