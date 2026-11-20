export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const isProd = process.env.NODE_ENV === 'production';

  let responseBody;
  if (!isProd) {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };
  }

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';

    if (isProd) {
      console.log(
        JSON.stringify({
          level,
          time: new Date().toISOString(),
          method: req.method,
          url: req.originalUrl,
          status,
          durationMs: Number(durationMs.toFixed(2)),
          ip: req.ip,
          userAgent: req.get('user-agent') || null,
          requestId: req.id,
        })
      );
      return;
    }

    const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';
    const dim = '\x1b[2m';

    console.log(
      `\n${color}${level}${reset} ${dim}${new Date().toISOString()}${reset} ` +
        `${req.method} ${req.originalUrl} ${color}${status}${reset} ${dim}${durationMs.toFixed(2)}ms${reset}`
    );
    console.log(`${dim}  ip:${reset} ${req.ip}  ${dim}ua:${reset} ${req.get('user-agent') || '-'}`);
    if (req.body && Object.keys(req.body).length) {
      console.log(`${dim}  body:${reset}`, req.body);
    }
    if (responseBody !== undefined) {
      console.log(`${dim}  response:${reset}`, responseBody);
    }
  });

  next();
}