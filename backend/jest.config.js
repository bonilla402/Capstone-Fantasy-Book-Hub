module.exports = {
    testEnvironment: "node", // Ensures Jest runs in a Node.js environment
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Runs global setup for test DB
    verbose: true, // Enables detailed output during test runs
    forceExit: true, // Ensures Jest exits even if some async operations are still pending
    detectOpenHandles: true, // Helps detect unclosed database connections
};
