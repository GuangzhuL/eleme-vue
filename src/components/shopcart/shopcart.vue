<template>
    <div class="shopcart">
        <div class="content" @click="toggleList">
            <div class="content-left">
                <div class="logo-wrapper">
                    <div class="logo" :class="{'highlight': totalCount > 0}">
                        <i class="icon-shopping_cart" :class="{'highlight': totalCount > 0}"></i>
                    </div>
                    <!-- 当totalCount大于0的时候，让其显示 -->
                    <div class="num" v-show="totalCount > 0">{{totalCount}}</div>
                </div>
                <!-- 当totalPrice大于0的时候，让其拥有highlight类 -->
                <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}</div>
                <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
            </div>
            <!-- 变量绑定样式在这里应用 -->
            <!-- 阻止冒泡和默认事件 -->
            <div class="content-right" @click.stop.prevent="pay">
                <div class="pay" :class="payClass">
                    {{payDesc}}
                </div>
            </div>
        </div>
        <div class="ball-container">
            <div transition="drop" v-for="ball in balls" v-show="ball.show" class="ball">
                <div class="inner inner-hook"></div>
            </div>
        </div>
        <div class="shopcart-list" v-show="listShow" transition="fold">
            <div class="list-header">
                <h1 class="title">购物车</h1>
                <span class="empty" @click="empty">清空</span>
            </div>
            <div class="list-content" v-el:list-content>
                <ul>
                    <li class="food" v-for="food in selectFoods">
                        <span class="name">{{food.name}}</span>
                        <div class="price">
                            <span>￥{{food.price * food.count}}</span>
                        </div>
                        <div class="cartcontrol-wrapper">
                            <cartcontrol :food="food"></cartcontrol>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="list-mask" @click="hideList" v-show="listShow" transition="fade"></div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import cartcontrol from 'components/cartcontrol/cartcontrol';

    export default {
        props: {
            // 属性值需要用驼峰写法
            selectFoods: {
                type: Array,
                default() {
                    return [
                        {
                            price: 10,
                            count: 2
                        }
                    ];
                }
            },
            deliveryPrice: {
                type: Number,
                default: 0
            },
            minPrice: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                balls: [
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    }
                ],
                dropBalls: [],
                fold: true
            };
        },
        computed: {
            totalPrice() {
                let total = 0;
                this.selectFoods.forEach((food) => {
                    total += food.price * food.count;
                });
                return total;
            },
            totalCount() {
                let count = 0;
                this.selectFoods.forEach((food) => {
                    count += food.count;
                });
                return count;
            },
            payDesc() {
                // 结算的方法,与起送价进行比较
                if (this.totalPrice === 0) {
                    return `￥${this.minPrice}元起送`;
                } else if (this.totalPrice < this.minPrice) {
                    let diff = this.minPrice - this.totalPrice;
                    return `还差￥${diff}元起送`;
                } else {
                    // eslint设置了只能用单引号
                    return '去结算';
                }
            },
            // 通过变量来计算最终返回的字符串(也就是样式class),与上面的class来绑定
            payClass() {
                if (this.totalPrice < this.minPrice) {
                    return 'not-enough';
                } else {
                    return 'enough';
                }
            },
            listShow() {
                // 如果总数为0，则折叠fold为真，同时返回false，让其不显示
                if (!this.totalCount) {
                    this.fold = true;
                    return false;
                }
                // 状态记录，真的时候，显示
                let show = !this.fold;
                if (show) {
                    this.$nextTick(() => {
                        if (!this.scroll) {
                            // this.$els.listContent这个标签可滚动可点击
                            this.scroll = new BScroll(this.$els.listContent, {
                                click: true
                            });
                        } else {
                            this.scroll.refresh();
                        }
                    });
                }
                return show;
            }
        },
        methods: {
            drop(el) {
                // 小球5，该方法将可扔的小球存进一个数组
                // console.log(el);
                for (let i = 0; i < this.balls.length; i++) {
                    let ball = this.balls[i];
                    if (!ball.show) {
                        ball.show = true;
                        ball.el = el;
                        this.dropBalls.push(ball);
                        return;
                    }
                }
            },
            toggleList() {
                // 购物总数为0的时候，点击不执行
                if (!this.totalCount) {
                    return;
                }
                // 购物数不为0的时候，点击的话来回切换折叠的情况，fold是状态的控制
                this.fold = !this.fold;
            },
            hideList() {
                this.fold = true;
            },
            empty() {
                // 利用数据绑定的原理进行清空
                this.selectFoods.forEach((food) => {
                    food.count = 0;
                });
            },
            pay() {
                if (this.totalPrice < this.minPrice) {
                    return;
                }
                window.alert(`支付${this.totalPrice}元`);
            }
        },
        transitions: {
            drop: {
                // 小球6，在过渡的时候经历了以下的状态，扔之前的位置是“+”的位置
                beforeEnter(el) {
                    let count = this.balls.length;
                    while (count--) {
                        let ball = this.balls[count];
                        if (ball.show) {
                            let rect = ball.el.getBoundingClientRect();
                            let x = rect.left - 32;
                            let y = -(window.innerHeight - rect.top - 22);
                            // 让小球显示
                            el.style.display = '';
                            // '+'的Y轴位置
                            el.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
                            el.style.transform = `translate3d(0, ${y}px, 0)`;
                            let inner = el.getElementsByClassName('inner-hook')[0];
                            // 小球的X轴位置
                            inner.style.webkitTransform = `translate3d(${x}px, 0, 0)`;
                            inner.style.transform = `translate3d(${x}px, 0, 0)`;
                        }
                    }
                },
                enter(el) {
                    /* eslint-disable no-unused-vars */
                    let rf = el.offsetHeight;
                    this.$nextTick(() => {
                        // 小球被扔的时候的终点位置
                        el.style.webkitTransform = 'translate3d(0, 0, 0)';
                        el.style.transform = 'translate3d(0, 0, 0)';
                        let inner = el.getElementsByClassName('inner-hook')[0];
                        inner.style.webkitTransform = 'translate3d(0, 0, 0)';
                        inner.style.transform = 'translate3d(0, 0, 0)';
                    });
                },
                afterEnter(el) {
                    // 扔完之后小球数组被弹出，同时show变回初始的false，同时display设置为none不显示了，从而让数据可以重新循环
                    let ball = this.dropBalls.shift();
                    if (ball) {
                        ball.show = false;
                        el.style.display = 'none';
                    }
                }
            }
        },
        components: {
            cartcontrol
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .shopcart
        position: fixed
        left: 0
        bottom: 0
        z-index: 50
        width: 100%
        height: 48px
        background: #000
        // font-size: 0
        .content    
            display: flex
            background: #141d27
            font-size: 0
            color: rgba(255, 255, 255, 0.4)
            .content-left
                flex: 1
                .logo-wrapper
                    display: inline-block
                    position: relative
                    top: -10px
                    margin: 0 12px
                    padding: 6px
                    width: 56px
                    height: 56px
                    box-sizing: border-box
                    vertical-align: top
                    border-radius: 50%
                    background: #141d27
                    .logo
                        width: 100%
                        height: 100%
                        border-radius: 50%
                        text-align: center
                        background: #2b343c
                        &.highlight
                            background: rgb(0, 160, 220)
                        .icon-shopping_cart
                            line-height: 44px
                            font-size: 24px
                            color: #80858a
                            &.highlight
                                color: #fff 
                    .num
                        position: absolute
                        top: 0
                        right: 0
                        width: 24px
                        height: 16px
                        line-height: 16px
                        text-align: center
                        border-radius: 16px
                        font-size: 9px
                        font-weight: 700
                        color: #fff
                        background: rgb(240, 20, 20)
                        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4)
                .price
                    display: inline-block
                    vertical-align: top
                    margin-top: 12px
                    line-height: 24px
                    padding-right: 12px
                    box-sizing: border-box
                    border-right: 1px solid rgba(255, 255, 255, 0.1)
                    font-size: 16px
                    font-weight: 700
                    // &这个符号是指与此同时该类与上一个类同时存在的意思，该处指.price.highlight
                    &.highlight
                        color: #fff
                .desc
                    display: inline-block
                    vertical-align: top
                    margin: 12px 0 0 12px
                    line-height: 24px
                    font-size: 10px
            .content-right
                flex: 0 0 105px
                width: 105px
                .pay
                    height: 48px
                    line-height: 48px
                    text-align: center            
                    font-size: 12px
                    font-weight: 700
                    background: #2b333b
                    &.not-enough
                        background: #2b333b
                    &.enough
                        background: #00b43c
                        color #fff
        .ball-container
            .ball
                position: fixed
                left: 32px
                bottom: 22px
                z-index: 200
                &.drop-transition
                    // 小球7，整个小球的状态运动都在这里显示
                    transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
                    .inner
                        width: 16px
                        height: 16px
                        border-radius: 50%
                        background: rgb(0, 160, 220)
                        transition: all 0.4s linear
        .shopcart-list
            position: absolute
            left: 0
            top: 0
            z-index: -1
            width: 100%
            &.fold-transition
                transition: all 0.5s
                transform: translate3d(0, -100%, 0)
            &.fold-enter, &.fold-leave
                transform: translate3d(0, 0, 0)
            .list-header
                height: 40px
                line-height: 40px
                padding: 0 18px
                background: #f3f5f7
                border-bottom: 1px solid rgba(7, 17, 27, 0.1)
                .title
                    float: left
                    font-size: 14px
                    color rgb(7, 17, 27)
                .empty
                    float: right
                    font-size: 12px
                    color: rgb(0, 160, 220)
            .list-content
                padding: 0 18px
                max-height: 217px
                overflow: hidden
                background: #fff
                .food
                    position: relative
                    padding: 12px 0
                    box-sizing: border-box
                    border-1px(rgba(7, 17, 27, 0.1))
                    .name
                        line-height: 24px
                        font-size: 14px
                        color: rgb(7, 17, 27)
                    .price
                        position: absolute
                        right: 90px
                        bottom: 12px
                        line-height: 24px
                        font-size: 14px
                        font-weight: 700
                        color: rgb(240, 20, 20)
                    .cartcontrol-wrapper
                        position: absolute
                        right: 0
                        bottom: 6px

    .list-mask
        position: fixed
        top: 0
        left: 0
        width: 100%
        height: 100%
        z-index: 40
        background-filter: blur(10px)
        &.fade-transition
            transition: all 0.5s
            opacity: 1
            background: rgba(7, 17, 27, 0.6)              
        &.fade-enter, &.fade-leave
            opacity: 0
            background: rgba(7, 17, 27, 0) 
</style>


