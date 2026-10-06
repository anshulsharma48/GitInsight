import mongoose from 'mongoose';

/**
 * Controller to provide health and diagnostic information about the backend service.
 */
export const getHealth = (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = dbStatusMap[dbStateCode] || 'unknown';

  const healthData = {
    status: dbStateCode === 1 ? 'ok' : 'degraded',
    service: 'GitInsight API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'none',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  const httpStatus = healthData.status === 'ok' ? 200 : 503;
  return res.status(httpStatus).json(healthData);
};
