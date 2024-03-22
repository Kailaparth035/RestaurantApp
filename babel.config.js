module.exports = (api) => {
  const babelEnv = api.env();
  api.cache(true);
  const plugins = [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
      },
    ],
  ];
  if (babelEnv === "production") {
    plugins.push(["transform-remove-console"]);
  }
  return {
    presets: ["module:metro-react-native-babel-preset"],
    plugins,
  };
};
