<template>
    <div class="goods">
        <div class="menu-wrapper" v-el:menu-wrapper>
            <ul>
                <!-- 让菜单栏对应索引变样式 -->
                <li v-for="item in goods" class="menu-item" :class="{'current':currentIndex===$index}" @click="selectMenu($index, $event)">
                    <span class="text border-1px">
                        <span v-show="item.type > 0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
                    </span>
                </li>
            </ul>
        </div>
        <div class="foods-wrapper" v-el:foods-wrapper>
            <ul>
                <!-- 编程习惯，加上hook表示是JS操作DOM的样式 -->
                <li v-for="item in goods" class="food-list food-list-hook">
                    <h1 class="title">{{item.name}}</h1>
                    <ul>
                        <li @click="selectFood(food, $event)" v-for="food in item.foods" class="food-item border-1px">
                            <div class="icon">
                                <img width="57" height="57" :src="food.icon" alt="">
                            </div>
                            <div class="content">
                                <h2 class="name">{{food.name}}</h2>
                                <p class="desc">{{food.description}}</p>
                                <div class="extra">
                                    <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                                </div>
                                <div class="price">
                                    <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                                </div>
                                <div class="cartcontrol-wrapper">
                                    <cartcontrol :food="food"></cartcontrol>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <!-- 通过select-foods属性来传递,属性名不支持驼峰写法，只能是“横杠-” -->
        <shopcart v-ref:shopcart :select-foods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice"></shopcart>
    </div>
    <food :food="selectedFood" v-ref:food></food>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll';
    import shopcart from 'components/shopcart/shopcart';
    import cartcontrol from 'components/cartcontrol/cartcontrol';
    import food from 'components/food/food';

    const ERR_OK = 0;

    export default {
        props: {
            seller: {
                type: Object
            }
        },
        data() {
            return {
                // goods里面有一类一类的商品
                goods: [],
                listHeight: [],
                scrollY: 0,
                selectedFood: {}
            };
        },
        // 前端这边感受到了url的变化之后(与此同时服务端也感受到了变化返回了合理的数据),前端这边就开始接受来自服务端的数据response
        created() {
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
            this.$http.get('/api/goods').then((response) => {
                response = response.body;
                if (response.errno === ERR_OK) {
                    this.goods = response.data;
                    // 滚动函数的调用
                    this.$nextTick(() => {
                        this._initScroll();
                        this._calculateHeight();
                    });
                    // console.log(this.goods);
                };
            });
        },
        computed: {
            // 返回与菜单栏相对应的索引
            currentIndex() {
                for (let i = 0; i < this.listHeight.length; i++) {
                    let height1 = this.listHeight[i];
                    let height2 = this.listHeight[i + 1];
                    // 临界点分离，scroll来判断滚动的位置，只需要介于两个高度之间（两个li之间，每个li代表一个种类）即可，此时此刻返回对应的索引
                    if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
                        return i;
                    };
                 };
                 return 0;
            },
            selectFoods() {
                // 被选中的食品通过计算属性返回一个数组传递给cartcontrol
                let foods = [];
                this.goods.forEach((good) => {
                    good.foods.forEach((food) => {
                        if (food.count) {
                            foods.push(food);
                        }
                    });
                });
                return foods;
            }
        },
        methods: {
            selectMenu(index, event) {
                if (!event._constructed) {
                    return;
                }
                let foodList = this.$els.foodsWrapper.getElementsByClassName('food-list-hook');
                let el = foodList[index];
                this.foodsScroll.scrollToElement(el, 300);
                // console.log(index);
            },
            selectFood(food, event) {
                if (!event._constructed) {
                    return;
                }
                this.selectedFood = food;
                // 父组件调用了子组件的方法，前提是在子组件上面已经写好了v-ref:food
                this.$refs.food.show();
            },
            // 小球3，'cart.add'事件触发的是该方法
            _drop(target) {
                // 体验优化，异步执行下落动画
                this.$nextTick(() => {
                    // 小球4,实际上执行的是shopcart上的drop方法
                    this.$refs.shopcart.drop(target);
                });
            },
            _initScroll() {
                // 滚动代码
                this.menuScroll = new BScroll(this.$els.menuWrapper, {
                    click: true
                });

                this.foodsScroll = new BScroll(this.$els.foodsWrapper, {
                    click: true,
                    probeType: 3
                });
                // 食物栏被滚动的时候，计算scroll的高度
                this.foodsScroll.on('scroll', (pos) => {
                    this.scrollY = Math.abs(Math.round(pos.y));
                });
            },
            // 计算每个li的高度，将高度们推进数组
            _calculateHeight() {
                let foodList = this.$els.foodsWrapper.getElementsByClassName('food-list-hook');
                let height = 0;
                this.listHeight.push(height);
                for (let i = 0; i < foodList.length; i++) {
                    let item = foodList[i];
                    height += item.clientHeight;
                    this.listHeight.push(height);
                };
            }
        },
        components: {
            shopcart,
            cartcontrol,
            food
        },
        events: {
            // 小球2，父级为子级注册一个事件
            'cart.add'(target) {
                this._drop(target);
            }
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .goods  
        display: flex
        position: absolute
        top: 174px
        bottom: 46px
        width: 100%
        overflow: hidden
        .menu-wrapper
            flex: 0 0 80px
            width: 80px
            background: #f3f5f7
            .menu-item
                display: table
                height: 54px
                width: 56px
                line-height: 14px
                padding: 0 12px
                &.current
                    position: relative
                    z-index: 10
                    margin-top: -1px
                    background: #fff
                    font-weight: 700
                    .text
                        border-none()
                .icon
                    display: inline-block
                    width: 16px
                    height: 16px
                    vertical-align: top
                    margin-right: 2px
                    background-size: 16px 16px
                    background-repeat: no-repeat
                    &.decrease
                        bg-image('decrease_3')
                    &.discount
                        bg-image('discount_3')
                    &.guarantee
                        bg-image('guarantee_3')
                    &.invoice
                        bg-image('invoice_3')
                    &.special
                        bg-image('special_3') 
                .text
                    display: table-cell
                    width: 56px
                    vertical-align: middle
                    border-1px(rgba(7, 17, 27, 0.1))
                    font-size: 12px
        .foods-wrapper
            flex: 1
            .title
                padding-left: 14px
                height: 26px
                line-height: 26px
                border-left: 2px solid #d9dde1
                font-size: 12px
                color: rgb(147, 153, 159)
                background: #f3f5f7
            .food-item
                display: flex
                margin: 18px
                padding-bottom: 18px
                border-1px(rgba(7, 17, 27, 0.1))
                &:last-child
                    border-none()
                    margin-bottom: 0
                .icon
                    flex: 0 0 57
                    margin-right: 10px
                .content
                    flex: 1
                    .name
                        margin: 2px 0 8px 0
                        height: 14px
                        line-height: 14px
                        font-size: 14px
                        color: rgb(7, 17, 27)
                    .desc, .extra
                        line-height: 10px
                        font-size: 10px
                        color: rgb(147, 153, 159)
                    .desc
                        line-height: 12px
                        margin-bottom: 8px
                    .extra
                        .count
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
                        right: 0
                        bottom: 12px


</style>

