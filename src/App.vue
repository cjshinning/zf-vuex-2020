<template>
  <div id="app">
    <!-- this.$store的this在模板中可以省略 -->
    年龄是：{{ age }}<br />
    计算年龄是：{{ getAge }}<br />

    <button @click="$store.state.age += 10">点击</button>
    <button @click="changeAge(5)">同步更新状态</button>
    <button @click="$store.dispatch('changeAge', 10)">异步更新状态</button>

    {{ $store.state.a.c }}
    {{ $store.state.b.d }}
    {{ $store.getters.getD }}
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from './vuex';

export default {
  computed: {
    ...mapState(['age']),
    // age() {
    //   return this.$store.state.age;
    // }
    // getAge() {
    //   return this.$store.getters.getAge;
    // }
    ...mapGetters(['getAge'])
  },
  methods: {
    ...mapMutations(['changeAge'])
    // changeAge(payload){
    //   this.$store.commit('changeAge', payload);
    // }
  }
}
</script>