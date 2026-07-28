---
description: Show a scannable QR code for opening Bible Clash on a phone
argument-hint: "[--local [port]] [--big] [--invert] [url or text]"
allowed-tools: Bash(node .claude/scripts/qr.js:*)
---

Display a QR code the user can scan with their phone camera to open Bible Clash.

Run the generator with the user's arguments (which may be empty):

```
node .claude/scripts/qr.js $ARGUMENTS
```

Then reply with **only**:

1. The QR code exactly as printed, character for character, inside a fenced code
   block. Do not re-flow it, re-indent it, trim trailing spaces, or substitute
   characters — the block characters and the blank quiet-zone border are all part
   of the code, and altering them can stop it from scanning.
2. The target URL on its own line underneath, so the user can type it if scanning
   fails.

Keep any other commentary to a single short sentence. If the command fails, show
the error and the target URL instead of inventing a QR code.

Notes on the flags, for when the user asks or the situation calls for it:

- No arguments encodes the deployed site, `https://bigkidnclass.github.io/Bible-clash-/`.
- `--local [port]` encodes `http://<this-machine's-LAN-IP>:<port>/` (default port
  8000) for testing an unpublished change on a real phone. The user still has to
  serve this directory themselves, e.g. `python3 -m http.server 8000`, and the
  phone has to be on the same network.
- `--invert` swaps light and dark. Suggest it if the user says the code will not
  scan; some scanners dislike the light-on-dark rendering a dark terminal produces.
- `--big` draws each module as two characters instead of using half blocks. It is
  easier for a struggling camera to read, but it is twice as wide and will not fit
  an 80-column terminal — a wrapped QR code cannot be scanned at all.
- Any other argument is encoded verbatim, so the command doubles as a general
  purpose QR generator for a verse link or a share URL.
