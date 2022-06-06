"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseUpdater = void 0;
const fs = require("fs");
const path = require("path");
const AppUpdater_1 = require("./AppUpdater");
class BaseUpdater extends AppUpdater_1.AppUpdater {
    constructor(options, app) {
        super(options, app);
        this.quitAndInstallCalled = false;
        this.quitHandlerAdded = false;
    }
    quitAndInstall(isSilent = false, isForceRunAfter = false) {
        this._logger.info(`Install on explicit quitAndInstall`);
        const isInstalled = this.install(isSilent, isSilent ? isForceRunAfter : true);
        if (isInstalled) {
            setImmediate(() => {
                this.app.quit();
            });
        }
        else {
            this.quitAndInstallCalled = false;
        }
    }
    executeDownload(taskOptions) {
        return super.executeDownload({
            ...taskOptions,
            done: event => {
                this.dispatchUpdateDownloaded(event);
                this.addQuitHandler();
                return Promise.resolve();
            },
        });
    }
    // must be sync (because quit even handler is not async)
    install(isSilent, isForceRunAfter) {
        if (this.quitAndInstallCalled) {
            this._logger.warn("install call ignored: quitAndInstallCalled is set to true");
            return false;
        }
        const downloadedUpdateHelper = this.downloadedUpdateHelper;
        const installerPath = downloadedUpdateHelper == null ? null : downloadedUpdateHelper.file;
        const downloadedFileInfo = downloadedUpdateHelper == null ? null : downloadedUpdateHelper.downloadedFileInfo;
        if (installerPath == null || downloadedFileInfo == null) {
            this.dispatchError(new Error("No valid update available, can't quit and install"));
            return false;
        }
        // prevent calling several times
        this.quitAndInstallCalled = true;
        try {
            let installPathRequiresElevation = false;
            if (process.platform === "win32") {
                try {
                    const accessTestPath = path.join(path.dirname(process.execPath), `access-${Math.floor(Math.random() * 100)}.tmp`);
                    fs.writeFileSync(accessTestPath, " ");
                    fs.rmSync(accessTestPath);
                }
                catch (err) {
                    // Require admin rights if needed
                    installPathRequiresElevation = true;
                }
            }
            this._logger.info(`Install: isSilent: ${isSilent}, isForceRunAfter: ${isForceRunAfter}, installPathRequiresElevation: ${installPathRequiresElevation}`);
            return this.doInstall({
                installerPath,
                isSilent,
                isForceRunAfter,
                isAdminRightsRequired: installPathRequiresElevation || downloadedFileInfo.isAdminRightsRequired,
            });
        }
        catch (e) {
            this.dispatchError(e);
            return false;
        }
    }
    addQuitHandler() {
        if (this.quitHandlerAdded || !this.autoInstallOnAppQuit) {
            return;
        }
        this.quitHandlerAdded = true;
        this.app.onQuit(exitCode => {
            if (this.quitAndInstallCalled) {
                this._logger.info("Update installer has already been triggered. Quitting application.");
                return;
            }
            if (!this.autoInstallOnAppQuit) {
                this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
                return;
            }
            if (exitCode !== 0) {
                this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${exitCode}`);
                return;
            }
            this._logger.info("Auto install update on quit");
            this.install(true, false);
        });
    }
}
exports.BaseUpdater = BaseUpdater;
//# sourceMappingURL=BaseUpdater.js.map