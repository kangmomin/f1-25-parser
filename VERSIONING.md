# Versioning Policy

This repository follows semantic versioning with tags:

- tag format: `vMAJOR.MINOR.PATCH`
- current baseline: `v0.3.0`
- default branch: `main`

## Rules While Still in `0.x`

Until `v1.0.0`, this repository treats meaningful model or visibility changes as `MINOR`.

- `PATCH`: bug fixes, docs-only fixes, build-only fixes, or compatible cleanup
- `MINOR`: new fields, new helper APIs, new visibility modes, or structural changes that keep the library direction but expand behavior
- `MAJOR`: import/package breaks, removed public APIs, renamed core fields, or incompatible serialization changes

## Tag-Only Releases

This repository uses git tags as releases.

Release flow:

1. merge to `main`
2. run local verification
3. create tag: `git tag vX.Y.Z`
4. push tag: `git push origin vX.Y.Z`

Pushing the tag is the release. A separate GitHub Release is not required.

## Examples

- docs-only update: `v0.3.1`
- parser visibility helper expansion: `v0.4.0`
- breaking field rename: `v1.0.0`
