const applyMixin = (Vue) => {
  Vue.mixin({
    beforeCreate: vuexInit
  })
}

// 组件的创建过程 是先父后子
function vuexInit() {
  // vue-router 是把属性定义到了根实例上 所有组件都能拿到这个根，通过根实例取这个属性
  // vuex 给每个组件都定义一个$store属性，指向同一个人
  const options = this.$options;
  if (options.store) {
    // 根实例
    this.$store = options.store;
  } else if (options.parent && options.parent.$store) {
    // 子实例
    this.$store = options.parent.$store;
  }
}

export default applyMixin;