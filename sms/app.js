var WebSocket = require('./components/websocket.js');
var util = require('./components/util.js');
const hostname = 'wa.beidou110.com';
App({
    appData: {
        ukey: '',
        code: '',
        name: '',
        webSocket: {},
        hostname: hostname,
        // hostname: 'mp.mallts.com',
        // hostname: 'localhost:8070',
        updateUkey: (ukey, name) => {
            const app = getApp();
            const appData = app.appData;
            appData.ukey = ukey;
            appData.name = name;
        }

    },
    onLaunch: function () {
        this.appData.webSocket = new WebSocket(`wss://${hostname}/sms/websocket/sms`);
        this.appData.webSocket.connectSocket();
    },
    onShow: function () {
        wx.showToast({
            title: '登录中',
            icon: 'loading',
            duration: 10000
        });
        const appData = this.appData;

        /* 登录 */
        wx.login({
            success: function (res) {
                appData.code = res.code;
                if (appData.code) {
                    wx.request({
                        url: `https://${appData.hostname}/sms/api/mp/getUKey`,
                        data: { code: appData.code },
                        // header: {
                        //     'Accept': 'application/json, text/plain, */*',
                        //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                        // },
                        // data: util.json2Form({
                        //     code: appData.code
                        // }),
                        // method: 'POST',
                        success: function (res) {
                            if (res.data) {
                                if (res.data.state) {
                                    /* 注册socket */
                                    appData.updateUkey(res.data.ukey, res.data.name);
                                    appData.webSocket.sendSocketMessage({ type: 'REGIST', ukey: res.data.ukey }, function() {
                                        appData.webSocket.ukey = res.data.ukey;
                                    });
                                } else {
                                    const pages = getCurrentPages();
                                    const current = pages[pages.length - 1];
                                    if (current.__route__ !== 'pages/bind/bind')
                                        wx.showModal({
                                            title: '提示',
                                            content: '请先绑定平台账号',
                                            success: function (res) {
                                                if (res.confirm) {
                                                    wx.navigateTo({ url: `/pages/bind/bind` })
                                                }
                                            }
                                        });
                                }
                            }
                        },
                        fail: function (res) {
                            console.log(res);
                            wx.showToast({
                                title: '登录失败，请检查网络'
                            });
                        },
                        complete: function () {
                            wx.hideToast();
                        }
                    })
                }
            }
        });
    }
})