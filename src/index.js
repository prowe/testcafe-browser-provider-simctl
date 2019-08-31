const shell = require('shelljs');
const util = require('util');

exports.default = {
    // Multiple browsers support
    isMultiBrowser: true,

    devicesById: {},

    // Required - must be implemented
    // Browser control
    async openBrowser (id, pageUrl, browserName) {
        const device = this.devicesById[id] = this.getFlatDevices()
            .find((d) => d.providerString === browserName);

        if (!device)
            throw new Error('Device not found: ' + browserName);

        console.log('launching device', device);

        if (device.state !== 'Booted') {
            // no need to launch the emulator, it is already running
            console.log('Booting device ', device.udid);
            const bootResult = shell.exec(`xcrun simctl boot "${device.udid}"`, { silent: true });

            if (bootResult.code !== 0) {
                throw new Error(`Unable to boot devices. Exited: ${bootResult.code}: ${bootResult.stdout} ${bootResult.stderr}`);
            }
        }

        const launchCommand = shell.exec(`xcrun simctl openurl "${device.udid}" "${pageUrl}"`, { silent: true });

        if (launchCommand.code !== 0) {
            throw new Error(`Unable to launch URL. Exited: ${launchCommand.code}: ${launchCommand.stdout} ${launchCommand.stderr}`);
        }
    },

    async closeBrowser (id) {
        const device = this.devicesById[id];

        console.log('stopping: ', device);

        shell.exec(`xcrun simctl shutdown "${device.udid}"`, { silent: true });
    },

    // Optional - implement methods you need, remove other methods
    // Initialization
    async init () {
        return;
    },

    async dispose () {
        return;
    },

    getFlatDevices() {
        const listResult = shell.exec(util.format('xcrun simctl list -j'), { silent: true });

        if (listResult.code !== 0)
            throw new Error(`Unable to list devices. Exited: ${listResult.code}: ${listResult.stdout}`);

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

    // Browser names handling
    async getBrowserList () {
        return this.getFlatDevices()
            .map((device) => device.providerString);
    },

    async isValidBrowserName (/* browserName */) {
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
