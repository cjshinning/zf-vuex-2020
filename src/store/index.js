import Vue from 'vue'
import Vuex from '../vuex'

// replaceState
// subscribe
// plugins

// 持久化插件
function persists(store) {
  let local = localStorage.getItem('VUEX:STATE');
  if (local) {
    store.replaceState(JSON.parse(local));
  }
  store.subscribe((mutation, state) => {
    console.log(state);
    // 只要频繁操作，就要考虑防抖和节流
    localStorage.setItem('VUEX:STATE', JSON.stringify(state));
  })
}

Vue.use(Vuex);
// 跨组件通信
let store = new Vuex.Store({ //内部会创建一个vue实例，通信用的
  plugins: [
    persists,
  ],
  state: {  //组件状态
    age: 10,
    a: 1
  },
  getters: {  //获取数据 计算属性 依赖的值变化后会重新执行
    getAge(state) { //如果返回的结果相同，就不会重新执行这个函数
      // 如果age属性不发生变化，就不会重新执行
      console.log('getAge执行')
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
    a: {
      namespaced: true,
      state: {
        c: 100
      },
      mutations: {
        changeAge(state, payload) {
          console.log('a 更新');
        }
      },
      modules: {
        e: {
          namespaced: true,
          state: {
            c: 100
          }
        }
      }
    },
    b: {
      namespaced: true,
      state: {
        d: 100
      },
      mutations: {
        changeAge(state, payload) {
          console.log('d 更新');
        }
      },
      modules: {
        c: {
          namespaced: true,
          state: {
            e: 500
          },
          mutations: {
            changeAge(state, payload) {
              console.log('b/c 更新');
            }
          }
        },
      }
    }
  }
})

store.registerModule(['e'], {
  state: {
    myAge: 100
  }
});

console.log(store);

export default store;

// 1.默认模块没有作用域问题
// 2.状态不要和模块的名字相同
// 3.计算属性 直接通过getter取值
// 4.如果增加namespaced:true 会将这个模块的数下 都封装到这个作用域下
// 5.默认会找当前模块上是否有namespace，并且将父级的namespace一起算上，做成命名空间