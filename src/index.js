const shell = require('shelljs');

exports.default = {
    isMultiBrowser: true,
    devicesById: {},

    async openBrowser (id, pageUrl, browserName) {
        const device = this.devicesById[id] = this.getFlatDevices()
            .find((d) => d.providerString === browserName);

        if (!device) {
            throw new Error('Device not found: ' + browserName);
        }

        if (device.state !== 'Booted') {
            console.log(`Device is in ${device.state} status. Booting ${device.udid}`);
            const bootResult = shell.exec(`xcrun simctl boot "${device.udid}"`, { silent: true });

            if (bootResult.code !== 0) {
                throw new Error(`Unable to boot devices. Exited: ${bootResult.code}: ${bootResult.stdout} ${bootResult.stderr}`);
            }
        }
        console.log('Device Booted');

        const launchCommand = shell.exec(`xcrun simctl openurl "${device.udid}" "${pageUrl}"`, { silent: true });

        if (launchCommand.code !== 0) {
            throw new Error(`Unable to launch URL. Exited: ${launchCommand.code}: ${launchCommand.stdout} ${launchCommand.stderr}`);
        }
        console.log('Browser launched')
    },

    async closeBrowser (id) {
        const device = this.devicesById[id];

        console.log('stopping: ', device);

        shell.exec(`xcrun simctl shutdown "${device.udid}"`, { silent: true });
    },

    async init () {
        return;
    },

    async dispose () {
        return;
    },

    getFlatDevices() {
        const listResult = shell.exec('xcrun simctl list -j', { silent: true });

        if (listResult.code !== 0) {
            throw new Error(`Unable to list devices. Exited: ${listResult.code}: ${listResult.stdout}`);
        }

        const parsedResults = JSON.parse(listResult.stdout);

        const iOSVersionRegex = /com.apple.CoreSimulator.SimRuntime.iOS-(.*)/;

        return Object.entries(parsedResults.devices)
            .filter(([iosVersionString]) => iOSVersionRegex.test(iosVersionString))
            .map(([iosVersionString, devices]) => {
                const matches = iOSVersionRegex.exec(iosVersionString);

                return devices
                    .filter(device => device.isAvailable)
                    .map(device => ({
                        ...device,
                        iosVersion: matches[1],
                        providerString: `${device.name}:${matches[1]}`
                    }));
            })
            .reduce((arr, item) => [...arr, ...item], []);
    },

    async getBrowserList () {
        return this.getFlatDevices()
            .map((device) => device.providerString);
    },

    async isValidBrowserName (name) {
        // const browsers = await this.getBrowserList();
        // return browsers.find(name);
        // TODO: Fix me
        return true;
    },

    // Extra methods
    async resizeWindow (/* id, width, height, currentWidth, currentHeight */) {
        this.reportWarning('The window resize functionality is not supported by the "simctl" browser provider.');
    },

    async takeScreenshot (/* id, screenshotPath, pageWidth, pageHeight */) {
        this.reportWarning('The screenshot functionality is not supported by the "simctl" browser provider.');
    }
};

module.exports = exports['default'];
