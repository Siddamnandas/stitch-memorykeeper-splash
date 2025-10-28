var Z=Object.defineProperty;var J=(e,t,r)=>t in e?Z(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var N=(e,t,r)=>J(e,typeof t!="symbol"?t+"":t,r);function X(e,t){for(var r=0;r<t.length;r++){const n=t[r];if(typeof n!="string"&&!Array.isArray(n)){for(const o in n)if(o!=="default"&&!(o in e)){const a=Object.getOwnPropertyDescriptor(n,o);a&&Object.defineProperty(e,o,a.get?a:{enumerable:!0,get:()=>n[o]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}function Q(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function pt(e){if(e.__esModule)return e;var t=e.default;if(typeof t=="function"){var r=function n(){return this instanceof n?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};r.prototype=t.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(e).forEach(function(n){var o=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(r,n,o.get?o:{enumerable:!0,get:function(){return e[n]}})}),r}var j={exports:{}},S={},P={exports:{}},c={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var g=Symbol.for("react.element"),ee=Symbol.for("react.portal"),te=Symbol.for("react.fragment"),re=Symbol.for("react.strict_mode"),ne=Symbol.for("react.profiler"),oe=Symbol.for("react.provider"),ae=Symbol.for("react.context"),se=Symbol.for("react.forward_ref"),ce=Symbol.for("react.suspense"),ie=Symbol.for("react.memo"),ue=Symbol.for("react.lazy"),M=Symbol.iterator;function le(e){return e===null||typeof e!="object"?null:(e=M&&e[M]||e["@@iterator"],typeof e=="function"?e:null)}var I={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},D=Object.assign,L={};function m(e,t,r){this.props=e,this.context=t,this.refs=L,this.updater=r||I}m.prototype.isReactComponent={};m.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};m.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function U(){}U.prototype=m.prototype;function x(e,t,r){this.props=e,this.context=t,this.refs=L,this.updater=r||I}var b=x.prototype=new U;b.constructor=x;D(b,m.prototype);b.isPureReactComponent=!0;var C=Array.isArray,q=Object.prototype.hasOwnProperty,T={current:null},H={key:!0,ref:!0,__self:!0,__source:!0};function V(e,t,r){var n,o={},a=null,l=null;if(t!=null)for(n in t.ref!==void 0&&(l=t.ref),t.key!==void 0&&(a=""+t.key),t)q.call(t,n)&&!H.hasOwnProperty(n)&&(o[n]=t[n]);var u=arguments.length-2;if(u===1)o.children=r;else if(1<u){for(var s=Array(u),d=0;d<u;d++)s[d]=arguments[d+2];o.children=s}if(e&&e.defaultProps)for(n in u=e.defaultProps,u)o[n]===void 0&&(o[n]=u[n]);return{$$typeof:g,type:e,key:a,ref:l,props:o,_owner:T.current}}function de(e,t){return{$$typeof:g,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function O(e){return typeof e=="object"&&e!==null&&e.$$typeof===g}function pe(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(r){return t[r]})}var A=/\/+/g;function R(e,t){return typeof e=="object"&&e!==null&&e.key!=null?pe(""+e.key):t.toString(36)}function w(e,t,r,n,o){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var l=!1;if(e===null)l=!0;else switch(a){case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case g:case ee:l=!0}}if(l)return l=e,o=o(l),e=n===""?"."+R(l,0):n,C(o)?(r="",e!=null&&(r=e.replace(A,"$&/")+"/"),w(o,t,r,"",function(d){return d})):o!=null&&(O(o)&&(o=de(o,r+(!o.key||l&&l.key===o.key?"":(""+o.key).replace(A,"$&/")+"/")+e)),t.push(o)),1;if(l=0,n=n===""?".":n+":",C(e))for(var u=0;u<e.length;u++){a=e[u];var s=n+R(a,u);l+=w(a,t,r,s,o)}else if(s=le(e),typeof s=="function")for(e=s.call(e),u=0;!(a=e.next()).done;)a=a.value,s=n+R(a,u++),l+=w(a,t,r,s,o);else if(a==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return l}function E(e,t,r){if(e==null)return e;var n=[],o=0;return w(e,n,"","",function(a){return t.call(r,a,o++)}),n}function ye(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(r){(e._status===0||e._status===-1)&&(e._status=1,e._result=r)},function(r){(e._status===0||e._status===-1)&&(e._status=2,e._result=r)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var y={current:null},v={transition:null},fe={ReactCurrentDispatcher:y,ReactCurrentBatchConfig:v,ReactCurrentOwner:T};function z(){throw Error("act(...) is not supported in production builds of React.")}c.Children={map:E,forEach:function(e,t,r){E(e,function(){t.apply(this,arguments)},r)},count:function(e){var t=0;return E(e,function(){t++}),t},toArray:function(e){return E(e,function(t){return t})||[]},only:function(e){if(!O(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};c.Component=m;c.Fragment=te;c.Profiler=ne;c.PureComponent=x;c.StrictMode=re;c.Suspense=ce;c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=fe;c.act=z;c.cloneElement=function(e,t,r){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var n=D({},e.props),o=e.key,a=e.ref,l=e._owner;if(t!=null){if(t.ref!==void 0&&(a=t.ref,l=T.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var u=e.type.defaultProps;for(s in t)q.call(t,s)&&!H.hasOwnProperty(s)&&(n[s]=t[s]===void 0&&u!==void 0?u[s]:t[s])}var s=arguments.length-2;if(s===1)n.children=r;else if(1<s){u=Array(s);for(var d=0;d<s;d++)u[d]=arguments[d+2];n.children=u}return{$$typeof:g,type:e.type,key:o,ref:a,props:n,_owner:l}};c.createContext=function(e){return e={$$typeof:ae,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:oe,_context:e},e.Consumer=e};c.createElement=V;c.createFactory=function(e){var t=V.bind(null,e);return t.type=e,t};c.createRef=function(){return{current:null}};c.forwardRef=function(e){return{$$typeof:se,render:e}};c.isValidElement=O;c.lazy=function(e){return{$$typeof:ue,_payload:{_status:-1,_result:e},_init:ye}};c.memo=function(e,t){return{$$typeof:ie,type:e,compare:t===void 0?null:t}};c.startTransition=function(e){var t=v.transition;v.transition={};try{e()}finally{v.transition=t}};c.unstable_act=z;c.useCallback=function(e,t){return y.current.useCallback(e,t)};c.useContext=function(e){return y.current.useContext(e)};c.useDebugValue=function(){};c.useDeferredValue=function(e){return y.current.useDeferredValue(e)};c.useEffect=function(e,t){return y.current.useEffect(e,t)};c.useId=function(){return y.current.useId()};c.useImperativeHandle=function(e,t,r){return y.current.useImperativeHandle(e,t,r)};c.useInsertionEffect=function(e,t){return y.current.useInsertionEffect(e,t)};c.useLayoutEffect=function(e,t){return y.current.useLayoutEffect(e,t)};c.useMemo=function(e,t){return y.current.useMemo(e,t)};c.useReducer=function(e,t,r){return y.current.useReducer(e,t,r)};c.useRef=function(e){return y.current.useRef(e)};c.useState=function(e){return y.current.useState(e)};c.useSyncExternalStore=function(e,t,r){return y.current.useSyncExternalStore(e,t,r)};c.useTransition=function(){return y.current.useTransition()};c.version="18.3.1";P.exports=c;var p=P.exports;const G=Q(p),yt=X({__proto__:null,default:G},[p]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var he=p,me=Symbol.for("react.element"),_e=Symbol.for("react.fragment"),ge=Object.prototype.hasOwnProperty,Ee=he.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,ke={key:!0,ref:!0,__self:!0,__source:!0};function F(e,t,r){var n,o={},a=null,l=null;r!==void 0&&(a=""+r),t.key!==void 0&&(a=""+t.key),t.ref!==void 0&&(l=t.ref);for(n in t)ge.call(t,n)&&!ke.hasOwnProperty(n)&&(o[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps,t)o[n]===void 0&&(o[n]=t[n]);return{$$typeof:me,type:e,key:a,ref:l,props:o,_owner:Ee.current}}S.Fragment=_e;S.jsx=F;S.jsxs=F;j.exports=S;var f=j.exports;const we={view:"home",gameView:null,detailView:null,memories:[],memoryStrength:75,isRecording:!1,dailyPrompt:"What did your childhood kitchen smell like?",journalInput:"",showOnboarding:!1,onboardingStep:0,speechTranscript:"",streakCount:0,lastEntryDate:null,language:"en",activities:[],isOnline:navigator.onLine,syncStatus:"idle",lastSyncTime:null,pendingChanges:0},ve=e=>{if(typeof window>"u")return e;const t=window.localStorage.getItem("hasSeenOnboarding"),r=window.localStorage.getItem("memoryKeeperStreakCount"),n=window.localStorage.getItem("memoryKeeperLastEntryDate");let o=e.streakCount;if(r){const a=parseInt(r,10);Number.isNaN(a)||(o=a)}return{...e,showOnboarding:!t,streakCount:o,lastEntryDate:n??e.lastEntryDate}},Se=(e,t)=>{switch(t.type){case"SET_VIEW":return{...e,view:t.payload};case"SET_GAME_VIEW":return{...e,gameView:t.payload};case"SET_DETAIL_VIEW":return{...e,detailView:t.payload};case"SET_MEMORIES":return{...e,memories:t.payload};case"ADD_MEMORY":return{...e,memories:[t.payload,...e.memories],journalInput:"",pendingChanges:e.pendingChanges+1};case"UPDATE_MEMORY_STRENGTH":return{...e,memoryStrength:t.payload};case"SET_IS_RECORDING":return{...e,isRecording:t.payload};case"SET_DAILY_PROMPT":return{...e,dailyPrompt:t.payload};case"SET_JOURNAL_INPUT":return{...e,journalInput:t.payload};case"SET_SHOW_ONBOARDING":return{...e,showOnboarding:t.payload};case"SET_ONBOARDING_STEP":return{...e,onboardingStep:t.payload};case"SET_SPEECH_TRANSCRIPT":return{...e,speechTranscript:t.payload};case"SET_LANGUAGE":return{...e,language:t.payload};case"COMPLETE_ONBOARDING":return{...e,showOnboarding:!1,onboardingStep:0};case"RESET_JOURNAL_INPUT":return{...e,journalInput:""};case"SET_STREAK_COUNT":{const r=Math.max(0,t.payload);return typeof window<"u"&&window.localStorage.setItem("memoryKeeperStreakCount",String(r)),{...e,streakCount:r}}case"SET_LAST_ENTRY_DATE":return typeof window<"u"&&(t.payload?window.localStorage.setItem("memoryKeeperLastEntryDate",t.payload):window.localStorage.removeItem("memoryKeeperLastEntryDate")),{...e,lastEntryDate:t.payload};case"SET_ONLINE_STATUS":return{...e,isOnline:t.payload};case"SET_SYNC_STATUS":return{...e,syncStatus:t.payload};case"SET_LAST_SYNC_TIME":return{...e,lastSyncTime:t.payload};case"SET_PENDING_CHANGES":return{...e,pendingChanges:t.payload};case"INCREMENT_PENDING_CHANGES":return{...e,pendingChanges:e.pendingChanges+1};case"DECREMENT_PENDING_CHANGES":return{...e,pendingChanges:Math.max(0,e.pendingChanges-1)};default:return e}},W=G.createContext(null),ft=({children:e})=>{const[t,r]=p.useReducer(Se,we,ve);return p.useEffect(()=>{const n=()=>{r({type:"SET_ONLINE_STATUS",payload:!0}),r({type:"SET_SYNC_STATUS",payload:"idle"})},o=()=>{r({type:"SET_ONLINE_STATUS",payload:!1}),r({type:"SET_SYNC_STATUS",payload:"offline"})};return window.addEventListener("online",n),window.addEventListener("offline",o),r({type:"SET_ONLINE_STATUS",payload:navigator.onLine}),()=>{window.removeEventListener("online",n),window.removeEventListener("offline",o)}},[]),f.jsx(W.Provider,{value:{state:t,dispatch:r},children:e})},ht=()=>{const e=p.useContext(W);if(e===null)throw new Error("useAppState must be used within an AppStateProvider");return e};class k{static handleSupabaseError(t){var r,n,o,a;return t?t.code==="PGRST116"?{type:"NOT_FOUND",message:"Resource not found",originalError:t,timestamp:new Date}:t.code==="23505"?{type:"VALIDATION_ERROR",message:"Data validation failed",originalError:t,timestamp:new Date}:(r=t.message)!=null&&r.includes("Failed to fetch")||(n=t.message)!=null&&n.includes("NetworkError")?{type:"NETWORK_ERROR",message:"Network connection failed. Please check your internet connection.",originalError:t,timestamp:new Date}:(o=t.message)!=null&&o.includes("Invalid login credentials")||(a=t.message)!=null&&a.includes("Email not confirmed")?{type:"AUTH_ERROR",message:"Authentication failed. Please check your credentials.",originalError:t,timestamp:new Date}:{type:"SERVER_ERROR",message:t.message||"Server error occurred",originalError:t,timestamp:new Date}:{type:"UNKNOWN_ERROR",message:"An unknown error occurred",timestamp:new Date}}static handleGenericError(t){return t?t instanceof TypeError&&t.message.includes("Failed to fetch")?{type:"NETWORK_ERROR",message:"Network connection failed. Please check your internet connection.",originalError:t,timestamp:new Date}:t.name==="ValidationError"?{type:"VALIDATION_ERROR",message:t.message||"Data validation failed",originalError:t,timestamp:new Date}:{type:"UNKNOWN_ERROR",message:t.message||"An unexpected error occurred",originalError:t,timestamp:new Date}:{type:"UNKNOWN_ERROR",message:"An unknown error occurred",timestamp:new Date}}static getFriendlyMessage(t){switch(t.type){case"NETWORK_ERROR":return"Please check your internet connection and try again.";case"AUTH_ERROR":return"Please check your credentials and try again.";case"VALIDATION_ERROR":return"Please check your input and try again.";case"NOT_FOUND":return"The requested resource was not found.";case"SERVER_ERROR":return"Our servers are experiencing issues. Please try again later.";case"UNKNOWN_ERROR":default:return"Something went wrong. Please try again."}}}class _{static subscribe(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(r=>r!==t)}}static addToast(t){const r={...t,id:Math.random().toString(36).substr(2,9)};this.toasts=[...this.toasts,r],this.notifyListeners(),t.duration!==0&&setTimeout(()=>{this.removeToast(r.id)},t.duration||5e3)}static removeToast(t){this.toasts=this.toasts.filter(r=>r.id!==t),this.notifyListeners()}static getToasts(){return this.toasts}static notifyListeners(){this.listeners.forEach(t=>t(this.toasts))}}N(_,"toasts",[]),N(_,"listeners",[]);const K=p.createContext(null),mt=({children:e})=>{const[t,r]=p.useState([]);console.log("ErrorProvider initialized",{toasts:t}),p.useEffect(()=>{const s=_.subscribe(d=>{r(d)});return()=>{s()}},[]);const n=s=>{_.addToast(s)},u={toasts:t,addToast:n,removeToast:s=>{_.removeToast(s)},handleError:(s,d)=>{const h=k.handleGenericError(s),Y=k.getFriendlyMessage(h);n({type:"error",title:"Error",message:d||h.message||Y,duration:7e3}),console.error("Application Error:",h)},handleSupabaseError:s=>{if(!s)return;const d=k.handleSupabaseError(s),h=k.getFriendlyMessage(d);n({type:"error",title:"Database Error",message:d.message||h,duration:7e3}),console.error("Supabase Error:",d)}};return f.jsx(K.Provider,{value:u,children:e})},Ne=()=>{const e=p.useContext(K);if(e===null)throw new Error("useError must be used within an ErrorProvider");return console.log("useError called",e.toasts),e},_t=()=>{const{toasts:e,removeToast:t}=Ne();return console.log("ToastContainer rendering",{toasts:e}),e.length===0?null:f.jsx("div",{className:"fixed top-4 right-4 z-50 space-y-2",children:e.map(r=>f.jsxs("div",{className:`
            max-w-md w-full rounded-2xl p-4 shadow-lg backdrop-blur-xl border transition-all duration-300
            ${r.type==="success"?"bg-green-100 border-green-200 text-green-800":""}
            ${r.type==="error"?"bg-red-100 border-red-200 text-red-800":""}
            ${r.type==="warning"?"bg-yellow-100 border-yellow-200 text-yellow-800":""}
            ${r.type==="info"?"bg-blue-100 border-blue-200 text-blue-800":""}
          `,children:[f.jsxs("div",{className:"flex justify-between items-start",children:[f.jsxs("div",{children:[f.jsx("h3",{className:"font-bold text-sm",children:r.title}),f.jsx("p",{className:"text-sm mt-1",children:r.message})]}),f.jsx("button",{onClick:()=>t(r.id),className:"ml-4 text-gray-500 hover:text-gray-700","aria-label":"Close notification",children:f.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:f.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),f.jsx("div",{className:"mt-2 w-full bg-gray-200 rounded-full h-1",children:f.jsx("div",{className:`
                h-1 rounded-full
                ${r.type==="success"?"bg-green-500":""}
                ${r.type==="error"?"bg-red-500":""}
                ${r.type==="warning"?"bg-yellow-500":""}
                ${r.type==="info"?"bg-blue-500":""}
              `,style:{width:"100%",animation:`toast-timer ${r.duration||5e3}ms linear forwards`}})})]},r.id))})};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),xe=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,n)=>n?n.toUpperCase():r.toLowerCase()),$=e=>{const t=xe(e);return t.charAt(0).toUpperCase()+t.slice(1)},B=(...e)=>e.filter((t,r,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===r).join(" ").trim(),be=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Te={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=p.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:o="",children:a,iconNode:l,...u},s)=>p.createElement("svg",{ref:s,...Te,width:t,height:t,stroke:e,strokeWidth:n?Number(r)*24/Number(t):r,className:B("lucide",o),...!a&&!be(u)&&{"aria-hidden":"true"},...u},[...l.map(([d,h])=>p.createElement(d,h)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=(e,t)=>{const r=p.forwardRef(({className:n,...o},a)=>p.createElement(Oe,{ref:a,iconNode:t,className:B(`lucide-${Re($(e))}`,`lucide-${e}`,n),...o}));return r.displayName=$(e),r};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],gt=i("arrow-down",Me);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],Et=i("arrow-up",Ce);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],kt=i("book-open",Ae);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],wt=i("bot",$e);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],vt=i("calendar",je);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],St=i("chevron-left",Pe);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Nt=i("chevron-right",Ie);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],Rt=i("circle-check-big",De);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],xt=i("circle-question-mark",Le);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],bt=i("clock",Ue);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Tt=i("eye",qe);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],Ot=i("file-text",He);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]],Mt=i("gamepad-2",Ve);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]],Ct=i("heart",ze);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],At=i("house",Ge);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],$t=i("image",Fe);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]],jt=i("lightbulb",We);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]],Pt=i("message-square",Ke);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["rect",{x:"9",y:"2",width:"6",height:"13",rx:"3",key:"s6n7sd"}]],It=i("mic",Be);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Dt=i("plus",Ye);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],Lt=i("rotate-ccw",Ze);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],Ut=i("share-2",Je);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],qt=i("sparkles",Xe);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],Ht=i("star",Qe);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],Vt=i("target",et);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]],zt=i("trophy",tt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],Gt=i("upload",rt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],Ft=i("user",nt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],Wt=i("volume-2",ot);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Kt=i("x",at);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],Bt=i("zap",st),ct="/api/ai";async function it(e){if(!e.ok){const t=await e.json().catch(()=>({})),r=t&&t.error||t&&t.message||`AI proxy error (${e.status})`;throw new Error(r)}return e.json()}const ut=e=>new Promise(t=>setTimeout(t,e));async function lt(e,t=3,r=1e3){var n,o,a,l;for(let u=0;u<t;u++)try{return await e()}catch(s){const d=((n=s.message)==null?void 0:n.includes("429"))||((o=s.message)==null?void 0:o.includes("502"))||((a=s.message)==null?void 0:a.includes("503"))||((l=s.message)==null?void 0:l.includes("500"));if(u===t-1||!d)throw s;const h=r*Math.pow(2,u)+Math.random()*1e3;await ut(h)}throw new Error("Max retries exceeded")}const Yt=async(e,t={})=>lt(async()=>{const r=new FormData;r.append("mode","transcription"),r.append("file",e),t.language&&r.append("language",t.language),t.prompt&&r.append("prompt",t.prompt);const n=await fetch(ct,{method:"POST",body:r});return it(n)});export{Et as A,wt as B,xt as C,mt as E,Ot as F,Mt as G,Ct as H,$t as I,jt as L,Pt as M,Dt as P,yt as R,Ht as S,zt as T,Ft as U,Wt as V,Kt as X,Bt as Z,Nt as a,Lt as b,St as c,kt as d,Rt as e,bt as f,pt as g,qt as h,vt as i,f as j,gt as k,Vt as l,G as m,Ne as n,Yt as o,It as p,Ut as q,p as r,At as s,ft as t,ht as u,_t as v,Gt as w,Tt as x};
//# sourceMappingURL=ai-studio-Dqe0xBOf.js.map
