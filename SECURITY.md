# Security policy

The current `1.0.x` line receives security fixes while it is supported.

Please report a suspected vulnerability privately through the repository's
GitHub Security Advisory form. Include the affected version, runtime, a small
reproducer, impact assessment, and any suggested mitigation. Do not include
sensitive images or publish an exploit in a public issue.

Maintainers will acknowledge a complete report, reproduce it, assess affected
versions, and coordinate a fix and disclosure where warranted. No response or
fix deadline is guaranteed. General malformed-input bugs without sensitive
impact may be reported through the ordinary issue tracker.

The validation guarantee is limited to PNG chunk framing, length bounds, CRC,
`IHDR` order, and `IEND` termination. This package is not a full PNG decoder
and does not validate image semantics.
