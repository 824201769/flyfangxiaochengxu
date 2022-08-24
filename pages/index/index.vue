<template>
  <view>
    <view id="headinga">
      <view class="banner">
        <u-swiper radius="0" height="350rpx" :list="list1" @click="click"></u-swiper>
      </view>
    </view>

    <view class="left" style="margin: 0 15rpx;">
      <view class="left-sw" v-if="prodlist.length >= 1">
        <swiper
          :duration="500"
          :vertical="true"
          :circular="true"
          :display-multiple-items="prodlist.length"
          :style="'height:' + hh + 'px;width:150rpx'"
          :current-item-id="navScroll"
        >
          <swiper-item v-for="(item, index) in navList" :key="index" class="" :item-id="item.navId">
            <view
              class="itemlabel"
              :style="
                navNow == item.navId
                  ? 'background-color:#fff;border-left: 8rpx solid rgb(90, 196, 70);'
                  : 'background-color: #f4f4f4;'
              "
              @click="onNav(item, item.navId)"
            >
              {{ item.label }}
            </view>
          </swiper-item>
        </swiper>
      </view>

      <scroll-view
        :scroll-y="true"
        :scroll-with-animation="true"
        :enable-back-to-top="true"
        :style="'height:' + hh + 'px'"
        :scroll-into-view="scrollintoview"
        @scroll="myonPageScroll"
      >
        <view
          v-for="(item, index) in mainList"
          :key="index"
          :id="item.navId"
          :data-nav-id="item.navId"
          :data-nav-scroll-id="item.navScrollId"
          class="trip main-item"
          style=""
        >
          <view class="main-card" v-for="(items, indexss) in item.list" :key="indexss">
            <view class="main-card-label">{{ item.label }}</view>
            <view class="flex row-between" style="margin-top: 10rpx;" @click="topath(items)">
              <view class="images"><image :src="items.image" class="images" mode=""></image></view>
              <view
                class=" flex row-left col-top flex-col row-between"
                style="margin-left: 20rpx;height: 180rpx;width: 340rpx;"
              >
                <view class="u-line-1" style="font-size: 36rpx;">{{ items.label }}</view>
                <u-tag
                  :text="items.mianji"
                  size="mini"
                  borderColor="rgb(239,239,239)"
                  bgColor="rgb(239,239,239)"
                  color="rgb(153,153,153)"
                ></u-tag>
                <view class="flex row-between">
                  <view class="price u-error">
                    <text style="font-size: 40rpx;font-weight: bold;">{{ items.price }}</text>
                    <text style="font-size: 20rpx;">/元m²</text>
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
import data from '@/data.js';
export default {
  data() {
    return {
      list1: [
        'https://www.flyfang.cn/xiaochengxu/banner/1.png',
        'https://www.flyfang.cn/xiaochengxu/banner/2.png',
      ],
      list_data_right: [],
      list_data_left: [],
      list: [],
      tabCur: 0,
      mainCur: 0,
      verticalNavTop: 0,
      load: true,
      heightleft: 100,
      hh: 0,
      scrolltop: 0,
      scrollintoview: '',
      mainList: [],
      navList: [],
      navCount: 0,
      navNow: 0,
      vue_all_list: [],
      my_hua_dong_num: 0,
      navScroll: '',
      prodlist: [],
    };
  },

  onLoad() {
    let that = this;
    uni.$u.http.get('/get').then(res => {
      that.prodlist = res;
      that.list_data_left_api();
      let list = [{}];
      for (let i = 0; i < 26; i++) {
        list[i] = {};
        list[i].name = String.fromCharCode(65 + i);
        list[i].id = i;
      }
      that.list = list;
      that.listCur = list[0];
    });
  },
  onReady() {
    this._onReadyApi();
    uni.hideLoading();
  },
  methods: {
    click() {
      uni.navigateTo({
        url: '/pages/index/web?url=https://www.flyfang.cn/xiaochengxu/index.html',
      });
    },
    topath(item) {
      uni.navigateTo({
        url: '/pages/index/web?url=' + item.url,
      });
    },
    myonPageScroll(e) {
      this.my_hua_dong_num = Math.round(e.detail.scrollTop).toString();

      var num = e.currentTarget.offsetTop + e.detail.scrollTop;

      var ww = this.vue_all_list.find(v => v.top >= num);

      if (e.detail.scrollTop <= 70) {
        this.navNow = this.navList[0].navId;
      } else {
        this.navNow = ww.id;
      }

      if (ww.dataset.navScrollId) {
        this.navScroll = ww.dataset.navScrollId;
      } else {
        this.navScroll = this.navNow;
      }
    },
    TabSelect(e) {
      this.tabCur = e.currentTarget.dataset.id;
      this.mainCur = e.currentTarget.dataset.id;
      this.verticalNavTop = (e.currentTarget.dataset.id - 1) * 50;
    },
    VerticalMain(e) {
      // #ifdef MP-ALIPAY
      return false; //支付宝小程序暂时不支持双向联动
      // #endif
      let that = this;
      let tabHeight = 0;
      if (this.load) {
        for (let i = 0; i < this.list.length; i++) {
          let view = uni.createSelectorQuery().select('#main-' + this.list[i].id);
          view
            .fields(
              {
                size: true,
              },
              data => {
                this.list[i].top = tabHeight;
                tabHeight = tabHeight + data.height;
                this.list[i].bottom = tabHeight;
              },
            )
            .exec();
        }
        this.load = false;
      }
      let scrollTop = e.detail.scrollTop + 10;
      for (let i = 0; i < this.list.length; i++) {
        if (scrollTop > this.list[i].top && scrollTop < this.list[i].bottom) {
          this.verticalNavTop = (this.list[i].id - 1) * 50;
          this.tabCur = this.list[i].id;
          return false;
        }
      }
    },

    list_data_left_api() {
      var that = this;
      //mainList
      var mainList = [];
      var navList = [];
      // navList
      var list_data_left = [];
      var navScrollId = '';

      let prevNav = '';

      var i = 0;
      for (i; i < this.prodlist.length; i++) {
        const mainId = 'main-' + i;
        const navId = 'nav-' + i;
        const tId = this.prodlist[i].label;

        if (!prevNav) {
          prevNav = navId;
        }

        mainList.push({
          label: tId,
          id: mainId,
          navId: navId,
          navScrollId: prevNav,
          list: this.prodlist[i].list,
        });

        navList.push({
          navId: navId,
          mainId: mainId,
          label: tId,
        });

        prevNav = navId;
      }

      this.mainList = mainList;
      this.navList = navList;
      // this.list_data_left = list_data_left

      this.navNow = this.navList[0].navId;

      setTimeout(function() {
        wx.createSelectorQuery()
          .selectAll('.main-item')
          .fields({
            // id:true,
            id: true,
            dataset: true,
            rect: true,
          })
          .exec(res => {
            that.vue_all_list = res[0];
          });
      }, 300);
    },

    list_data_right_api() {
      var list_data_right = [];

      var i = 0;
      for (i; i < 100; i++) {
        list_data_right.push({
          id: (10000 + i).toString(),
          start: '呵呵',
        });
      }

      this.list_data_right = list_data_right;
    },
    onNav(e, kk) {
      var value = e.navId;

      if (e) {
        this.scrollintoview = value;

        this.navNow = kk;
      }
    },
    _onReadyApi() {
      var windowHeight = uni.getSystemInfoSync().windowHeight;

      var that = this;
      uni
        .createSelectorQuery()
        .select('#headinga')
        .boundingClientRect(res => {
          that.hh = windowHeight - res.height;

          that.navCount = Math.round(that.hh / 50);
        })
        .exec();
    },
  },
};
</script>

<style>
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
/* .aaaa{ */

/* } */
.fixed {
  position: fixed;
  z-index: 99;
}

.VerticalNav.nav {
  width: 200upx;
  white-space: initial;
}

.VerticalNav.nav .cu-item {
  width: 100%;
  text-align: center;
  background-color: #fff;
  margin: 0;
  border: none;
  height: 50px;
  position: relative;
}

.VerticalNav.nav .cu-item.cur {
  background-color: #f1f1f1;
}

.VerticalNav.nav .cu-item.cur::after {
  content: '';
  width: 8upx;
  height: 30upx;
  border-radius: 10upx 0 0 10upx;
  position: absolute;
  background-color: currentColor;
  top: 0;
  right: 0upx;
  bottom: 0;
  margin: auto;
}

.VerticalBox {
  display: flex;
}

.VerticalMain {
  background-color: #f1f1f1;
  flex: 1;
}
</style>
