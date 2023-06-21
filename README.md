# 前端埋点上报

``` 1
/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @sdkVersion 版本
 * @extra 透传字段
 * @jsError js和promise 报错异常上报
 */
export interface DefaultOptions{
    uuid: string | undefined,
    requestUrl: string | undefined,
    historyTracker: boolean,
    hashTracker: boolean,
    domTracker: boolean,
    sdkVersion: string | number,
    extra: Record<string,any> | undefined,
    jsError: boolean
}
```

[]: 原作者视频教程	"https://www.bilibili.com/video/BV1Fa411T7uY?p=1&amp;vd_source=03cd14ff3f045b89506776ef3b09b0d0"

