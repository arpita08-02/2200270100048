const logger = {
  log: (action, payload = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      payload
    };
    console.log('[LOGGER]', logEntry);
    // In a real app, you'd send this to a logging service
  }
};

export default logger;