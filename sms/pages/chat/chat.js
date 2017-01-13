var util = require('../../components/util.js');
var storage = require('../../components/storage.js');
Page({
    data: {
        msgs: [],
        number: '',
        content: '',
        content_invalid: true
    },
    pushMsgs: function (msgdata) {
        this.setData({ 'msgs': [...this.data.msgs, msgdata] });
    },
    onLoad: function (options) {
        const logsStorage = new storage.LogsStorage();
        const logs = logsStorage.getData();
        const msgs = logs[options.number] || [];
        this.setData({ msgs, number: options.number });

        const chatsStorage = new storage.ChatsStorage();
        chatsStorage.read(options.number);
    },
    onReady: function () {
        wx.setNavigationBarTitle({
            title: this.data.number
        });
    },
    handleSelect: function() {
        wx.showActionSheet({
            itemList: ['item1', 'item2', 'item3'],
            success: function(e) {
                console.log(e);
            }
        });
    },
    handleChange: function(e) {
        const content_invalid = e.detail.cursor === 0;
        if(this.data.content_invalid !== content_invalid){
            this.setData({content_invalid});
        }
    },
    handleSubmit: function (e) {
        const app = getApp();
        const appData = app.appData;
        if (appData.ukey) {
            const formdata = e.detail.value;
            if (formdata && formdata.content) {
                const that = this;
                wx.request({
                    url: `https://${appData.hostname}/sms/api/mp/send`,
                    data: {
                        number: this.data.number,
                        content: formdata.content,
                        ukey: appData.ukey
                    },
                    // data: util.json2Form({
                    //     number: this.data.number,
                    //     content: formdata.content,
                    //     ukey: appData.ukey
                    // }),
                    // method: 'POST',
                    // header: {
                    //     'Accept': 'application/json, text/plain, */*',
                    //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    // },
                    success: function (res) {
                        if (res.data) {
                            wx.showToast({
                                title: res.data.msg
                            });
                            if (!res.data.code) {
                                const msgdata = {
                                    'contact': that.data.number,
                                    'content': formdata.content,
                                    'time': new Date().getTime(),
                                    'direction': 'to',
                                    'unread': false
                                };
                                storage.pushMessageStorage(msgdata);
                                that.pushMsgs(msgdata);
                            }
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
})
;
