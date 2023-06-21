import { DefaultOptions, TrackerConfig, Options, } from "../types/index";
import { createHistoryEvent } from "../utils/pv";

let MouseEventList:string[] = ['click','dbclick','contextmenu','mousedown','mouseup','mouseenter','mouseout','mouseover']
export default class Tracker{
    public data:Options;
    constructor(options:Options){
        this.data = Object.assign(this.initDef(),options);
        this.installTracker()
    }

    private initDef():DefaultOptions{
        window.history['pushState'] = createHistoryEvent('pushState')
        window.history['replaceState'] = createHistoryEvent('replaceState')
         return <DefaultOptions>{
            sdkVersion:TrackerConfig.version,
            hashTracker:false,
            historyTracker:false,
            jsError:false,
            domTracker:false,
         }
    }
    // 设置ID
    public setUserId <T extends DefaultOptions['uuid']>(uuid:T){
        this.data.uuid = uuid;
    }

    // 提供扩展
    public setExtra <T extends DefaultOptions['extra']>(extra:T){
        this.data.extra = extra;
    }

    // 手动上报
    public sendTracker<T>(data:T){
        this.reportTracker(data)
    }

    // 对设置了Attribute属性的dom操作进行监听
    private targetKeyReport(){
        MouseEventList.forEach(ev =>{
            window.addEventListener(ev,(e) =>{
                const target = e.target as HTMLElement;
                const targetKey = target.getAttribute('target-key'); // 可修改Attribute值
                if (targetKey) {
                    this.reportTracker({
                        event:ev,
                        targetKey:targetKey,
                    })
                }
            })
        })
    }

    // 对bom 操作进行监听
    private captureEvents<T>(mouseEventList:string[],targetKey:string,data?:T){
        mouseEventList.forEach(event => {
            window.addEventListener(event,()=>{
                // console.log("监听到了");
                this.reportTracker({
                    event,
                    targetKey,
                    data
                })
            })
        });
    }

    // 初始化
    private installTracker(){
        if (this.data.historyTracker) {
            this.captureEvents(['pushState','replaceState','popstate'],'history-pv')           
        }
        if (this.data.hashTracker) {
            this.captureEvents(['hashchange'],'history-pv')
        }
        // 监听dom
        if (this.data.domTracker) {
            this.targetKeyReport()
        }
        // 上报错误
        if (this.data.jsError) {
            this.jsError()
        }
    }

    private jsError(){
        this.errorEvent();
        this.promiseReject();
    }

    // 监听js报错
    private errorEvent(){
        window.addEventListener("error",(event)=>{
            this.reportTracker({
                event:"error",
                targetKey:"message",
                message:event.message
            })
        })
    }

    // 监听 promise 报错
    private promiseReject(){
        window.addEventListener('unhandledrejection',event =>{
            event.promise.catch(error =>{
                this.reportTracker({
                    event:"promise",
                    targetKey:"message",
                    message:error
                })
            })
        })
    }

    // 上报
    private reportTracker<T>(data:T){
        const params = Object.assign(this.data,data,{ time: new Date().getTime()})
        let headers = {
            type: 'application/x-www-form-urlencoded'   
        }
        let blob = new Blob([JSON.stringify(params)],headers)
       
        navigator.sendBeacon(this.data.requestUrl,blob);
    }
}