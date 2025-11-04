require('dotenv').config();

export default ({ config }) => {
  return {
    ...config,
    "name": "frontend",
    "slug": "frontend",
    "version": "1.0.0",
    "orientation": "landscape",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.anonymous.frontend"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.anonymous.frontend"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },

    extra: {
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
      API_TIMEOUT: process.env.API_TIMEOUT,
    }
  };
};