var util = require('../../components/util.js');
Page({
    data: {
        name_invalid: false,
        pwd_invalid: false
    },
    handleLogin: function (e) {
        const { name, pwd } = e.detail.value;
        this.setData({
            name_invalid: !name,
            pwd_invalid: !pwd
        });
        if (!this.data.name_invalid && !this.data.pwd_invalid) {
            const app = getApp();
            const appData = app.appData;
            const that = this;
            wx.login({
                success: function (res) {
                    appData.code = res.code;
                    if (appData.code) {
                        that.bindUser(name, pwd, appData.code);
                    }
                }
            });
        }
    },
    bindUser: function (name, pwd, code) {
        const app = getApp();
        const appData = app.appData;
        wx.request({
            url: `https://${appData.hostname}/sms/api/mp/bind`,
            data: { name, pwd, code },
            // header: {
            //     'Accept': 'application/json, text/plain, */*',
            //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            // },
            // data: util.json2Form({ name, pwd, code }),
            // method: 'POST',
            success: function (res) {
                if (res.data) {
                    if (res.data.state) {
                        // 更新UKEY
                        appData.updateUkey(res.data.ukey, res.data.name);
                        appData.webSocket.sendSocketMessage({ type: 'REGIST', ukey: res.data.ukey }, function () {
                            appData.webSocket.ukey = res.data.ukey;
                            wx.showToast({
                                title: '绑定成功', success: function () {
                                    wx.navigateBack();
                                }
                            });
                        });
                    } else {
                        wx.showToast({
                            title: '用户名或密码错误'
                        })
                    }
                }
            },
            fail: function (res) {

            },
            complete: function () {

            }
        })
    }
});
