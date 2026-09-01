# Third-party licenses

The production package has zero runtime, optional, peer, and bundled
dependencies. Its installed production closure is one MIT-licensed root node.

## png-chunks-extract@1.0.0

The public function contract, valid chunk behavior, selected historical error
wording, and compatibility tests derive from `png-chunks-extract@1.0.0`,
Copyright (c) 2015 Hugh Kennedy, MIT. The applicable notice and permission
terms are preserved in `LICENSE`.

The continuation independently implements complete-envelope bounds checks,
the PNG length ceiling, `IEND` validation, conditional module entries, and
declarations.

## CRC implementation

No crc-32 source code is included in the production artifact. The IEEE CRC-32
routine in `lib/crc32.js` was independently written from the public polynomial
definition and is verified against the canonical `123456789` check value.
The exact upstream package and current `crc-32` package appear only as pinned
development fixtures for differential verification; neither is in the packed
production graph.
