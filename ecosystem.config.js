module.exports = {
  apps: [
    {
      name: 'zealthy-backend',
      script: 'dist/index.js',
      cwd: '/home/ubuntu/zealthy-emr/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/home/ubuntu/logs/backend-error.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      log_file: '/home/ubuntu/logs/backend-combined.log',
      time: true
    },
    {
      name: 'zealthy-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: '/home/ubuntu/zealthy-emr/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/ubuntu/logs/frontend-error.log',
      out_file: '/home/ubuntu/logs/frontend-out.log',
      log_file: '/home/ubuntu/logs/frontend-combined.log',
      time: true
    }
  ]
};
