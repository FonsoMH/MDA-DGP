module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@expo|expo(nent)?|@unimodules)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
