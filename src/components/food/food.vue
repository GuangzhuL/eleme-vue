<template>
    <div v-show="showFlag" class="food" transition="move" v-el:food>
        <div class="food-content">
            <div class="image-header">
                <img :src="food.image" alt="">
                <div class="back" @click="hide">
                    <i class="icon-arrow_lift"></i>
                </div>
            </div>
            <div class="content">
                <h1 class="title">{{food.name}}</h1>
                <div class="detail">
                    <span class="sell-count">月售{{food.sellCount}}份</span>
                    <span class="rating">好评率{{food.rating}}%</span>
                </div>
                <div class="price">
                    <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                    <cartcontrol :food="food"></cartcontrol>
                </div>
                <div @click.stop.prevent="addFirst" class="buy" v-show="!food.count || food.count === 0" transition="fade">加入购物车</div>
            </div>
            <split v-show="food.info"></split>
            <div class="info" v-show="food.info">
                <h1 class="title">商品信息</h1>
                <p class="text">{{food.info}}</p>
            </div>
            <split></split>
            <div class="rating">
                <h1 class="title">商品评价</h1>
                <ratingselect :select-type="selectType" :only-content="onlyContent" :desc="desc" :ratings="food.ratings"></ratingselect>
                <div class="rating-wrapper">
                    <ul v-show="food.ratings && food.ratings.length">
                        <li v-show="needShow(rating.rateType, rating.text)" v-for="rating in food.ratings" class="rating-item border-1px">
                            <div class="user">
                                <span class="name">{{rating.username}}</span>
                                <img :src="rating.avatar" width="12" height="12" alt="" class="avatar">
                            </div>
                            <!-- |代表着通道，每一个 rating.rateTime都会成为formatDate函数的参数，然后返回函数的值，下面要在filters写对应的函数 -->
                            <div class="time">{{rating.rateTime | formatDate}}</div>
                            <p class="text">
                                <span :class="{'icon-thumb_up': rating.rateType === 0, 'icon-thumb_down': rating.rateType === 1}"></span>{{rating.text}}
                            </p>
                        </li>
                    </ul>
                    <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import Vue from 'vue';
    import {formatDate} from 'common/js/date';
    import cartcontrol from 'components/cartcontrol/cartcontrol';
    import ratingselect from 'components/ratingselect/ratingselect';
    import split from 'components/split/split';

    // const POSITIVE = 0;
    // const NEGATIVE = 1;
    const ALL = 2;

    export default {
        props: {
            food: {
                type: Object
            }
        },
        data() {
            return {
                showFlag: false,
                selectType: ALL,
                onlyContent: false,
                desc: {
                    all: '全部',
                    positive: '推荐',
                    negative: '吐槽'
                }
            };
        },
        methods: {
            show() {
                // 显示页面
                this.showFlag = true;
                this.selectType = ALL;
                this.onlyContent = true;
                // 异步执行滚动
                this.$nextTick(() => {
                    if (!this.scroll) {
                        this.scroll = new BScroll(this.$els.food, {
                            click: true
                        });
                    } else {
                        this.scroll.refresh();
                    }
                });
            },
            hide() {
                this.showFlag = false;
            },
            addFirst(event) {
                if (!event._constructed) {
                    return;
                }
                // 事件派发模型
                this.$dispatch('cart.add', event.target);
                Vue.set(this.food, 'count', 1);
            },
            needShow(type, text) {
                // 只显示有内容的评论
                if (this.onlyContent && !text) {
                    return false;
                }
                // 统一返回true，全部评论都显示
                if (this.selectType === ALL) {
                    return true;
                } else {
                    // 返回符合要求的类型，如果相同，则返回true，否则false(返回被选择的部分)
                    return type === this.selectType;
                }
            }
        },
        events: {
            // 父组件注册该事件，抓住这个被子组件派发的事件，并且接受来自子组件的参数，该事件改变selectType
            'ratingtype.select'(type) {
                this.selectType = type;
                // 1,每次评论数量的改变，是不会涉及到滚动的，那么一开始的可以滚动的区域就已经固定了，所以每次改变评论的数量的时候，都需要重新为可以滚动的区域重新分配一次
                // 这样才有机会让滚动的长度合理
                // 2,每次都refresh()一次，但是有一个问题，当我们refresh()的时候，DOM是还没有刷新的，所以我们去refresh()是没有效果的，因为DOM的刷新是一个回调事件，异步执行,
                // 所以我们滚动的refresh()也需要用异步回调的方式去调用，在DOM刷新之后调用才有效果
                this.$nextTick(() => {
                    this.scroll.refresh();
                });
            },
            // 同理可得
            'content.toggle'(onlyContent) {
                this.onlyContent = onlyContent;
                this.$nextTick(() => {
                    this.scroll.refresh();
                });
            }
        },
        // 过滤函数
        filters: {
            formatDate(time) {
                let date = new Date(time);
                return formatDate(date, 'yyyy-MM-dd hh:mm');
            }
        },
        components: {
            cartcontrol,
            split,
            ratingselect
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .food
        position: fixed
        left: 0
        top: 0
        bottom: 48px
        // 覆盖原来的页面
        z-index: 30
        width: 100%
        background: #fff
        &.move-transition
            transition: all 0.2s linear
            transform: translate3d(0, 0, 0)
        &.move-enter, &.move-leave
            transform: translate3d(100%, 0, 0)
        .image-header
            position: relative
            width: 100%
            height: 0
            // 相当于宽度的百分百(正方形大法，黑魔法)
            padding-top: 100%
            img 
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
            .back
                position: absolute
                top: 10px
                left: 0
                .icon-arrow_lift
                    display: block
                    padding: 10px
                    font-size: 20px
                    color: #fff
        .content
            position: relative
            padding: 18px
            .title
                line-height:  14px
                margin-bottom: 8px
                font-size: 14px
                font-weight: 700
                color: rgb(7, 17, 27)
            .detail
                margin-bottom: 18px
                line-height: 10px
                height: 10px
                font-size: 0
                .sell-count, .rating
                    font-size: 10px
                    color: rgb(147, 153, 159)
                .sell-count
                    margin-right: 12px
            .price
                font-weight: 700
                line-height: 24px
                .now
                    margin-right: 8px
                    font-size: 14px
                    color: rgb(240, 20, 20)
                .old
                    text-decoration: line-through
                    font-size: 10px
                    color: rgb(147, 153, 159)
            .cartcontrol-wrapper
                position: absolute
                right: 12px
                bottom: 12px
            .buy
                position: absolute
                right: 18px
                bottom: 18px
                z-index: 10
                height: 24px
                line-height: 24px
                padding: 0 12px
                box-sizing: border-box
                border-radius: 12px
                font-size: 10px
                color: #fff
                background: rgb(0, 160, 220)
                // 给足够的时间让小球计算自己的位置
                &.fade-transition 
                    transition: all 0.2s
                    opacity: 1
                &.fade-enter, &.fade-leave
                    opacity: 0
        .info
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 6px
                font-size: 14px
                color: rgb(7, 17, 27)
            .text 
                line-height: 24px
                padding: 0 8px
                font-size: 12px
                color: rgb(77, 85, 93)
        .rating
            padding-top: 18px
            .title  
                line-height: 14px
                margin-left: 18px
                font-size: 14px
                color: rgb(7, 17, 27)     
            .rating-wrapper
                padding: 0 18px
                .rating-item
                    position: relative
                    padding: 16px 0
                    border-1px(rgba(7, 17, 27, 0.1))
                    .user
                        position: absolute
                        right: 0
                        top: 16px
                        line-height: 12px
                        font-size: 0
                        .name
                            display: inline-block
                            margin-right: 6px
                            vertical-align: top
                            font-size: 10px
                            color: rgb(147, 153, 159)
                        .avatar
                            border-radius: 50%
                    .time
                        margin-bottom: 6px
                        line-height: 12px
                        font-size: 10px
                        color: rgb(147, 153, 159)
                    .text
                        line-height: 16px
                        font-size: 12px
                        color: rgb(7, 17, 27)
                        .icon-thumb_up, .icon-thumb_down
                            margin-right: 4px
                            line-height: 16px
                            font-size: 12px
                        .icon-thumb_up
                            color: rgb(0, 160, 220)
                        .icon-thumb_down
                            color: rgb(147, 153, 159)
                .no-rating
                    padding: 16px 0
                    font-size: 12px
                    color: rgb(147, 153, 159)
</style>


