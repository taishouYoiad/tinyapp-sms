var storage = require('./storage.js');
class WebSocket {
    constructor(url) {
        this.url = url || this.url;
        this.reconnectTime = 2000;  // 重连 delay
        this.connected = false;
        this.autoconnect = true;
        this.connectSocket = this.connectSocket.bind(this);
        this.closeSocket = this.closeSocket.bind(this);
        this.sendSocketMessage = this.sendSocketMessage.bind(this);

        this.onSocketOpen = this.onSocketOpen.bind(this);
        this.onSocketError = this.onSocketError.bind(this);
        this.onSocketMessage = this.onSocketMessage.bind(this);
        this.onSocketClose = this.onSocketClose.bind(this);
        wx.onSocketOpen(this.onSocketOpen);
        wx.onSocketError(this.onSocketError);
        wx.onSocketMessage(this.onSocketMessage);
        wx.onSocketClose(this.onSocketClose);
        this.ukey = '';
    }

    connectSocket() {
        wx.connectSocket({ url: this.url });
    }

    closeSocket() {
        wx.closeSocket();
    }

    sendSocketMessage(data, success) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        wx.sendSocketMessage({ data, success });
    }

    onSocketOpen(res) {
        this.connected = true;
        if (this.ukey) {
            console.log(this.ukey);
            this.sendSocketMessage({ type: 'REGIST', ukey: this.ukey }, function () {
                console.log('registed');
            });
        }
    }

    onSocketError(res) {
        console.log('WebSocket Error', res);
    }

    onSocketMessage(res) {
        const data = JSON.parse(res.data);
        switch (data.type) {
            case "DELIVER":
                //{content: "Hello world!", time: 1478679777445, type: "DELIVER", contact: "1064830418526"}
                // let msgdata = Object.assign({}, data, { direction: 'from', unread: true });
                let msgdata = {
                    content: data.content,
                    time: data.time,
                    contact: data.contact,
                    direction: 'from',
                    unread: true
                };
                storage.pushMessageStorage(msgdata);
                const pages = getCurrentPages();
                pages.map(e => {
                    if (e.__route__ === 'pages/chat/chat') {
                        let pagedata = e.data;
                        if (pagedata.number === msgdata.contact) {
                            e.pushMsgs(msgdata);
                            const chatsStorage = new storage.ChatsStorage();
                            chatsStorage.read(pagedata.number);
                        }
                    } else if (e.__route__ === 'pages/chats/chats') {
                        e.updateChats(msgdata);
                    }
                });
                break;
        }
        console.log('WebSocket Message');
    }

    onSocketClose(res) {
        // console.log('WebSocket Close', res);
        this.connected = false;
        this.connectSocket();
    }
}
module.exports = WebSocket;