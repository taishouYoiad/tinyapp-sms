var util = require('../../components/util.js')
Page({
    data: {
        chats: []
    },
    updateChats: function (msgdata) {
        let chats = [...this.data.chats];
        let index = -1;
        for (let i = 0, len = chats.length; i < len; i++) {
            let e = chats[i];
            if (e.contact === msgdata.contact) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            chats[index] = msgdata;
        } else {
            chats.push(msgdata);
        }
        chats.sort((p, n) => p.time < n.time);
        this.setData({ chats });
    },
    onShow: function () {
        let chats = wx.getStorageSync('chats');
        let now = new Date();
        if (chats) {
            chats = chats.map((item, index) => {
                // let time = new Date(item.time);
                // item.time = util.formatTime(time, now);
                return item;
            });
            this.setData({ chats });
        }
    },
    onLoad: function () {

    },
    handleTouchstartList: function (e) {
        console.log(e.target);
    },
    handleTouchendList: function (e) {
        console.log('end', e);
    }
});