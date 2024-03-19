import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// 跨组件通信
export default new Vuex.Store({ //内部会创建一个vue实例，通信用的
  state: {  //组件状态
    age: 10
  },
  getters: {  //获取数据 计算属性 依赖的值变化后会重新执行
    getAge(state) { //如果返回的结果相同，就不会重新执行这个函数
      // 如果age属性不发生变化，就不会重新执行
      return state.age + 18;
    }
  },
  mutations: {  //vue中的方法 唯一可以改状态的方法
    changeAge(state, payload) { //同步的
      state.age += payload;
    }
  },
  actions: {  //通过action中发起请求
    changeAge({ commit }) {
      setTimeout(() => {
        commit('changeAge', 10);
      }, 1000)
    }
  },
  modules: {
  }
})
