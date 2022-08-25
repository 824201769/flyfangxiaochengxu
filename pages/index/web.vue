<template>
  <view><web-view :src="httpurl"></web-view></view>
</template>

<script>
export default {
  name: 'viewPages',
  data() {
    return {
      httpurl: '',
    };
  },
  onLoad() {
    this.httpurl = uni.getStorageSync('url');
  },
};
</script>

<style scoped lang="scss"></style>
