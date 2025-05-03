#!/usr/bin/env bash

# Add changes, commit them and finally push to GitHub

git status
git add .
git commit -m "$1"
git push
