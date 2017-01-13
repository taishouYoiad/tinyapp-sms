class ChatsStorage {
  constructor() {
    this.name = 'chats';
  }

  setData(data = []) {
    wx.setStorageSync(this.name, data);
  }

  getData() {
    return wx.getStorageSync(this.name) || [];
  }

  push(item = { contact: '', content: '', time: (new Date()).getTime(), unread: false }) {
    let chats = this.getData();

    let index = -1;
    chats.map((it, i) => {
      if (it.contact === item.contact) index = i;
    });

    if (index >= 0) chats[index] = item;
    else chats.push(item);

    chats.sort((p, n) => p.time < n.time);
    this.setData(chats);
  }

  read(contact) {
    let chats = this.getData();
    let index = -1;
    chats.map((item, i) => {
      if (item.contact === contact) index = i;
    });
    if (index >= 0) chats[index].unread = false;
    this.setData(chats);
  }
}

class LogsStorage {
  constructor() {
    this.name = 'logs';
  }

  setData(data = {}) {
    wx.setStorageSync(this.name, data);
  }

  getData() {
    return wx.getStorageSync(this.name) || {};
  }

  push(item = {contact: '', content: '', time: (new Date()).getTime(), direction: 'from' }) {
    let logs = this.getData();
    const contact = item.contact;
    delete item.contact;
    let chats = logs[contact] || [];
    chats.push(item);
    logs[contact] = chats;
    this.setData(logs);
  }
}

function pushMessageStorage(data) {
  let chatsStorage = new ChatsStorage();
  let logStorage = new LogsStorage();
  const chatItem = {
    content: data.content,
    contact: data.contact,
    direction: data.direction,
    time: data.time,
    unread: data.unread
  };
  const logItem = {
    content: data.content,
    contact: data.contact,
    direction: data.direction,
    time: data.time,
    unread: data.unread
  };
  chatsStorage.push(chatItem);
  logStorage.push(logItem);
}

module.exports = {
  ChatsStorage,
  LogsStorage,
  pushMessageStorage
}