# Setapp lib Node.JS plugin

The only development dependency of this project is [Node.js](https://nodejs.org), so make sure you have it installed.

## Prerequisites

- Download Setapp Library archive at the top of the Add New Version/Edit Version page (`libSetapp<AppName>.zip`) in [vendor account](https://developer.setapp.com).

- Unzip this archive to the root of your project to folder `libSetapp`.

## Build process

1. Add our node package to your dependencies
    ##### package.json
    ```diff
    {
      ...
      "dependencies": {
        ...
    +   "setapp-lib-nodejs": "file:../NodeWrapper"
      },
      ...
    }
    ```
1. Add folder to config
    ##### package.json
    ```diff
    {
      ...
    + "setapp": {
    +   "modulePath": "./libSetapp"
    +  },
      ...
    }
    ```
1. To rebuild the native module to the currently installed Electron version you should add `electron-rebuild` dev dependency and `postinstall` script hook.
    ##### package.json
    ```diff
    {
      "devDependencies": {
    +   "electron-rebuild": "^2.3.4",
        ...
      },
      ...
      "scripts": {
        "start": "electron .",
        "build": "electron-builder --mac",
    +   "postinstall": "electron-rebuild"
      },
      ...
    }
    ```
1. Use `setapp` package in your Electron app project ([documentation](https://docs.setapp.com/docs/library-integration)):
    ##### main.js
    ```js
    const {app, BrowserWindow} = require('electron');
    const setapp = require('setapp-lib-nodejs');

    ...
    ```

## Add arm64 support (Apple Silicon, M1 chip)
You will need at least `11.0.1` version of the `electron`. And at least `22.10.4` version of the `electron-builder`.
> ⚠️ As of Jan 26, 2021, the `electron-builder` supports building only in the [latest beta release 22.10.4](https://github.com/electron-userland/electron-builder/releases/tag/v22.10.4).
But even there, there is a bug with [building universal binary](https://github.com/electron-userland/electron-builder/pull/5481#issuecomment-749875793) ([and here](https://github.com/electron-userland/electron-builder/issues/5547)). So now we need to add some extra dependencies to fix all the things.
1. Bump the `electron` version to `11.0.0` and the `electron-builder` version to `^22.10.4`
    ##### package.json
    ```diff
    {
      ...
      "dependencies": {
    -   "electron": "^10.0.0",
    -   "electron-builder": "^22.9.1",
    +   "electron": "^11.0.1",
    +   "electron-builder": "^22.10.4",
        ...
      },
      ...
    }
    ```
1. Add `patch-package` & `postinstall-postinstall` dev dependencies
    ##### package.json
    ```diff
    {
      ...
      "devDependencies": {
    +   "patch-package": "^6.2.2",
        ...
      },
      ...
    }
    ```
1. Create a `patches` folder in your package root dir
1. Add `app-builder-lib+22.10.4.patch` to the `patches` folder with the following content
    ##### app-builder-lib+22.10.4.patch
    ```
    diff --git a/node_modules/app-builder-lib/out/platformPackager.js b/node_modules/app-builder-lib/out/platformPackager.js
    index 675e461..e018994 100644
    --- a/node_modules/app-builder-lib/out/platformPackager.js
    +++ b/node_modules/app-builder-lib/out/platformPackager.js
    @@ -409,9 +409,8 @@ class PlatformPackager {
           await framework.beforeCopyExtraFiles({
             packager: this,
             appOutDir,
    -        asarIntegrity: asarOptions == null ? null : await (0, _integrity().computeData)(resourcesPath, asarOptions.externalAllowed ? {
    -          externalAllowed: true
    -        } : null),
    +        // https://github.com/electron-userland/electron-builder/pull/5481#issuecomment-749875793
    +        asarIntegrity: null,
             platformName
           });
         }
    ```
1. Add `patch-package` step to the postinstall script
    ##### package.json
    ```diff
    {
      ...
      "scripts": {
        "start": "electron .",
        "build": "electron-builder --mac",
    -   "postinstall": "electron-rebuild"
    +   "postinstall": "patch-package; electron-rebuild"
      },
      ...
    }
    ```
1. Specify universal platform for the `electron-builder`
    ##### package.json
    ```diff
    {
      ...
      "scripts": {
        "start": "electron .",
    -    "build": "electron-builder --mac",
    +    "build": "electron-builder --mac --universal",
        "postinstall": "patch-package; electron-rebuild"
      },
      ...
    }
    ```
1. Install new dependencies
    ```sh
    yarn install
    ```
1. Build the universal binary
    ```
    yarn build
    ```
