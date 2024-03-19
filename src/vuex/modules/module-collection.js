import { forEach } from '../util';

export default class ModuleCollection {
  constructor(options) {
    // 注册模块  递归注册 根模块 
    this.register([], options);
  }
  register(path, rootModule) {  //类似ast语法树
    debugger
    let newModule = {
      _raw: rootModule,
      _children: {},
      state: rootModule.state
    }
    if (path.length === 0) {
      this.root = newModule;
    } else {  // [b,c]
      let parent = path.slice(0, -1).reduce((memo, current) => {
        return memo._children[current]
      }, this.root);
      parent._children[path[path.length - 1]] = newModule;
    }
    if (rootModule.modules) { //如果有modules 说明有子模块
      forEach(rootModule.modules, (module, moduleName) => { // [b,c]
        this.register([...path, moduleName], module);
      })
    }
  }
}

// 格式化树结构
// this.root = {
//   _raw: xxx,
//   _children: {
//     a: {
//       _raw: xxx,
//       state: a.state
//     },
//     b: {
//       _raw: xxx,
//       _children: {},
//       state: b.state

//     }
//   },
//   state: xxx.state
// }