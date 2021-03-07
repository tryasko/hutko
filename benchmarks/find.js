var benchDb = "workspace/find.bench.db",
  async = require("async"),
  ExecTime = require("exec-time"),
  profiler = new ExecTime("FIND BENCH"),
  commonUtilities = require("./commonUtilities"),
  config = commonUtilities.getConfiguration(benchDb),
  d = config.d,
  n = config.n;

async.waterfall(
  [
    async.apply(commonUtilities.prepareDb, benchDb),
    function (cb) {
      d.loadDatabase(function (err) {
        if (err) {
          return cb(err);
        }
        if (config.program.withIndex) {
          d.ensureIndex({ fieldName: "docNumber" });
        }
        cb();
      });
    },
    function (cb) {
      profiler.beginProfiling();
      return cb();
    },
    async.apply(commonUtilities.insertDocs, d, n, profiler),
    async.apply(commonUtilities.findDocs, d, n, profiler),
  ],
  function (err) {
    profiler.step("Benchmark finished");

    if (err) {
      return console.log("An error was encountered: ", err);
    }
  }
);
