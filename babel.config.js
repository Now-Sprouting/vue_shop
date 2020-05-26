// 项目发布时需要用的的babel插件
const prodPlugins = []
if (process.env.NODE_EVN === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时候的插件数组
    ...prodPlugins,
    // 'transform-remove-console'
    // 路由懒加载
    "@babel/plugin-syntax-dynamic-import"    
  ]
}
