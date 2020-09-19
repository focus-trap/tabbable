---
"tabbable": patch
---

Replace `prepublishOnly` script with `prepare` script. This has the added benefit of running automatically when installing the package from GitHub (as supported by NPM) where the published `./dist` directory is not automatically included.
