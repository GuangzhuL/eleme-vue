<template>
    <div class="ratings" v-el:ratings>
        <div class="ratings-content">
            <div class="overview">
                <div class="overview-left">
                    <h1 class="score">{{seller.score}}</h1>
                    <div class="title">综合评分</div>
                    <div class="rank">高于周边商家{{seller.rankRate}}</div>
                </div>
                <div class="overview-right">
                    <div class="score-wrapper">
                        <span class="title">服务态度</span>
                        <star :size="36" :score="seller.serviceScore" class="star"></star>
                        <span class="score">{{seller.serviceScore}}</span>
                    </div>
                    <div class="score-wrapper">
                        <span class="title">商品评分</span>
                        <star :size="36" :score="seller.foodScore" class="star"></star>
                        <span class="score">{{seller.foodScore}}</span>                        
                    </div>
                    <div class="delivery-wrapper">
                        <span class="title">送达时间</span>
                        <span class="delivery">{{seller.deliveryTime}}分钟</span>                        
                    </div>                    
                </div>
            </div>
            <split></split>
            <ratingselect :select-type="selectType" :only-content="onlyContent" :desc="desc" :ratings="ratings"></ratingselect>
            <div class="rating-wrapper">
                <ul>
                    <li v-for="rating in ratings" v-show="needShow(rating.rateType, rating.text)" class="rating-item">
                        <div class="avatar">
                            <img width="28" height="28" :src="rating.avatar" alt="">
                        </div>
                        <div class="content">
                            <h1 class="name">{{rating.username}}</h1>
                            <div class="star-wrapper">
                                <star :size="24" :score="rating.score"></star>
                                <span class="delivery" v-show="rating.deliveryTime">{{rating.deliveryTime}}</span>
                            </div>
                            <p class="text">{{rating.text}}</p>
                            <div class="recommend" v-show="rating.recommend.length">
                                <i class="icon-thumb_up"></i>
                                <span class="item" v-for="item in rating.recommend">{{item}}</span>
                            </div>
                            <div class="time">
                                {{rating.rateTime | formatDate}}
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import star from 'components/star/star';
    import ratingselect from 'components/ratingselect/ratingselect';
    import split from 'components/split/split';
    import {formatDate} from 'common/js/date';

    const ALL = 2;
    const ERR_OK = 0;

    export default {
        props: {
            seller: {
                type: Object
            }
        },
        data() {
            return {
                ratings: [],
                showFlag: false,
                selectType: ALL,
                onlyContent: true
            };
        },
        created() {
            this.$http.get('/api/ratings').then((response) => {
                response = response.body;
                if (response.errno === ERR_OK) {
                    this.ratings = response.data;
                    this.$nextTick(() => {
                        if (!this.scroll) {
                            this.scroll = new BScroll(this.$els.ratings, {
                                click: true
                            });
                        } else {
                            this.scroll.refresh();
                        }
                    });
                }
            });
        },
        methods: {
            // 该方法基于本组件的各种状态时刻改变状态（因为已经绑定数据，随时监听）
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
        filters: {
            formatDate(time) {
                let date = new Date(time);
                return formatDate(date, 'yyyy-MM-dd hh:mm');
            }
        },
        components: {
            star,
            ratingselect,
            split
        },
        // 父子间传递数据的过程如下
        // 1，子组件被点击触发事件；
        // 2，子组件触发自己对应的的方法，同时方法里面派发了一个事件，并且传参（参数状态已经被改变）
        // 3，父组件（该组件）已经接收到了该派发的事件（因为下面已经注册了该事件），然后接受子组件传递过来的参数，改变自己的状态
        // 4，状态一旦被改变，上面的方法needShow()马上感受到了变化，根据不同的数据状态返回对应的值
        // 5，HTML代码里面的v-show（）感受到了返回值的变化，从而做出相应的显示和隐藏
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
            'content.toggle'(onlyContent) {
                this.onlyContent = onlyContent;
                this.$nextTick(() => {
                    this.scroll.refresh();
                });
            }
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .ratings
        position: absolute
        top: 174px
        bottom: 0
        left: 0
        width: 100%
        overflow: hidden
        .overview
            display: flex
            padding: 18px 0
            .overview-left
                flex: 0 0 137px
                padding: 6px 0
                width: 137px
                border-right: 1px solid rgba(7, 17, 27, 0.1)
                text-align: center
                @media only screen and (max-width:320px)
                    flex: 0 0 120px
                    width: 120px
                .score
                    margin-bottom: 6px
                    line-height: 28px
                    font-size: 24px
                    color: rgb(255, 153, 0)
                .title
                    margin-bottom: 8px
                    line-height: 12px
                    font-size: 12px
                    color: rgb(7, 17, 27)    
                .rank
                    line-height: 10px
                    font-size: 10px
                    color: rgb(147, 153, 159)
            .overview-right
                flex: 1
                padding: 6px 0 6px 24px
                @media only screen and (max-width:320px)
                    padding-left: 6px
                .score-wrapper
                    margin-bottom: 8px
                    font-size: 0
                    .title
                        display: inline-block
                        line-height: 18px
                        vertical-align: top
                        font-size: 12px
                        color: rgb(7, 17, 27)
                    .star
                        display: inline-block
                        margin: 0 12px
                        // 星星和分数类型不同，所以需要 vertical-align:top 顶部对齐
                        vertical-align: top
                    .score
                        display: inline-block
                        line-height: 18px
                        vertical-align: top 
                        font-size: 12px      
                        color: rgb(255, 153, 0)                 
                .delivery-wrapper
                    font-size: 0
                    // 这里两个文字相同，所以不用 vertical-align:top
                    .title
                        line-height: 18px
                        font-size: 12px
                        color: rgb(7, 17, 27)    
                    .delivery
                        margin-left: 12px
                        font-size: 12px
                        color: rgb(147, 153, 159)
        .rating-wrapper
            padding: 0 18px
            .rating-item
                display: flex
                padding: 18px 0
                border-1px(rgba(7, 17, 27, 0.1))
                .avatar
                    flex: 0 0 28px
                    width: 28px
                    margin-right: 12px
                    img
                        border-raidus: 50%
                .content
                    position: relative
                    flex: 1
                    .name
                        margin-bottom: 4px
                        line-height: 12px
                        font-size: 10px
                        color: rgb(7, 17, 27)
                    .star-wrapper
                        margin-bottom: 6px
                        font-size: 0
                        .star
                            display: inline-block
                            margin-right: 6px
                            vertical-align: top
                        .delivery
                            display: inline-block
                            vertical-align: top
                            line-height: 12px
                            font-size: 10px
                            color: rgb(147, 153, 159)
                    .text
                        margin-bottom: 8px
                        line-height: 18px
                        color: rgb(7, 17, 27)
                    .recommend
                        line-height: 16px
                        // font-size: 0将字体设为0，可以清楚两个行内元素之间自带的空隙
                        font-size: 0
                        .icon-thumb_up, .item
                            display: inline-block
                            margin: 0 8px 4px 0
                            font-size: 9px
                        .icon-thumb_up
                            color: rgb(0, 160, 220)
                        .item
                            border: 1px solid rgba(147, 153, 159, 0.1)
                            border-radius: 1px
                            color: rgb(147, 153, 159)
                            background: #fff
                    .time
                        position: absolute
                        top: 0
                        right: 0
                        color: rgb(147, 153, 159)
</style>

