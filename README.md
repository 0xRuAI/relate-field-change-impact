# Field Change Impact
A private prototype for Relate by Neo4j. All examples are synthetic. No service, login, or production data is needed.

## Run
Use Node.js 22 and npm. From this folder:
```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run demo
```

The demo starts the official Relate engine in memory. It changes no data outside this process. It asks which downstream assets depend on the hypothetical trades.fee field. It returns the daily PnL calculation, fee-alert task and weekly report, with the intermediate step for the weekly report. It does not include the market coverage report.

Run `npm run demo:paths` to see the second synthetic graph, where the same report can be reached through two distinct paths and a loop returns to the input. Each affected asset is listed once; both non-cyclic paths are shown. Traversal is limited to eight hops in this prototype.

