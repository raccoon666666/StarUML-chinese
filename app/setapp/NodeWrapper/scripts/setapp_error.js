const MESSAGES = {
  noObjectConfig: () => 'Setapp config should contain *only object*',
  noConfig: () => 'Create Setapp config in *package.json*',
  noBinary: () => 'There is no Setapp binary. Please, check configuration and reinstall node modules or run `npx electron-rebuild --force`',
  emptyConfig: () => 'Setapp config must *not be empty*',
  pathNotString: () => 'The *modulePath* in Setapp config must be *a string*',
}

const ADD_CONFIG_EXAMPLE = {
  noConfig: true,
  emptyConfig: true,
  noObjectConfig: true,
  pathNotString: true
}

class SetappError extends Error {
  constructor (type, ...args) {
    super(MESSAGES[type](...args))

    this.name = 'SetappError';

    if (ADD_CONFIG_EXAMPLE[type]) {
      this.example =
        '  "setapp": {\n' +
        '    "modulePath": "./setapp_libs",\n' +
        '  }\n'
    }
  }
}

module.exports = SetappError;
