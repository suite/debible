#!/bin/bash

# Build the React app
npm run build

# Transfer files to VPS
scp -r build/* root@162.243.169.74:/var/www/bookofdegod.com/

# SSH into the VPS and set permissions, reload Nginx
ssh root@162.243.169.74 << EOF
  chown -R www-data:www-data /var/www/bookofdegod.com
  chmod -R 755 /var/www/bookofdegod.com
  systemctl reload nginx
EOF

echo "Deployment completed!"
