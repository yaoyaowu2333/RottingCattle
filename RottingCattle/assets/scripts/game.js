
// let httpUtils=require("HttpUtils");
cc.Class({
    extends: cc.Component,

    properties: {
        rope_node:{
            default:null,
            type:cc.Node
        },
        cow_ins:{
            default:null,
            type:cc.Node
        },
        row_imgs:{
            default:[],
            type:[cc.SpriteFrame]
        },
        cow_prefab:{
            default:null,
            type:cc.Prefab
        },
        time:60
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.success=false;
        this.scorenum=0;
        // 生成新的牛
        this.cow_ins = cc.instantiate(this.cow_prefab);
        this.node.addChild(this.cow_ins)
        cc.log("生成新的牛")
    },

    start () {
        let countDownLable = cc.find("Canvas/bg_index/countDown").getComponent(cc.Label);
        //保证在开始的时候能显示出时间
        countDownLable.string=this.time+"S";
        this.schedule(function(){
            this.time--;
            countDownLable.string=this.time+"S";
            if(this.time==0){
                cc.log("游戏结束")
                // 获取结果弹窗节点
                let resultNode = cc.find("Canvas/result");
                resultNode.setSiblingIndex(100);
                // 通过getChildByName获得子节点， title 和 content
                let titleNode = resultNode.getChildByName("title");
                let contentNode = resultNode.getChildByName("content");
                // 最终得分显示
                titleNode.getComponent(cc.Label).string ="最终得分 "+this.scorenum ;
                // 最终成就
                let contentLabel = contentNode.getComponent(cc.Label);
                switch (true) {
                    case this.scorenum <= 3:
                        contentLabel.string = "套牛青铜";
                        break;
                    case this.scorenum < 6:
                        contentLabel.string = "套牛高手";
                        break;
                    case this.scorenum >=6:
                        contentLabel.string = "套牛王者";
                        break;
                }
                resultNode.active = true;

                let score=this.scorenum;
                wx.login({
                    success(res){
                        if(res.code){
                            // httpUtils.request({
                            //     url:"http://localhost:8080/updateScore",
                            //     method:"POST",
                            //     data:{
                            //             code:res.code,
                            //             score:score
                            //         },
                            //     success(msg){
                            //         console.log(msg);
                            //     }
                            // })
                            wx.request({
                                url:"http://localhost:8080/updateScore",
                                method:"POST",
                                header:{
                                    'content-type':"application/x-www-form-urlencoded"
                                },
                                data:{
                                    code:res.code,
                                    score:score
                                }
                            })
                        }
                    }
                })
                // 暂停游戏
                cc.director.pause();
            }
        },1)

        //小游戏涉及处理用户个人信息但未在《用户隐私保护指引》声明的用户信息类型，平台相关接口或组件将在小游戏开发版本、体验版本和线上版本中不可调用。
        let sysInfo = wx.getSystemInfoSync();
        //获取微信界面大小
        let width = sysInfo.screenWidth;
        let height = sysInfo.screenHeight;
    
        const button = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: 0,
                top: 0,
                width: width,
                height: height,
                lineHeight: 40,
                backgroundColor: '#00000000',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        })
        let self=this;
        button.onTap((res) => {
            // 此处可以获取到用户信息
            console.log(res);
            self.wxLogin(res.userInfo)
            //用完按钮后注销
            button.destroy();
        })

        wx.getUserInfo({
            success(res) {
                // 此处可以获取到用户信息
                console.log(res.userInfo);
                self.wxLogin(res.userInfo);
                button.destroy();
            },
            fail(err) {
                console.log("接口调用失败！");
            }
        })

        
    },
    wxLogin(userInfo){
        // 获取头像组件
        let icon = cc.find("Canvas/bg_index/icon").getComponent(cc.Sprite);
        //远程加载网络图片
        cc.loader.load({url:userInfo.avatarUrl,type:"png"},function (err,text) {
           icon.spriteFrame = new cc.SpriteFrame(text);
        })

        // 微信后台登录
        wx.login({
            success (res) {
                console.log('wxLogin login success' + res.errMsg)
                if (res.code) {
                    console.log('发起网络请求' + res.errMsg)
                    //发起网络请求
                    // httpUtils.request({
                    //     url:"http://localhost:8080/login",
                    //     method:"POST",
                    //     data: {
                    //                 code: res.code,
                    //                 nickName:userInfo.nickName,
                    //                 avatarUrl:userInfo.avatarUrl
                    //             },
                    //     success(msg){
                    //         console.log(msg);
                    //     }
                    // })
                    wx.request({
                        url: 'http://localhost:8080/login',
                        method:"POST",
                        //request body携带参数,表示请求体中的数据以 URL 编码的形式进行编码。
                        header: {
                            'content-type': 'application/x-www-form-urlencoded',
                        },
                        data: {
                            code: res.code,
                            nickName:userInfo.nickName,
                            avatarUrl:userInfo.avatarUrl
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })
    },
    // update (dt) {},
    /**
     * 捕获按钮点击点击
     * @param event
     * @param customEventData
     */
    clickCapture: function (event, customEventData) {
        // 激活当前节点
        this.rope_node.active = true
        // siblingIndex是设置节点在父节点中的排序
        this.rope_node.setSiblingIndex(100);
        // 设置当前位置
        this.rope_node.y = -480;
        // 开始动作
        const up = cc.moveTo(0.5,this.rope_node.x,0);
        // 捕捉结果判定
        let result = cc.callFunc(function () {

            const cow_currentX = this.cow_ins.x;
            if (cow_currentX > -50 & cow_currentX < 50) {
                cc.log("捕捉成功")
                this.success=true
                this.scorenum++
                this.node.removeChild(this.cow_ins)
                // 更换绳子
                let ropeType = this.cow_ins.getComponent("cow").randomType+1;
                this.rope_node.getComponent(cc.Sprite).spriteFrame = this.row_imgs[ropeType];
                // 生成新的牛
                this.cow_ins = cc.instantiate(this.cow_prefab);
                this.node.addChild(this.cow_ins)
            }else{
                cc.log("失败")
                this.success=false
            }
        },this);
        const down = cc.moveTo(0.5,this.rope_node.x,-800);
        let finish = cc.callFunc(function () {
            // 换绳子
            this.rope_node.getComponent(cc.Sprite).spriteFrame = this.row_imgs[0]
            if(this.success==true){
                let scoreLable=cc.find("Canvas/bg_index/score").getComponent(cc.Label);
                scoreLable.string="Score:"+this.scorenum
            }
        },this);
        let capture_action = cc.sequence(up,result,down,finish);
        this.rope_node.runAction(capture_action)
    },
    closeBtn() {
        cc.log("游戏继续")
        // 游戏继续
        cc.director.resume();
        // 重新加载整个场景
        cc.director.loadScene("套牛小游戏");
    },
    //微信分享
    shareBtn(){
        wx.shareAppMessage({
            title: "用户点击按钮转发！",
            imageUrl: "https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJicjzWf69FU1R8mCyWK8mEzcWJYVpCXW0JlJX9PMlqhesFUticVbicJXYVaWibfptr7uyupDibPhGvnqg/132",
            success(res) {
                console.log("分享成功")
                console.log(res)
            },
            fail(res) {
                console.log("分享失败")
                console.log(res)
            }
        });
    } 
});
