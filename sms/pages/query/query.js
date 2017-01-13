Page({
    data: {
        number_invalid: false,
        userinfo: {
            onlinestate: '--',
            gprs: '--',
            balance: '--',
            sms: '--'
        },
        onlineinfo: {
            apn: '--',
            ip: '--',
            rat: '--',
            gprs: '--'
        },
        numberinfo: {
            msisdn: '--',
            imsi: '--',
            iccid: '--'
        },
        requestCount: 6
    },
    onLoad: function () {

    },
    handleSubmit: function (e) {
        // 不需要登录也（不）可以查询

        const app = getApp();
        const appData = app.appData;
        if (appData.ukey) {
            if (e.detail.value) {
                const formdata = {
                    number: e.detail.value.number
                };
                const numberReg = /^\d{13}$/;
                let number_invalid = !formdata.number;
                number_invalid = number_invalid || !numberReg.test(formdata.number);
                this.setData({
                    number_invalid: number_invalid
                });

                if (!this.data.number_invalid) {
                    const app = getApp();
                    const appData = app.appData;

                    const urlCardinfo = `https://${appData.hostname}/sms/api/mp/cardinfo`;
                    const urlGprsrealsingle = `https://${appData.hostname}/sms/api/mp/gprsrealsingle`;
                    const urlUserstatusrealsingle = `https://${appData.hostname}/sms/api/mp/userstatusrealsingle`;
                    const urlGprsusedinfosingle = `https://${appData.hostname}/sms/api/mp/gprsusedinfosingle`;
                    const urlBalancerealsingle = `https://${appData.hostname}/sms/api/mp/balancerealsingle`;
                    const urlSmsusedinfosingle = `https://${appData.hostname}/sms/api/mp/smsusedinfosingle`;
                    const data = {
                        number: formdata.number,
                        ukey: appData.ukey
                    }

                    const that = this;
                    that.setData({ requestCount: 0 });

                    that.queryRequest(urlCardinfo, data, function (numberinfo) {
                        that.setData({
                            numberinfo: {
                                msisdn: numberinfo.MSISDN,
                                imsi: numberinfo.IMSI,
                                iccid: numberinfo.ICCID
                            }
                        });
                    }, function () {
                        that.setData({ requestCount: that.data.requestCount + 1 });
                        that.queryRequest(urlGprsrealsingle, data, function (onlineinfo) {
                            that.setData({
                                onlineinfo: {
                                    apn: onlineinfo.APN,
                                    ip: onlineinfo.IP,
                                    rat: onlineinfo.RAT,
                                    gprs: onlineinfo.GPRSSTATUS == '00' ? '在线' : '离线'
                                }
                            });
                        }, function () {
                            that.setData({ requestCount: that.data.requestCount + 1 });
                        });
                    });


                    that.queryRequest(urlUserstatusrealsingle, data, function (userinfo) {
                        let onlinestate = '';
                        switch (userinfo.STATUS) {
                            case "00":
                                onlinestate = "正常";
                                break;
                            case "01":
                                onlinestate = "单项停机";
                                break;
                            case "02":
                                onlinestate = "停机";
                                break;
                            case "03":
                                onlinestate = "预销号";
                                break;
                            case "04":
                                onlinestate = "销号";
                                break;
                            case "05":
                                onlinestate = "过户";
                                break;
                            case "06":
                                onlinestate = "休眠";
                                break;
                            case "07":
                                onlinestate = "待激活";
                                break;
                            case "99":
                                onlinestate = "号码不存在";
                                break;
                        }
                        userinfo = {
                            balance: that.data.userinfo.balance,
                            gprs: that.data.userinfo.gprs,
                            onlinestate,
                            sms: that.data.userinfo.sms
                        };
                        that.setData({ userinfo });
                    }, function () {
                        that.setData({ requestCount: that.data.requestCount + 1 });
                        that.queryRequest(urlGprsusedinfosingle, data, function (userinfo) {
                            const gprs = userinfo.total_gprs;
                            userinfo = {
                                balance: that.data.userinfo.balance,
                                gprs,
                                onlinestate: that.data.userinfo.onlinestate,
                                sms: that.data.userinfo.sms
                            };
                            that.setData({ userinfo });
                        }, function () {
                            that.setData({ requestCount: that.data.requestCount + 1 });
                        });
                        that.queryRequest(urlBalancerealsingle, data, function (userinfo) {
                            const balance = userinfo.balance;
                            userinfo = {
                                balance,
                                gprs: that.data.userinfo.gprs,
                                onlinestate: that.data.userinfo.onlinestate,
                                sms: that.data.userinfo.sms
                            };
                            that.setData({ userinfo });
                        }, function () {
                            that.setData({ requestCount: that.data.requestCount + 1 });
                        });
                        that.queryRequest(urlSmsusedinfosingle, data, function (userinfo) {
                            const sms = userinfo.sms;
                            userinfo = {
                                balance: that.data.userinfo.balance,
                                gprs: that.data.userinfo.gprs,
                                onlinestate: that.data.userinfo.onlinestate,
                                sms
                            };
                            that.setData({ userinfo });
                        }, function () {
                            that.setData({ requestCount: that.data.requestCount + 1 });
                        });
                    });
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
    },
    queryRequest: function (url, data, successcallback, completecallback) {
        wx.request({
            url: url,
            method: 'GET',
            data: data,
            header: {
                'Content-Type': 'application/json'
            }, success: function (res) {
                if (res.data && res.data.result)
                    successcallback(res.data.result[0]);
            }, complete: function () {
                completecallback();
            }
        });
    }
});