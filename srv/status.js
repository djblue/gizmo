exports.setup = function (app) {
  app.get('/status', function (req, res) {
    res.json({
      cwd: process.cwd(),
      //env: process.env,
      version: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      arch: process.arch,
      platform: process.platform
    });
  });
};
