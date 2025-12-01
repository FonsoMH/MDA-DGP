module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node', // opcional pero a veces ayuda
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-clone-referenced-element|expo(nent)?|@expo(nent)?/.*)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
