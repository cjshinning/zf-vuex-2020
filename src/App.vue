<template>
  <div id="app">
    <!-- this.$store的this在模板中可以省略 -->
    年龄是：{{ this.$store.state.a }}<br />
    计算年龄是：{{ $store.getters.getAge }}<br />
    <button @click="$store.state.a += 10">修改状态</button>

    <!-- <button @click="$store.commit('changeAge', 5)">同步更新状态</button> -->
    <!-- <button @click="$store.dispatch('changeAge', 10)">异步更新状态</button> -->
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this);
  }
}
</script>