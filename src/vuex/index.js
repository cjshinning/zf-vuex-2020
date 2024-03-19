
import { Store, install } from './store';

export default {
  Store,
  install
}

export {
  Store,
  install
}

// 两只方式都可以 可以采用默认导入，也可以采用接口结构
// export 导出的是接口 供别人使用的接口 需要通过解构的方式去获取
// export default 导出具体的值
// import Vuex from 'vuex';
// import {Store} from 'vuex';