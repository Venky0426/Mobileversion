const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
<<<<<<< HEAD
const path = require("path");

const config = getDefaultConfig(__dirname);

if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

// Ensure custom package mappings resolve smoothly across Metro
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@firebase/app" || moduleName === "firebase/app") {
    return {
      filePath: path.resolve(__dirname, "node_modules/@firebase/app/dist/index.cjs.js"),
      type: "sourceFile",
    };
  }
  if (moduleName === "react-native/asset-registry" || moduleName === "@react-native/assets-registry") {
    return {
      filePath: path.resolve(__dirname, "node_modules/react-native/src/asset-registry.js"),
      type: "sourceFile",
    };
  }
  if (moduleName === "react-native/react-private-interface") {
    return {
      filePath: path.resolve(__dirname, "node_modules/react-native/src/react-private-interface.js"),
      type: "sourceFile",
    };
  }
  return (defaultResolveRequest || context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
=======

const config = getDefaultConfig(__dirname);

// Fix Firebase v10 "Component auth has not been registered yet" error.
// Metro resolves Firebase ESM browser bundles by default (via package exports),
// which are NOT pre-configured for React Native. Disabling this forces Metro
// to use the CJS 'main' entry which works correctly in React Native.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./src/global.css" });

>>>>>>> 47463a7a08d38f17ffd1b4b51c6b0edcb0c65697
