module.exports = (api) => {
  // Vérifier si l'API est en mode cache (par défaut: true)
  const isTest = api.env('test');
  api.cache.using(() => process.env.NODE_ENV);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        useBuiltIns: 'usage',
        corejs: 3,
        modules: isTest ? 'commonjs' : false,
        debug: false,
      },
    ],
  ];

  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime',
    'dynamic-import-node',
    'babel-plugin-transform-import-meta',
  ];

  return {
    presets,
    plugins,
    ignore: ['node_modules'],
    sourceMaps: 'inline',
    retainLines: true,
  };
};
