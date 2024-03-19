<template>
  <div id="app">
    <!-- this.$store的this在模板中可以省略 -->
    <!-- 年龄是：{{ this.$store.state.age }}<br />
    计算年龄是：{{ $store.getters.getAge }}<br />

    <button @click="$store.commit('b/changeAge', 5)">同步更新状态</button>
    <button @click="$store.dispatch('changeAge', 10)">异步更新状态</button>

    {{ $store.state.a.c }}
    {{ $store.state.b.d }}
    {{ $store.getters.getD }} -->
  </div>
</template>

<script>
export default {
  mounted() {
  }
}
</script>