<template>
  <view><web-view :src="data.url"></web-view></view>
</template>

<script>
export default {
  name: 'viewPages',
  data() {
    return {
      data: '',
      title: '',
    };
  },
  onLoad(opt) {
    this.title = opt.label;
    if (opt.prodId) {
      // #ifdef MP-TOUTIAO
      uni.$u.http.get(`/querydy?title=${opt.label}&prodId=${opt.prodId}`).then(res => {
        this.data = res;
      });
      // #endif
      // #ifdef MP-WEIXIN
      uni.$u.http.get(`/query?title=${opt.label}&prodId=${opt.prodId}`).then(res => {
        this.data = res;
      });
      // #endif
    } else {
      this.data = uni.getStorageSync('item');
    }
  },
  onShareAppMessage() {
    return {
      title: this.data.label,
      imageUrl: this.data.image,
      path: '/pages/index/web?label=' + this.title + '&prodId=' + this.data.id,
      desc: '徐州飞房网，一个相当好用的购房神器',
    };
  },
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.label,
      imageUrl: this.data.image,
      path: '/pages/index/index',
    };
  },
};
</script>

<style scoped lang="scss"></style>
