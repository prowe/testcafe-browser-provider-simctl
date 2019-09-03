const shell = require('shelljs');
const provider = require('./index.js');

jest.mock('shelljs');

describe('Brower provider', () => {

    it('should be set to multi browser', () => {
        expect(provider.isMultiBrowser).toEqual(true);
    });

    describe('getBrowserList', () => {
        it('should execute the browser list command', async () => {
            await provider.getBrowserList();

            expect(shell.exec).toHaveBeenCalledWith('xcrun simctl list -j', expect.anything());
        });

        it('should return the correct list of browsers if the command is successful', () => {

        });
    });
});