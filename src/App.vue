<template>
  <div>
    <v-header :seller="seller"></v-header>
    <div class="tab border-1px">
      <div class="tab-item">
        <a v-link="{path:'/goods'}">商品</a>
      </div>
      <div class="tab-item">
        <a v-link="{path:'/ratings'}">评论</a>
      </div>
      <div class="tab-item">
        <a v-link="{path:'/seller'}">商家</a>
      </div>
    </div>
    <!-- 每次tab切换都会重新加载新的路由组件，这个明显还没有优化，所以加上keep-alive组件会保留下来，请求不会再发起，只请求一次 -->
    <!-- 原理：把组件缓存再缓存里面，当再次被请求时，直接读取缓存 -->
    <router-view :seller="seller" keep-alive></router-view>
  </div>
</template>

<script>
  import {urlParse} from 'common/js/util';
  import header from './components/header/header.vue';

  const ERR_OK = 0;

  export default {
    data() {
      return {
        seller: {
          id: (() => {
            let queryParam = urlParse();
            return queryParam.id;
          })()
        }
      };
    },
    created() {
      this.$http.get('/api/seller?id=' + this.seller.id).then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          // 1，如果是这样直接赋值的话，response.data会覆盖掉原来seller的值，这样的话seller.id就不再存在
          // this.seller = response.data;
          // 2，所以我们的办法是将新存进来的数据response.data和原本的seller对象数据合并起来
          this.seller = Object.assign({}, this.seller, response.data);
          // console.log(this.seller.id);
          // console.log(this.seller);
        };
      });
    },
    components: {
      'v-header': header
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "./common/stylus/mixin.styl"
  .tab
    display: flex
    width: 100%
    height: 40px
    line-height: 40px
    // border-bottom: 1px solid rgba(7,17,27,0.1)
    border-1px(rgba(7,17,27,0.1))
    .tab-item
      flex: 1
      text-align: center
      & > a
        display: block
        font-size: 14px
        color: rgb(77, 85, 93)
        &.active
          color: rgb(240, 20, 240)
</style>
