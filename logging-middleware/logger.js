// logging-middleware/Logger.js

/**
 * Logs events to the test server
 * @param {string} stack - "frontend" or "backend"
 * @param {string} level - "error", "warn", "info", "debug", "fatal"
 * @param {string} package - Module/component name
 * @param {string} message - Descriptive log message
 */
export const Log = async (stack, level, package, message) => {
  try {
    const logData = {
      stack,
      level,
      package,
      message,
      timestamp: new Date().toISOString(),
    };

    // Replace with actual test server API endpoint (provided by AffordMed)
    const LOG_API_URL = "https://test-server.affordmed.com/api/logs";

    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      console.error("Failed to send log:", await response.text());
    }
  } catch (error) {
    console.error("Logging failed:", error);
  }
};