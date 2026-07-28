---
description: Show a scannable QR code for opening Bible Clash on an iPhone or iPad
argument-hint: "[--local [port]] [--big] [--invert] [url or text]"
allowed-tools: Bash(node .claude/scripts/qr.js:*)
---

Alias for `/mobile`. Follow the instructions in `.claude/commands/mobile.md`
exactly, running:

```
node .claude/scripts/qr.js $ARGUMENTS
```

Bible Clash is a web app rather than a native app, so there is nothing to install
from the App Store: point the iOS Camera app at the code and open the link. If the
user wants a home screen icon, tell them to use Share → Add to Home Screen in
Safari.
