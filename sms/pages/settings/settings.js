Page({
    data: {
        name: '--'
    },
    handleCloseWebsocket: function() {
        const app = getApp();
        const appData = app.appData;
        appData.webSocket.closeSocket();
    },
    handleOpenWebsocket: function() {
        const app = getApp();
        const appData = app.appData;
        appData.webSocket.connectSocket();
    },
    handleClearStorage: function () {
        wx.showModal({
            title: '提示',
            content: '确定要删除所有数据吗',
            success: function (res) {
                if (res.confirm) {
                    wx.clearStorage();
                }
            }
        });
    },
    handleLogout: function () {
        const app = getApp();
        const appData = app.appData;
        if (appData.ukey) {
            wx.showModal({
                title: '提示',
                content: '确定要退出登录吗',
                success: function (res) {
                    if (res.confirm) {
                        appData.ukey = '';
                        appData.code = '';
                        appData.name = '';
                        appData.webSocket.sendSocketMessage({ type: 'UNBIND' }, function () {
                            wx.navigateTo({ url: '/pages/bind/bind' });
                        });
                    }
                }
            });
        } else {
            wx.navigateTo({ url: '/pages/bind/bind' });
        }
    },
    onShow: function () {
        const app = getApp();
        const appData = app.appData;
        this.setData({ name: appData.name || '--' });
    }
})