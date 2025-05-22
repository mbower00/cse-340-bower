async function triggerError(req, res, next) {
  // using code from https://rollbar.com/blog/handling-node-js-exceptions/#
  throw new Error("An error was triggered");
}

module.exports = { triggerError };
