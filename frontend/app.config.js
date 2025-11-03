import 'dotenv/config';

export default ({ config }) => {
  const ENV = process.env.NODE_ENV || 'development';
  const envFile =
    ENV === 'production' ? '.env.production' : '.env.development';

  // Cargar el .env correcto
  require('dotenv').config({ path: envFile });

  console.log(`🔧 Using environment: ${ENV} (${envFile})`);
  console.log('🌍 API Base URL:', process.env.REACT_APP_API_BASE_URL);

  return {
    ...config,
    name: "frontend",
    slug: "frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.frontend"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.frontend"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    },
  };
};
