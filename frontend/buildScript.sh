#!/usr/bin/env bash

# Build the MERN APP for production and reload Nginx

sudo npm run build
sudo cp -R dist/ /var/www/Futtech/frontend/
sudo nginx -t
sudo systemctl reload nginx

echo $'\nBuild and Nginx reload: Completed'
