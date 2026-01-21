module.exports = {
  apps: [{
    name: 'barracuda-app',
    script: 'npm',
    args: 'run start',
    cwd: '/var/www/barracuda-marketing',
    interpreter: 'none',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

