<template>
  <view class="u-wrap">
    <view class="banner">
      <u-swiper radius="0" height="350rpx" :list="list1" @click="click"></u-swiper>
    </view>
    <view class="u-menu-wrap">
      <scroll-view
        scroll-y
        scroll-with-animation
        class="u-tab-view menu-scroll-view"
        style="background-color: #f6f6f6;"
        :scroll-top="scrollTop"
        :scroll-into-view="itemId"
      >
        <view
          v-for="(item, index) in tabbar"
          :key="index"
          class="u-tab-item"
          :class="[current == index ? 'u-tab-item-active' : '']"
          @tap.stop="swichMenu(index)"
        >
          <text class="u-line-1">{{ item.label }}</text>
        </view>
      </scroll-view>
      <scroll-view
        :scroll-top="scrollRightTop"
        scroll-y
        scroll-with-animation
        class="right-box"
        @scroll="rightScroll"
      >
        <view class="page-view">
          <view
            class="class-item"
            :id="'item' + index"
            v-for="(item, index) in tabbar"
            :key="index"
          >
            <view class="item-title">
              <text>{{ item.label }}</text>
            </view>

            <view v-for="(item1, index1) in item.list" :key="index1" style="margin-bottom: 40rpx;">
              <view class="flex row-between" style="margin-top: 10rpx;" @click="topath(item1)">
                <view class="images">
                  <image :src="item1.image" class="images" mode=""></image>
                </view>
                <view
                  class=" flex row-left col-top flex-col row-between"
                  style="margin-left: 20rpx;height: 180rpx;width: 340rpx;"
                >
                  <view class="u-line-1" style="font-size: 30rpx;">{{ item1.label }}</view>
                  <u-tag
                    :text="item1.mianji"
                    size="mini"
                    borderColor="rgb(239,239,239)"
                    bgColor="rgb(239,239,239)"
                    color="rgb(153,153,153)"
                  ></u-tag>
                  <view class="flex row-between">
                    <view class="price u-error">
                      <text style="font-size: 40rpx;font-weight: bold;">{{ item1.price }}</text>
                      <text style="font-size: 20rpx;">/元m²</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      list1: [
        'https://www.flyfang.cn/xiaochengxu/banner/1.png',
        'https://www.flyfang.cn/xiaochengxu/banner/2.png',
      ],
      scrollTop: 0, //tab标题的滚动条位置
      oldScrollTop: 0,
      current: 0, // 预设当前项的值
      menuHeight: 0, // 左边菜单的高度
      menuItemHeight: 0, // 左边菜单item的高度
      itemId: '', // 栏目右边scroll-view用于滚动的id
      tabbar: [],
      menuItemPos: [],
      arr: [],
      scrollRightTop: 0, // 右边栏目scroll-view的滚动条高度
      timer: null, // 定时器
    };
  },
  onLoad() {
    // #ifdef MP-TOUTIAO

    uni.$u.http.get('/douyin').then(res => {
      this.tabbar = res;
    });
    // #endif
    // #ifdef MP-WEIXIN
    uni.$u.http.get('/get').then(res => {
      this.tabbar = res;
    });
    // #endif
  },
  onReady() {
    this.getMenuItemTop();
  },
  methods: {
    click(index) {
      if (index == 0) {
        // #ifdef MP-TOUTIAO
        uni.setStorageSync('url', 'https://www.flyfang.cn/dyxiaochengxu/index1.html');
        // #endif
        // #ifdef MP-WEIXIN
        uni.setStorageSync('url', 'https://www.flyfang.cn/xiaochengxu/index1.html');
        // #endif
      } else {
        // #ifdef MP-TOUTIAO
        uni.setStorageSync('url', 'https://www.flyfang.cn/dyxiaochengxu/index2.html');
        // #endif
        // #ifdef MP-WEIXIN
        uni.setStorageSync('url', 'https://www.flyfang.cn/xiaochengxu/index2.html');
        // #endif
      }
      uni.navigateTo({
        url: '/pages/index/web',
      });
    },
    topath(item) {
      uni.setStorageSync('url', item.url);
      uni.navigateTo({
        url: '/pages/index/web',
      });
    },
    // 点击左边的栏目切换
    async swichMenu(index) {
      if (this.arr.length == 0) {
        await this.getMenuItemTop();
      }
      if (index == this.current) return;
      this.scrollRightTop = this.oldScrollTop;
      this.$nextTick(function() {
        this.scrollRightTop = this.arr[index];
        this.current = index;
        this.leftMenuStatus(index);
      });
    },
    // 获取一个目标元素的高度
    getElRect(elClass, dataVal) {
      new Promise((resolve, reject) => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select('.' + elClass)
          .fields(
            {
              size: true,
            },
            res => {
              // 如果节点尚未生成，res值为null，循环调用执行
              if (!res) {
                setTimeout(() => {
                  this.getElRect(elClass);
                }, 10);
                return;
              }
              this[dataVal] = res.height;
              resolve();
            },
          )
          .exec();
      });
    },
    // 观测元素相交状态
    async observer() {
      this.tabbar.map((val, index) => {
        let observer = uni.createIntersectionObserver(this);
        // 检测右边scroll-view的id为itemxx的元素与right-box的相交状态
        // 如果跟.right-box底部相交，就动态设置左边栏目的活动状态
        observer
          .relativeTo('.right-box', {
            top: 0,
          })
          .observe('#item' + index, res => {
            if (res.intersectionRatio > 0) {
              let id = res.id.substring(4);
              this.leftMenuStatus(id);
            }
          });
      });
    },
    // 设置左边菜单的滚动状态
    async leftMenuStatus(index) {
      this.current = index;
      // 如果为0，意味着尚未初始化
      if (this.menuHeight == 0 || this.menuItemHeight == 0) {
        await this.getElRect('menu-scroll-view', 'menuHeight');
        await this.getElRect('u-tab-item', 'menuItemHeight');
      }
      // 将菜单活动item垂直居中
      this.scrollTop = index * this.menuItemHeight + this.menuItemHeight / 2 - this.menuHeight / 2;
    },
    // 获取右边菜单每个item到顶部的距离
    getMenuItemTop() {
      new Promise(resolve => {
        let selectorQuery = uni.createSelectorQuery();
        selectorQuery
          .selectAll('.class-item')
          .boundingClientRect(rects => {
            // 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
            if (!rects.length) {
              setTimeout(() => {
                this.getMenuItemTop();
              }, 10);
              return;
            }
            rects.forEach(rect => {
              // 这里减去rects[0].top，是因为第一项顶部可能不是贴到导航栏(比如有个搜索框的情况)
              this.arr.push(rect.top - rects[0].top);
              resolve();
            });
          })
          .exec();
      });
    },
    // 右边菜单滚动
    async rightScroll(e) {
      this.oldScrollTop = e.detail.scrollTop;
      if (this.arr.length == 0) {
        await this.getMenuItemTop();
      }
      if (this.timer) return;
      if (!this.menuHeight) {
        await this.getElRect('menu-scroll-view', 'menuHeight');
      }
      setTimeout(() => {
        // 节流
        this.timer = null;
        // scrollHeight为右边菜单垂直中点位置
        let scrollHeight = e.detail.scrollTop + this.menuHeight / 2;
        for (let i = 0; i < this.arr.length; i++) {
          let height1 = this.arr[i];
          let height2 = this.arr[i + 1];
          // 如果不存在height2，意味着数据循环已经到了最后一个，设置左边菜单为最后一项即可
          if (!height2 || (scrollHeight >= height1 && scrollHeight < height2)) {
            this.leftMenuStatus(i);
            return;
          }
        }
      }, 10);
    },
  },
};
</script>

<style lang="scss" scoped>
.price {
  font-size: 28rpx;
}
.images {
  width: 180rpx;
  height: 180rpx;
  border-radius: 10rpx;
}
/* flex 横向 */
.flex {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  align-items: center;
}
/* flex 纵向 */
.flex-col {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
}
/* flex不换行 */
.flex-wrap {
  flex-wrap: wrap;
}
/* 垂直居中 */
.flex-nowrap {
  flex-wrap: nowrap;
}

/* 垂直居中 */
.col-center {
  align-items: center;
}

/* 顶部对齐 */
.col-top {
  align-items: flex-start;
}

/* 底部对齐 */
.col-bottom {
  align-items: flex-end;
}

/* 左边对齐 */
.row-left {
  justify-content: flex-start;
}

/* 水平居中 */
.row-center {
  justify-content: center;
}

/* 右边对齐 */
.row-right {
  justify-content: flex-end;
}

/* 水平两端对齐，项目之间的间隔都相等 */
.row-between {
  justify-content: space-between;
}

/* 水平每个项目两侧的间隔相等，所以项目之间的间隔比项目与父元素两边的间隔大一倍 */
.row-around {
  justify-content: space-around;
}

.left {
  background-color: #fff;
  display: flex;
}
.left-sw {
  background-color: #f4f4f4;
}
.banner {
  width: 100%;
  height: 370rpx;
}
.main-card-label {
  width: 100%;
  font-size: 26rpx;
  color: #303030;
  height: 50rpx;
  display: flex;
  align-items: center;
}
.main-card {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.main-item {
  margin-bottom: 10rpx;
  border-radius: 0rpx;
  border: 0rpx solid red;
  padding: 20rpx 30rpx 0 30rpx;
}
.itemlabel {
  width: 100%;
  height: 100rpx;
  height: 80rpx;
  line-height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #303030;
  font-size: 26rpx;
}
.banner {
  width: 100%;
  height: 370rpx;
}
.u-wrap {
  height: calc(100vh);
  /* #ifdef H5 */
  height: calc(100vh - var(--window-top));
  /* #endif */
  display: flex;
  flex-direction: column;
}

.u-search-box {
  padding: 18rpx 30rpx;
}

.u-menu-wrap {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-left: 20rpx;
}

.u-search-inner {
  background-color: rgb(234, 234, 234);
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  padding: 10rpx 16rpx;
}

.u-search-text {
  font-size: 26rpx;
  color: $u-tips-color;
  margin-left: 10rpx;
}

.u-tab-view {
  width: 200rpx;
  height: 100%;
}

.u-tab-item {
  height: 110rpx;
  background: #f6f6f6;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #444;
  font-weight: 400;
  line-height: 1;
}

.u-tab-item-active {
  position: relative;
  color: #000;
  font-size: 30rpx;
  font-weight: 600;
  background: #fff;
}

.u-tab-item-active::before {
  content: '';
  position: absolute;
  border-left: 4px solid $u-primary;
  height: 32rpx;
  left: 0;
  top: 39rpx;
}

.u-tab-view {
  height: 100%;
}

.right-box {
  background-color: rgb(250, 250, 250);
}

.page-view {
  padding: 16rpx;
}

.class-item {
  margin-bottom: 30rpx;
  background-color: #fff;
  padding: 16rpx;
  border-radius: 8rpx;
}

.class-item:last-child {
  min-height: 100vh;
}

.item-title {
  font-size: 28rpx;
  color: $u-main-color;
  font-weight: bold;
  margin-bottom: 50rpx;
}

.item-menu-name {
  font-weight: normal;
  font-size: 24rpx;
  color: $u-main-color;
}

.item-container {
  display: flex;
  flex-wrap: wrap;
}

.thumb-box {
  width: 33.333333%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 20rpx;
}

.item-menu-image {
  width: 120rpx;
  height: 120rpx;
}
</style>
