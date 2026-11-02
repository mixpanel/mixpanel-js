# Hierarchical groups demo

A page of buttons that exercise the hierarchical groups API on a named `hg` instance, using the
library built from this repo.

```sh
npm run build                 # writes build/mixpanel.js
python3 -m http.server 8000   # from the repo root
```

Open http://localhost:8000/examples/hierarchical-groups/ and filter the browser console on
`HGDemo`. Each button logs `===== <title> =====`, then makes its call; `debug: true` logs the
library's warnings and dropped calls, and `batch_requests: false` sends each call's request right
away so it shows up on its own in the network tab.
