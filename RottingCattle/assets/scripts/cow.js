
// 用cc.class 生成一个对象，包含数组皮肤
const cow_skin = cc.Class({
    name:"cow_skin",
    properties:{
        cows:{
            default:[],
            type:[cc.SpriteFrame]
        }
    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        cow_sets: {
            default: [],
            type: [cow_skin]
        },
        intervalTime:0,
        speed:0.2,
        index:0,
        randomType:0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.randomType=Math.floor(Math.random()*3);
    },
    start () {
        
    },

    update (dt) {
        // 获取牛的类型
        let cowSet = this.cow_sets[this.randomType];
        this.intervalTime += dt;
        // cc.log(this.intervalTime);
        // 每隔0.2秒更换皮肤
        if(this.intervalTime>this.speed){
            this.intervalTime=0;
            this.index++;
            if(this.index>=cowSet.cows.length){
                this.index=0;
            }
        }
        // let index  = Math.floor(this.intervalTime / 0.2);
        // 获取精灵组件
        let sprite = this.node.getComponent(cc.Sprite);
        // let spriteFrame = sprite.spriteFrame;
        
        // // 如果最后一个 重置index
        // index=index%3;
        // 设置皮肤
        sprite.spriteFrame = cowSet.cows[this.index]
        // cc.log(index)
    },
    runCallback(){
        cc.log("一个轮回结束")
        this.randomType=Math.floor(Math.random()*3);
    }
});
