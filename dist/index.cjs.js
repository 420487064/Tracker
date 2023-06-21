'use strict';

var TrackerConfig;
(function (TrackerConfig) {
    TrackerConfig["version"] = "1.0.0";
})(TrackerConfig || (TrackerConfig = {}));

/**
 *  对事件截获，重写事件
 */
const createHistoryEvent = (type) => {
    const origin = history[type];
    return function () {
        const res = origin.apply(this, arguments);
        const e = new Event(type);
        window.dispatchEvent(e);
        return res;
    };
};

let MouseEventList = ['click', 'dbclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover'];
class Tracker {
    constructor(options) {
        this.data = Object.assign(this.initDef(), options);
        this.installTracker();
    }
    initDef() {
        window.history['pushState'] = createHistoryEvent('pushState');
        window.history['replaceState'] = createHistoryEvent('replaceState');
        return {
            sdkVersion: TrackerConfig.version,
            hashTracker: false,
            historyTracker: false,
            jsError: false,
            domTracker: false,
        };
    }
    // 设置ID
    setUserId(uuid) {
        this.data.uuid = uuid;
    }
    // 提供扩展
    setExtra(extra) {
        this.data.extra = extra;
    }
    // 手动上报
    sendTracker(data) {
        this.reportTracker(data);
    }
    // 对设置了Attribute属性的dom操作进行监听
    targetKeyReport() {
        MouseEventList.forEach(ev => {
            window.addEventListener(ev, (e) => {
                const target = e.target;
                const targetKey = target.getAttribute('target-key'); // 可修改Attribute值
                if (targetKey) {
                    this.reportTracker({
                        event: ev,
                        targetKey: targetKey,
                    });
                }
            });
        });
    }
    // 对bom 操作进行监听
    captureEvents(mouseEventList, targetKey, data) {
        mouseEventList.forEach(event => {
            window.addEventListener(event, () => {
                // console.log("监听到了");
                this.reportTracker({
                    event,
                    targetKey,
                    data
                });
            });
        });
    }
    // 初始化
    installTracker() {
        if (this.data.historyTracker) {
            this.captureEvents(['pushState', 'replaceState', 'popstate'], 'history-pv');
        }
        if (this.data.hashTracker) {
            this.captureEvents(['hashchange'], 'history-pv');
        }
        // 监听dom
        if (this.data.domTracker) {
            this.targetKeyReport();
        }
        // 上报错误
        if (this.data.jsError) {
            this.jsError();
        }
    }
    jsError() {
        this.errorEvent();
        this.promiseReject();
    }
    // 监听js报错
    errorEvent() {
        window.addEventListener("error", (event) => {
            this.reportTracker({
                event: "error",
                targetKey: "message",
                message: event.message
            });
        });
    }
    // 监听 promise 报错
    promiseReject() {
        window.addEventListener('unhandledrejection', event => {
            event.promise.catch(error => {
                this.reportTracker({
                    event: "promise",
                    targetKey: "message",
                    message: error
                });
            });
        });
    }
    // 上报
    reportTracker(data) {
        const params = Object.assign(this.data, data, { time: new Date().getTime() });
        let headers = {
            type: 'application/x-www-form-urlencoded'
        };
        let blob = new Blob([JSON.stringify(params)], headers);
        navigator.sendBeacon(this.data.requestUrl, blob);
    }
}

module.exports = Tracker;
