# Kidmath Release Notes

This file tracks released versions and the changes included in each release. Update this file each time a new version is published.

## Unreleased

Work completed after `v1.0.0` and pending the next release:

- Add versioned `localStorage` persistence with DB migration support.
- Build project and include `dist/` assets for Netlify deployment.
- Add copyright notice to `README.md`.
- Add `README.md` with clone, run, build, and deploy instructions.
- Add `PROMPTS.md` summarizing project prompt history and instructions.
- Replace app icons with provided image.

## v1.0.0

Released version: 2026-06-21

Key changes:

- Migrate persistence to centralized `loadDB()` / `saveDB()` wrappers.
- Add a dashboard with filters and comparison charts across accounts.
- Add versioned Grade 3 topic selection and practice/exam support.
- Add Vietnamese word problem generators and full multiplication/division tables.
- Add user authentication, settings, history, and simple progress tracking.
- Add confetti and sound feedback for correct/incorrect answers.
- Add `Netlify` deployment-ready build process and `dist/` packaging support.

> Note: continue to update this file before each future release with the final changelog items.
