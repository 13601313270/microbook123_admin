const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    // 修复 fork-ts-checker + @babel/code-frame 在 Node v22 下正则回溯导致栈溢出
    config.plugin('fork-ts-checker').tap((args) => {
      if (args[0] && typeof args[0] === 'object') {
        args[0].formatter = 'basic' // 用 basic formatter，不调用 code-frame 做代码高亮
      }
      return args
    })
  }
})
