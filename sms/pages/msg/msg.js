var util = require('../../components/util.js');
var storage = require('../../components/storage.js');
Page({
    data: {
        number: '',
        content: '',
        number_invalid: false,
        content_invalid: false
    },
    onLoad: function () {
    },
    handleSubmit: function (e) {
        const app = getApp();
        const appData = app.appData;
        if (appData.ukey) {
            const formdata = e.detail.value;
            if (formdata) {
                const numberReg = /^\d{13}$/;
                let number_invalid = !formdata.number;
                number_invalid = number_invalid || !numberReg.test(formdata.number);
                this.setData({
                    number_invalid: number_invalid,
                    content_invalid: !formdata.content
                });
                if (!this.data.number_invalid && !this.data.content_invalid) {
                    const that = this;
                    wx.request({
                        url: `https://${appData.hostname}/sms/api/mp/send`,
                        data: {
                            number: formdata.number,
                            content: formdata.content,
                            ukey: appData.ukey
                        },
                        // data: util.json2Form({
                        //     number: formdata.number,
                        //     content: formdata.content,
                        //     ukey: appData.ukey
                        // }),
                        // method: 'POST',
                        // header: {
                        //     'Accept': 'application/json, text/plain, */*',
                        //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                        // },
                        success: function (res) {
                            // {canSend: 81, code: 0, msg: "成功"}
                            if (res.data) {
                                wx.showToast({
                                    title: res.data.msg,
                                    success: function () {
                                        if (!res.data.code) {
                                            that.setData({
                                                number: '',
                                                content: ''
                                            });
                                            const msgdata = {
                                                'contact': formdata.number,
                                                'content': formdata.content,
                                                'time': new Date().getTime(),
                                                'direction': 'to',
                                                'unread': false
                                            };
                                            storage.pushMessageStorage(msgdata);
                                            wx.navigateTo({ url: '../chat/chat?number=' + formdata.number });
                                        }
                                    }
                                });
                            }
                        },
                        fail: function () {
                            console.error('fail');
                        },
                        complete: function () {
                            // complete
                        }
                    })
                }
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '请先绑定平台账号',
                success: function (res) {
                    if (res.confirm) {
                        wx.navigateTo({ url: '/pages/bind/bind' })
                    }
                }
            });
        }
    }
});
