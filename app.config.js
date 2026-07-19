const RELEASE_BUILD_PROPERTIES_PLUGIN = 'expo-build-properties';

function getPluginName(plugin) {
  if (typeof plugin === 'string') {
    return plugin;
  }

  if (Array.isArray(plugin)) {
    return plugin[0];
  }

  return undefined;
}

module.exports = ({ config }) => {
  const releaseOptimizationEnabled =
    process.env.ENABLE_ANDROID_RELEASE_OPTIMIZATION === 'true';

  const plugins = Array.isArray(config.plugins)
    ? config.plugins.filter(
        (plugin) => getPluginName(plugin) !== RELEASE_BUILD_PROPERTIES_PLUGIN,
      )
    : [];

  if (releaseOptimizationEnabled) {
    plugins.push([
      RELEASE_BUILD_PROPERTIES_PLUGIN,
      {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ]);
  }

  return {
    ...config,
    plugins,
  };
};
