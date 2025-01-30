const forever = require('forever-monitor');

const child = new (forever.Monitor)('app.js', {
  max: 3,
  silent: false,
  args: []
});

child.on('exit', () => {
  console.log('your-filename.js has exited after 3 restarts');
});

child.start();