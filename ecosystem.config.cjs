module.exports = {
  apps: [
    {
      name: 'leovra-store',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        HTTP_PORT: 80,
        HTTPS_PORT: 443
      }
    }
  ]
};
