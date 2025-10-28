var Se=Object.defineProperty;var Me=(e,t,o)=>t in e?Se(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o;var V=(e,t,o)=>Me(e,typeof t!="symbol"?t+"":t,o);function Ee(e,t){for(var o=0;o<t.length;o++){const s=t[o];if(typeof s!="string"&&!Array.isArray(s)){for(const n in s)if(n!=="default"&&!(n in e)){const i=Object.getOwnPropertyDescriptor(s,n);i&&Object.defineProperty(e,n,i.get?i:{enumerable:!0,get:()=>s[n]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}var mn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function $e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function pn(e){if(e.__esModule)return e;var t=e.default;if(typeof t=="function"){var o=function s(){return this instanceof s?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};o.prototype=t.prototype}else o={};return Object.defineProperty(o,"__esModule",{value:!0}),Object.keys(e).forEach(function(s){var n=Object.getOwnPropertyDescriptor(e,s);Object.defineProperty(o,s,n.get?n:{enumerable:!0,get:function(){return e[s]}})}),o}var ie={exports:{}},D={},le={exports:{}},f={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R=Symbol.for("react.element"),Ce=Symbol.for("react.portal"),Ae=Symbol.for("react.fragment"),Te=Symbol.for("react.strict_mode"),Re=Symbol.for("react.profiler"),Pe=Symbol.for("react.provider"),Ie=Symbol.for("react.context"),Oe=Symbol.for("react.forward_ref"),ze=Symbol.for("react.suspense"),qe=Symbol.for("react.memo"),De=Symbol.for("react.lazy"),X=Symbol.iterator;function Le(e){return e===null||typeof e!="object"?null:(e=X&&e[X]||e["@@iterator"],typeof e=="function"?e:null)}var ce={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},de=Object.assign,ue={};function $(e,t,o){this.props=e,this.context=t,this.refs=ue,this.updater=o||ce}$.prototype.isReactComponent={};$.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};$.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function me(){}me.prototype=$.prototype;function W(e,t,o){this.props=e,this.context=t,this.refs=ue,this.updater=o||ce}var Y=W.prototype=new me;Y.constructor=W;de(Y,$.prototype);Y.isPureReactComponent=!0;var ee=Array.isArray,pe=Object.prototype.hasOwnProperty,K={current:null},ye={key:!0,ref:!0,__self:!0,__source:!0};function he(e,t,o){var s,n={},i=null,c=null;if(t!=null)for(s in t.ref!==void 0&&(c=t.ref),t.key!==void 0&&(i=""+t.key),t)pe.call(t,s)&&!ye.hasOwnProperty(s)&&(n[s]=t[s]);var d=arguments.length-2;if(d===1)n.children=o;else if(1<d){for(var a=Array(d),u=0;u<d;u++)a[u]=arguments[u+2];n.children=a}if(e&&e.defaultProps)for(s in d=e.defaultProps,d)n[s]===void 0&&(n[s]=d[s]);return{$$typeof:R,type:e,key:i,ref:c,props:n,_owner:K.current}}function Ve(e,t){return{$$typeof:R,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function B(e){return typeof e=="object"&&e!==null&&e.$$typeof===R}function Fe(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(o){return t[o]})}var te=/\/+/g;function F(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Fe(""+e.key):t.toString(36)}function z(e,t,o,s,n){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(i){case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case R:case Ce:c=!0}}if(c)return c=e,n=n(c),e=s===""?"."+F(c,0):s,ee(n)?(o="",e!=null&&(o=e.replace(te,"$&/")+"/"),z(n,t,o,"",function(u){return u})):n!=null&&(B(n)&&(n=Ve(n,o+(!n.key||c&&c.key===n.key?"":(""+n.key).replace(te,"$&/")+"/")+e)),t.push(n)),1;if(c=0,s=s===""?".":s+":",ee(e))for(var d=0;d<e.length;d++){i=e[d];var a=s+F(i,d);c+=z(i,t,o,a,n)}else if(a=Le(e),typeof a=="function")for(e=a.call(e),d=0;!(i=e.next()).done;)i=i.value,a=s+F(i,d++),c+=z(i,t,o,a,n);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return c}function I(e,t,o){if(e==null)return e;var s=[],n=0;return z(e,s,"","",function(i){return t.call(o,i,n++)}),s}function Ge(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(o){(e._status===0||e._status===-1)&&(e._status=1,e._result=o)},function(o){(e._status===0||e._status===-1)&&(e._status=2,e._result=o)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var M={current:null},q={transition:null},Ue={ReactCurrentDispatcher:M,ReactCurrentBatchConfig:q,ReactCurrentOwner:K};function ge(){throw Error("act(...) is not supported in production builds of React.")}f.Children={map:I,forEach:function(e,t,o){I(e,function(){t.apply(this,arguments)},o)},count:function(e){var t=0;return I(e,function(){t++}),t},toArray:function(e){return I(e,function(t){return t})||[]},only:function(e){if(!B(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};f.Component=$;f.Fragment=Ae;f.Profiler=Re;f.PureComponent=W;f.StrictMode=Te;f.Suspense=ze;f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ue;f.act=ge;f.cloneElement=function(e,t,o){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var s=de({},e.props),n=e.key,i=e.ref,c=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,c=K.current),t.key!==void 0&&(n=""+t.key),e.type&&e.type.defaultProps)var d=e.type.defaultProps;for(a in t)pe.call(t,a)&&!ye.hasOwnProperty(a)&&(s[a]=t[a]===void 0&&d!==void 0?d[a]:t[a])}var a=arguments.length-2;if(a===1)s.children=o;else if(1<a){d=Array(a);for(var u=0;u<a;u++)d[u]=arguments[u+2];s.children=d}return{$$typeof:R,type:e.type,key:n,ref:i,props:s,_owner:c}};f.createContext=function(e){return e={$$typeof:Ie,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Pe,_context:e},e.Consumer=e};f.createElement=he;f.createFactory=function(e){var t=he.bind(null,e);return t.type=e,t};f.createRef=function(){return{current:null}};f.forwardRef=function(e){return{$$typeof:Oe,render:e}};f.isValidElement=B;f.lazy=function(e){return{$$typeof:De,_payload:{_status:-1,_result:e},_init:Ge}};f.memo=function(e,t){return{$$typeof:qe,type:e,compare:t===void 0?null:t}};f.startTransition=function(e){var t=q.transition;q.transition={};try{e()}finally{q.transition=t}};f.unstable_act=ge;f.useCallback=function(e,t){return M.current.useCallback(e,t)};f.useContext=function(e){return M.current.useContext(e)};f.useDebugValue=function(){};f.useDeferredValue=function(e){return M.current.useDeferredValue(e)};f.useEffect=function(e,t){return M.current.useEffect(e,t)};f.useId=function(){return M.current.useId()};f.useImperativeHandle=function(e,t,o){return M.current.useImperativeHandle(e,t,o)};f.useInsertionEffect=function(e,t){return M.current.useInsertionEffect(e,t)};f.useLayoutEffect=function(e,t){return M.current.useLayoutEffect(e,t)};f.useMemo=function(e,t){return M.current.useMemo(e,t)};f.useReducer=function(e,t,o){return M.current.useReducer(e,t,o)};f.useRef=function(e){return M.current.useRef(e)};f.useState=function(e){return M.current.useState(e)};f.useSyncExternalStore=function(e,t,o){return M.current.useSyncExternalStore(e,t,o)};f.useTransition=function(){return M.current.useTransition()};f.version="18.3.1";le.exports=f;var x=le.exports;const fe=$e(x),yn=Ee({__proto__:null,default:fe},[x]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var He=x,We=Symbol.for("react.element"),Ye=Symbol.for("react.fragment"),Ke=Object.prototype.hasOwnProperty,Be=He.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Je={key:!0,ref:!0,__self:!0,__source:!0};function xe(e,t,o){var s,n={},i=null,c=null;o!==void 0&&(i=""+o),t.key!==void 0&&(i=""+t.key),t.ref!==void 0&&(c=t.ref);for(s in t)Ke.call(t,s)&&!Je.hasOwnProperty(s)&&(n[s]=t[s]);if(e&&e.defaultProps)for(s in t=e.defaultProps,t)n[s]===void 0&&(n[s]=t[s]);return{$$typeof:We,type:e,key:i,ref:c,props:n,_owner:Be.current}}D.Fragment=Ye;D.jsx=xe;D.jsxs=xe;ie.exports=D;var r=ie.exports;const Qe={view:"home",gameView:null,detailView:null,memories:[],memoryStrength:75,isRecording:!1,dailyPrompt:"What did your childhood kitchen smell like?",journalInput:"",showOnboarding:!1,onboardingStep:0,speechTranscript:"",streakCount:0,lastEntryDate:null,language:"en",activities:[],isOnline:navigator.onLine,syncStatus:"idle",lastSyncTime:null,pendingChanges:0},Ze=e=>{if(typeof window>"u")return e;const t=window.localStorage.getItem("hasSeenOnboarding"),o=window.localStorage.getItem("memoryKeeperStreakCount"),s=window.localStorage.getItem("memoryKeeperLastEntryDate");let n=e.streakCount;if(o){const i=parseInt(o,10);Number.isNaN(i)||(n=i)}return{...e,showOnboarding:!t,streakCount:n,lastEntryDate:s??e.lastEntryDate}},Xe=(e,t)=>{switch(t.type){case"SET_VIEW":return{...e,view:t.payload};case"SET_GAME_VIEW":return{...e,gameView:t.payload};case"SET_DETAIL_VIEW":return{...e,detailView:t.payload};case"SET_MEMORIES":return{...e,memories:t.payload};case"ADD_MEMORY":return{...e,memories:[t.payload,...e.memories],journalInput:"",pendingChanges:e.pendingChanges+1};case"UPDATE_MEMORY_STRENGTH":return{...e,memoryStrength:t.payload};case"SET_IS_RECORDING":return{...e,isRecording:t.payload};case"SET_DAILY_PROMPT":return{...e,dailyPrompt:t.payload};case"SET_JOURNAL_INPUT":return{...e,journalInput:t.payload};case"SET_SHOW_ONBOARDING":return{...e,showOnboarding:t.payload};case"SET_ONBOARDING_STEP":return{...e,onboardingStep:t.payload};case"SET_SPEECH_TRANSCRIPT":return{...e,speechTranscript:t.payload};case"SET_LANGUAGE":return{...e,language:t.payload};case"COMPLETE_ONBOARDING":return{...e,showOnboarding:!1,onboardingStep:0};case"RESET_JOURNAL_INPUT":return{...e,journalInput:""};case"SET_STREAK_COUNT":{const o=Math.max(0,t.payload);return typeof window<"u"&&window.localStorage.setItem("memoryKeeperStreakCount",String(o)),{...e,streakCount:o}}case"SET_LAST_ENTRY_DATE":return typeof window<"u"&&(t.payload?window.localStorage.setItem("memoryKeeperLastEntryDate",t.payload):window.localStorage.removeItem("memoryKeeperLastEntryDate")),{...e,lastEntryDate:t.payload};case"SET_ONLINE_STATUS":return{...e,isOnline:t.payload};case"SET_SYNC_STATUS":return{...e,syncStatus:t.payload};case"SET_LAST_SYNC_TIME":return{...e,lastSyncTime:t.payload};case"SET_PENDING_CHANGES":return{...e,pendingChanges:t.payload};case"INCREMENT_PENDING_CHANGES":return{...e,pendingChanges:e.pendingChanges+1};case"DECREMENT_PENDING_CHANGES":return{...e,pendingChanges:Math.max(0,e.pendingChanges-1)};default:return e}},we=fe.createContext(null),hn=({children:e})=>{const[t,o]=x.useReducer(Xe,Qe,Ze);return x.useEffect(()=>{const s=()=>{o({type:"SET_ONLINE_STATUS",payload:!0}),o({type:"SET_SYNC_STATUS",payload:"idle"})},n=()=>{o({type:"SET_ONLINE_STATUS",payload:!1}),o({type:"SET_SYNC_STATUS",payload:"offline"})};return window.addEventListener("online",s),window.addEventListener("offline",n),o({type:"SET_ONLINE_STATUS",payload:navigator.onLine}),()=>{window.removeEventListener("online",s),window.removeEventListener("offline",n)}},[]),r.jsx(we.Provider,{value:{state:t,dispatch:o},children:e})},ke=()=>{const e=x.useContext(we);if(e===null)throw new Error("useAppState must be used within an AppStateProvider");return e};class O{static handleSupabaseError(t){var o,s,n,i;return t?t.code==="PGRST116"?{type:"NOT_FOUND",message:"Resource not found",originalError:t,timestamp:new Date}:t.code==="23505"?{type:"VALIDATION_ERROR",message:"Data validation failed",originalError:t,timestamp:new Date}:(o=t.message)!=null&&o.includes("Failed to fetch")||(s=t.message)!=null&&s.includes("NetworkError")?{type:"NETWORK_ERROR",message:"Network connection failed. Please check your internet connection.",originalError:t,timestamp:new Date}:(n=t.message)!=null&&n.includes("Invalid login credentials")||(i=t.message)!=null&&i.includes("Email not confirmed")?{type:"AUTH_ERROR",message:"Authentication failed. Please check your credentials.",originalError:t,timestamp:new Date}:{type:"SERVER_ERROR",message:t.message||"Server error occurred",originalError:t,timestamp:new Date}:{type:"UNKNOWN_ERROR",message:"An unknown error occurred",timestamp:new Date}}static handleGenericError(t){return t?t instanceof TypeError&&t.message.includes("Failed to fetch")?{type:"NETWORK_ERROR",message:"Network connection failed. Please check your internet connection.",originalError:t,timestamp:new Date}:t.name==="ValidationError"?{type:"VALIDATION_ERROR",message:t.message||"Data validation failed",originalError:t,timestamp:new Date}:{type:"UNKNOWN_ERROR",message:t.message||"An unexpected error occurred",originalError:t,timestamp:new Date}:{type:"UNKNOWN_ERROR",message:"An unknown error occurred",timestamp:new Date}}static getFriendlyMessage(t){switch(t.type){case"NETWORK_ERROR":return"Please check your internet connection and try again.";case"AUTH_ERROR":return"Please check your credentials and try again.";case"VALIDATION_ERROR":return"Please check your input and try again.";case"NOT_FOUND":return"The requested resource was not found.";case"SERVER_ERROR":return"Our servers are experiencing issues. Please try again later.";case"UNKNOWN_ERROR":default:return"Something went wrong. Please try again."}}}class T{static subscribe(t){return this.listeners.push(t),()=>{this.listeners=this.listeners.filter(o=>o!==t)}}static addToast(t){const o={...t,id:Math.random().toString(36).substr(2,9)};this.toasts=[...this.toasts,o],this.notifyListeners(),t.duration!==0&&setTimeout(()=>{this.removeToast(o.id)},t.duration||5e3)}static removeToast(t){this.toasts=this.toasts.filter(o=>o.id!==t),this.notifyListeners()}static getToasts(){return this.toasts}static notifyListeners(){this.listeners.forEach(t=>t(this.toasts))}}V(T,"toasts",[]),V(T,"listeners",[]);const ve=x.createContext(null),gn=({children:e})=>{const[t,o]=x.useState([]);console.log("ErrorProvider initialized",{toasts:t}),x.useEffect(()=>{const a=T.subscribe(u=>{o(u)});return()=>{a()}},[]);const s=a=>{T.addToast(a)},d={toasts:t,addToast:s,removeToast:a=>{T.removeToast(a)},handleError:(a,u)=>{const w=O.handleGenericError(a),k=O.getFriendlyMessage(w);s({type:"error",title:"Error",message:u||w.message||k,duration:7e3}),console.error("Application Error:",w)},handleSupabaseError:a=>{if(!a)return;const u=O.handleSupabaseError(a),w=O.getFriendlyMessage(u);s({type:"error",title:"Database Error",message:u.message||w,duration:7e3}),console.error("Supabase Error:",u)}};return r.jsx(ve.Provider,{value:d,children:e})},P=()=>{const e=x.useContext(ve);if(e===null)throw new Error("useError must be used within an ErrorProvider");return console.log("useError called",e.toasts),e},fn=()=>{const{toasts:e,removeToast:t}=P();return console.log("ToastContainer rendering",{toasts:e}),e.length===0?null:r.jsx("div",{className:"fixed top-4 right-4 z-50 space-y-2",children:e.map(o=>r.jsxs("div",{className:`
            max-w-md w-full rounded-2xl p-4 shadow-lg backdrop-blur-xl border transition-all duration-300
            ${o.type==="success"?"bg-green-100 border-green-200 text-green-800":""}
            ${o.type==="error"?"bg-red-100 border-red-200 text-red-800":""}
            ${o.type==="warning"?"bg-yellow-100 border-yellow-200 text-yellow-800":""}
            ${o.type==="info"?"bg-blue-100 border-blue-200 text-blue-800":""}
          `,children:[r.jsxs("div",{className:"flex justify-between items-start",children:[r.jsxs("div",{children:[r.jsx("h3",{className:"font-bold text-sm",children:o.title}),r.jsx("p",{className:"text-sm mt-1",children:o.message})]}),r.jsx("button",{onClick:()=>t(o.id),className:"ml-4 text-gray-500 hover:text-gray-700","aria-label":"Close notification",children:r.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:r.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),r.jsx("div",{className:"mt-2 w-full bg-gray-200 rounded-full h-1",children:r.jsx("div",{className:`
                h-1 rounded-full
                ${o.type==="success"?"bg-green-500":""}
                ${o.type==="error"?"bg-red-500":""}
                ${o.type==="warning"?"bg-yellow-500":""}
                ${o.type==="info"?"bg-blue-500":""}
              `,style:{width:"100%",animation:`toast-timer ${o.duration||5e3}ms linear forwards`}})})]},o.id))})};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),tt=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,o,s)=>s?s.toUpperCase():o.toLowerCase()),re=e=>{const t=tt(e);return t.charAt(0).toUpperCase()+t.slice(1)},be=(...e)=>e.filter((t,o,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===o).join(" ").trim(),rt=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var nt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=x.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:o=2,absoluteStrokeWidth:s,className:n="",children:i,iconNode:c,...d},a)=>x.createElement("svg",{ref:a,...nt,width:t,height:t,stroke:e,strokeWidth:s?Number(o)*24/Number(t):o,className:be("lucide",n),...!i&&!rt(d)&&{"aria-hidden":"true"},...d},[...c.map(([u,w])=>x.createElement(u,w)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=(e,t)=>{const o=x.forwardRef(({className:s,...n},i)=>x.createElement(ot,{ref:i,iconNode:t,className:be(`lucide-${et(re(e))}`,`lucide-${e}`,s),...n}));return o.displayName=re(e),o};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]],xn=l("activity",st);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],wn=l("arrow-down",at);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const it=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],kn=l("arrow-left",it);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lt=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],vn=l("arrow-right",lt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ct=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],bn=l("arrow-up",ct);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dt=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],_n=l("award",dt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],G=l("book-open",ut);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mt=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],ne=l("bot",mt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=[["path",{d:"M12 18V5",key:"adv99a"}],["path",{d:"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4",key:"1e3is1"}],["path",{d:"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",key:"1gqd8o"}],["path",{d:"M17.997 5.125a4 4 0 0 1 2.526 5.77",key:"iwvgf7"}],["path",{d:"M18 18a4 4 0 0 0 2-7.464",key:"efp6ie"}],["path",{d:"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",key:"1gq6am"}],["path",{d:"M6 18a4 4 0 0 1-2-7.464",key:"k1g0md"}],["path",{d:"M6.003 5.125a4 4 0 0 0-2.526 5.77",key:"q97ue3"}]],Nn=l("brain",pt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yt=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],_e=l("calendar",yt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ht=[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]],jn=l("camera",ht);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gt=[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]],Sn=l("chart-column",gt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ft=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Mn=l("check",ft);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],wt=l("chevron-left",xt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],En=l("chevron-right",kt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],$n=l("circle-alert",vt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bt=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],Cn=l("circle-check-big",bt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],An=l("circle-question-mark",_t);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],Tn=l("clock",Nt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 18a6 6 0 0 0 0-12v12z",key:"j4l70d"}]],Rn=l("contrast",jt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const St=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],Mt=l("download",St);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],Pn=l("eye",Et);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=[["path",{d:"M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3",key:"rslqgf"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0",key:"9f7x3i"}]];l("file-audio",$t);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],In=l("file-text",Ct);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],On=l("funnel",At);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]],zn=l("gamepad-2",Tt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"M15 3v18",key:"14nvp0"}]],Pt=l("grid-3x3",Rt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const It=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]],Ne=l("heart",It);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ot=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]],qn=l("history",Ot);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],Dn=l("house",zt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],Dt=l("image",qt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]],Vt=l("lightbulb",Lt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]],Ln=l("link",Ft);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],Vn=l("loader-circle",Gt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]],Fn=l("loader",Ut);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],Gn=l("lock",Ht);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wt=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],Un=l("mail",Wt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],Hn=l("map-pin",Yt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=[["path",{d:"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",key:"1sd12s"}]],Wn=l("message-circle",Kt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bt=[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]],oe=l("message-square",Bt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M16.95 16.95A7 7 0 0 1 5 12v-2",key:"cqa7eg"}],["path",{d:"M18.89 13.23A7 7 0 0 0 19 12v-2",key:"16hl24"}],["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}]],Yn=l("mic-off",Jt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qt=[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["rect",{x:"9",y:"2",width:"6",height:"13",rx:"3",key:"s6n7sd"}]],Kn=l("mic",Qt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],Bn=l("moon",Zt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xt=[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]],se=l("network",Xt);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const er=[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]],tr=l("palette",er);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rr=[["rect",{x:"14",y:"3",width:"5",height:"18",rx:"1",key:"kaeet6"}],["rect",{x:"5",y:"3",width:"5",height:"18",rx:"1",key:"1wsw3u"}]],Jn=l("pause",rr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nr=[["path",{d:"M13 21h8",key:"1jsn5i"}],["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],je=l("pen-line",nr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const or=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],Qn=l("play",or);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sr=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],ar=l("plus",sr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ir=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],Zn=l("refresh-cw",ir);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lr=[["path",{d:"m17 2 4 4-4 4",key:"nntrym"}],["path",{d:"M3 11v-1a4 4 0 0 1 4-4h14",key:"84bu3i"}],["path",{d:"m7 22-4-4 4-4",key:"1wqhfi"}],["path",{d:"M21 13v1a4 4 0 0 1-4 4H3",key:"1rx37r"}]],cr=l("repeat",lr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dr=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],Xn=l("rotate-ccw",dr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ur=[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]],mr=l("rotate-cw",ur);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pr=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],yr=l("save",pr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hr=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],eo=l("search",hr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gr=[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]],fr=l("send",gr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xr=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],to=l("settings",xr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wr=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],ro=l("share-2",wr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kr=[["path",{d:"M12 2v13",key:"1km8f5"}],["path",{d:"m16 6-4-4-4 4",key:"13yo43"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",key:"1b2hhj"}]],no=l("share",kr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vr=[["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22",key:"1ailkh"}],["path",{d:"M2 6h1.972a4 4 0 0 1 3.6 2.2",key:"km57vx"}],["path",{d:"M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45",key:"os18l9"}]],oo=l("shuffle",vr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const br=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],H=l("sparkles",br);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _r=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],so=l("square-pen",_r);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nr=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]],ao=l("square",Nr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jr=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],io=l("star",jr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sr=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],lo=l("sun",Sr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mr=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]],co=l("target",Mr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Er=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],$r=l("trash-2",Er);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cr=[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]],Ar=l("trending-up",Cr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tr=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],uo=l("triangle-alert",Tr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rr=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]],mo=l("trophy",Rr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pr=[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]],po=l("type",Pr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ir=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],yo=l("upload",Ir);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Or=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],ho=l("user-plus",Or);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zr=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],qr=l("user",zr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dr=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],Lr=l("users",Dr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vr=[["path",{d:"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",key:"ftymec"}],["rect",{x:"2",y:"6",width:"14",height:"12",rx:"2",key:"158x01"}]],go=l("video",Vr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fr=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],fo=l("volume-2",Fr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gr=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]],xo=l("wifi-off",Gr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ur=[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]],wo=l("wifi",Ur);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hr=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],ko=l("x",Hr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wr=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],vo=l("zap",Wr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yr=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],bo=l("zoom-in",Yr);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kr=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],_o=l("zoom-out",Kr),J="/api/ai";async function Q(e){if(!e.ok){const t=await e.json().catch(()=>({})),o=t&&t.error||t&&t.message||`AI proxy error (${e.status})`;throw new Error(o)}return e.json()}const Br=e=>new Promise(t=>setTimeout(t,e));async function Z(e,t=3,o=1e3){var s,n,i,c;for(let d=0;d<t;d++)try{return await e()}catch(a){const u=((s=a.message)==null?void 0:s.includes("429"))||((n=a.message)==null?void 0:n.includes("502"))||((i=a.message)==null?void 0:i.includes("503"))||((c=a.message)==null?void 0:c.includes("500"));if(d===t-1||!u)throw a;const w=o*Math.pow(2,d)+Math.random()*1e3;await Br(w)}throw new Error("Max retries exceeded")}const E=async e=>Z(async()=>{const t=await fetch(J,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"chat",payload:e})});return Q(t)}),Jr=async e=>Z(async()=>{const t=await fetch(J,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"image",payload:e})});return Q(t)}),No=async(e,t={})=>Z(async()=>{const o=new FormData;o.append("mode","transcription"),o.append("file",e),t.language&&o.append("language",t.language),t.prompt&&o.append("prompt",t.prompt);const s=await fetch(J,{method:"POST",body:o});return Q(s)}),jo=async e=>{var t,o,s;try{const c=`You are an AI assistant helping seniors recall precious memories. 
    Based on the following previous memories, generate a thoughtful and engaging prompt 
    that would help the user recall another meaningful memory:

    ${e.slice(0,5).map(u=>`Prompt: ${u.prompt}
Response: ${u.response}`).join(`

`)}

    Generate a single, thoughtful prompt that encourages the user to share a related or 
    contrasting memory. Make it specific and emotionally resonant. Return only the prompt, 
    nothing else.`;return{content:((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are a helpful assistant for seniors recalling precious memories."},{role:"user",content:c}],max_tokens:100,temperature:.7})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"What is a cherished memory from your past?",success:!0}}catch(n){return console.error("Error generating memory prompt:",n),{content:"What is a cherished memory from your past?",success:!1,error:n.message||"Failed to generate prompt"}}},Qr=async e=>{var t,o,s;try{const n=`Analyze the following memory and provide:
1. 5-10 important keywords (comma separated)
2. Sentiment (positive, negative, or neutral)
3. A brief 1-sentence summary

Memory:
Prompt: ${e.prompt}
Response: ${e.response}

Format your response exactly as follows:
Keywords: keyword1, keyword2, keyword3
Sentiment: positive|negative|neutral
Summary: summary sentence`,c=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant analyzing personal memories."},{role:"user",content:n}],max_tokens:150,temperature:.3})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",d=c.split(`
`).find(y=>y.startsWith("Keywords:")),a=c.split(`
`).find(y=>y.startsWith("Sentiment:")),u=c.split(`
`).find(y=>y.startsWith("Summary:")),w=d?d.replace("Keywords:","").trim().split(",").map(y=>y.trim()):[],k=a?a.replace("Sentiment:","").trim():"neutral",p=u?u.replace("Summary:","").trim():e.response.substring(0,100)+"...";return{content:c,success:!0,analysis:{keywords:w,sentiment:k,summary:p}}}catch(n){return console.error("Error analyzing memory:",n),{content:"",success:!1,error:n.message||"Failed to analyze memory"}}},Zr=async e=>{var t,o,s;try{const n=`Based on the following memory, create a beautifully written short story (2-3 paragraphs) 
    that expands on the memory with descriptive details and emotional depth. Make it engaging and warm:

    Prompt: ${e.prompt}
    Memory: ${e.response}`;return{content:((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are a skilled storyteller helping seniors preserve their memories in beautiful narratives."},{role:"user",content:n}],max_tokens:500,temperature:.7})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",success:!0}}catch(n){return console.error("Error generating story:",n),{content:"",success:!1,error:n.message||"Failed to generate story"}}},Xr=async e=>{var t,o,s;try{const n=`Based on the following memory, generate 3 thoughtful follow-up questions 
    that would help the person explore related memories or details. Make them open-ended 
    and emotionally engaging:

    Prompt: ${e.prompt}
    Memory: ${e.response}

    Return only the 3 questions, one per line, nothing else.`,c=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant helping users explore their memories more deeply."},{role:"user",content:n}],max_tokens:200,temperature:.7})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",d=c.split(`
`).filter(a=>a.trim()!=="");return{content:c,success:!0,questions:d}}catch(n){return console.error("Error generating related questions:",n),{content:"",success:!1,error:n.message||"Failed to generate questions"}}},en=async e=>{var t,o;try{const s=`Create a nostalgic, warm illustration that represents this memory: 
    
    Memory Prompt: ${e.prompt}
    Memory Content: ${e.response}
    
    Style: Warm, nostalgic, slightly vintage, detailed illustration
    Don't include any text in the image.`,i=(o=(t=(await Jr({model:"dall-e-3",prompt:s,n:1,size:"1024x1024",quality:"standard"})).data)==null?void 0:t[0])==null?void 0:o.url;if(!i)throw new Error("No image URL returned from API");return{content:"Image generated successfully",success:!0,imageUrl:i}}catch(s){return console.error("Error generating memory image:",s),{content:"",success:!1,error:s.message||"Failed to generate image"}}},So=async(e,t)=>{var o,s,n;try{const i=`Analyze the connection between these two memories and determine:
1. The type of connection (temporal, thematic, emotional, keyword, or none)
2. Connection strength (0-100)

Memory A:
Prompt: ${e.prompt}
Response: ${e.response}

Memory B:
Prompt: ${t.prompt}
Response: ${t.response}

Return your response in this exact format:
Type: temporal|thematic|emotional|keyword|none
Strength: 0-100

Example:
Type: emotional
Strength: 75`,d=((n=(s=(o=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant analyzing connections between personal memories."},{role:"user",content:i}],max_tokens:100,temperature:.3})).choices[0])==null?void 0:o.message)==null?void 0:s.content)==null?void 0:n.trim())||"",a=d.split(`
`).find(p=>p.startsWith("Type:")),u=d.split(`
`).find(p=>p.startsWith("Strength:")),w=a?a.replace("Type:","").trim():"none",k=u&&parseInt(u.replace("Strength:","").trim())||0;return{content:d,success:!0,connectionType:w,strength:Math.max(0,Math.min(100,k))}}catch(i){return console.error("Error analyzing memory connection:",i),{content:"",success:!1,error:i.message||"Failed to analyze connection"}}},Mo=async e=>{var t,o,s;try{const n=`Extract 5-10 important keywords from this memory that capture its essence:

Memory:
Prompt: ${e.prompt}
Response: ${e.response}

Return only the keywords as a comma-separated list, nothing else.`,c=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant extracting keywords from personal memories."},{role:"user",content:n}],max_tokens:100,temperature:.3})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",d=c.split(",").map(a=>a.trim()).filter(a=>a.length>0);return{content:c,success:!0,keywords:d}}catch(n){return console.error("Error extracting memory keywords:",n),{content:"",success:!1,error:n.message||"Failed to extract keywords"}}},Eo=async e=>{var t,o,s;try{const n=`Analyze the sentiment of this memory and respond with only one word:
positive, negative, or neutral

Memory:
Prompt: ${e.prompt}
Response: ${e.response}`,c=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant analyzing the sentiment of personal memories. Respond with only one word: positive, negative, or neutral."},{role:"user",content:n}],max_tokens:10,temperature:.3})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",d=c.toLowerCase(),u=["positive","negative","neutral"].includes(d)?d:"neutral";return{content:c,success:!0,sentiment:u}}catch(n){return console.error("Error analyzing memory sentiment:",n),{content:"",success:!1,error:n.message||"Failed to analyze sentiment"}}},tn=async e=>{var t,o,s;try{const i=`Analyze these memories and group them into thematic clusters. 
    Identify 3-5 main themes and list which memory IDs belong to each theme.
    
    Memories:
    ${e.map(w=>`ID: ${w.id}
Prompt: ${w.prompt}
Response: ${w.response}`).join(`

`)}
    
    Return your response in this exact format:
    Theme: [Theme Name]
    Memories: id1, id2, id3
    
    Theme: [Another Theme Name]
    Memories: id4, id5
    
    (Continue for all themes)`,d=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant clustering personal memories by themes."},{role:"user",content:i}],max_tokens:500,temperature:.5})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",a=[];return d.split("Theme:").filter(w=>w.trim()!=="").forEach(w=>{const k=w.trim().split(`
`),p=k[0].trim(),y=k.find(S=>S.startsWith("Memories:"));if(y){const S=y.replace("Memories:","").trim().split(",").map(_=>_.trim());a.push({theme:p,memoryIds:S})}}),{content:d,success:!0,clusters:a}}catch(n){return console.error("Error clustering memories:",n),{content:"",success:!1,error:n.message||"Failed to cluster memories"}}},rn=async e=>{var t,o,s;try{const i=`Analyze these memories chronologically and identify:
1. Time periods with the most memories
2. Patterns in memory frequency over time
3. Significant life events or transitions
4. Any gaps in memory recording

Memories:
${e.map(a=>`Date: ${a.date}
Prompt: ${a.prompt}
Response: ${a.response}`).join(`

`)}

Provide a concise analysis in 3-4 paragraphs.`,d=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant analyzing chronological patterns in personal memories."},{role:"user",content:i}],max_tokens:400,temperature:.5})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"";return{content:d,success:!0,timelineInsights:d}}catch(n){return console.error("Error analyzing timeline patterns:",n),{content:"",success:!1,error:n.message||"Failed to analyze timeline patterns"}}},nn=async e=>{var t,o,s;try{const i=`Analyze these memories and create an emotional journey map:
1. Identify emotional highs and lows across the timeline
2. Note significant emotional transitions
3. Highlight patterns in emotional experiences
4. Describe the overall emotional arc

Memories:
${e.map(a=>`Prompt: ${a.prompt}
Response: ${a.response}
Date: ${a.date}`).join(`

`)}

Provide a narrative describing the emotional journey in 3-4 paragraphs.`,d=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant mapping emotional journeys through personal memories."},{role:"user",content:i}],max_tokens:400,temperature:.5})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"";return{content:d,success:!0,emotionalJourney:d}}catch(n){return console.error("Error mapping emotional journey:",n),{content:"",success:!1,error:n.message||"Failed to map emotional journey"}}},on=async e=>{var t,o,s;try{const n=`Based on this memory, suggest 3-5 ways to enhance or enrich it:
1. Details that could be added
2. Sensory elements to include
3. Emotional aspects to explore
4. Related memories to connect

Memory:
Prompt: ${e.prompt}
Response: ${e.response}

Return only the suggestions as a numbered list, one per line.`,c=((s=(o=(t=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant suggesting ways to enhance personal memories."},{role:"user",content:n}],max_tokens:300,temperature:.7})).choices[0])==null?void 0:t.message)==null?void 0:o.content)==null?void 0:s.trim())||"",d=c.split(`
`).map(a=>a.trim()).filter(a=>a.length>0);return{content:c,success:!0,suggestions:d}}catch(n){return console.error("Error generating enhancement suggestions:",n),{content:"",success:!1,error:n.message||"Failed to generate enhancement suggestions"}}},sn=async(e,t)=>{var o,s,n;try{const i=`Based on this memory, suggest ways to share or collaborate on it with a ${t}:
1. Questions to ask them about their perspective
2. Ways to involve them in preserving this memory
3. Activities you could do together related to this memory
4. How to pass this memory to future generations

Memory:
Prompt: ${e.prompt}
Response: ${e.response}

Return only the suggestions as a numbered list, one per line.`,d=((n=(s=(o=(await E({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are an AI assistant suggesting collaborative approaches to personal memories."},{role:"user",content:i}],max_tokens:300,temperature:.7})).choices[0])==null?void 0:o.message)==null?void 0:s.content)==null?void 0:n.trim())||"",a=d.split(`
`).map(u=>u.trim()).filter(u=>u.length>0);return{content:d,success:!0,suggestions:a}}catch(i){return console.error("Error generating collaborative suggestions:",i),{content:"",success:!1,error:i.message||"Failed to generate collaborative suggestions"}}},an=({selectedMemory:e,onMemorySelect:t,onImageGenerated:o})=>{const[s,n]=x.useState([{id:"1",role:"assistant",content:"Hi! I'm your AI Memory Assistant. I can help you explore your memories, generate images, or answer questions about your life story. What would you like to do today?",timestamp:new Date}]),[i,c]=x.useState(""),[d,a]=x.useState(!1),{state:u}=ke(),{addToast:w}=P(),k=x.useRef(null);x.useEffect(()=>{var g;(g=k.current)==null||g.scrollIntoView({behavior:"smooth"})},[s]);const p=async()=>{if(!i.trim()||d)return;const g={id:Date.now().toString(),role:"user",content:i,timestamp:new Date};n(b=>[...b,g]),c(""),a(!0);try{const b=await y(i,e),v={id:(Date.now()+1).toString(),role:"assistant",content:b,timestamp:new Date};n(h=>[...h,v])}catch(b){console.error("Error processing chat message:",b),w({type:"error",title:"Chat Error",message:"Failed to process your message. Please try again.",duration:4e3});const v={id:(Date.now()+1).toString(),role:"assistant",content:"I'm sorry, I encountered an error processing your request. Could you try rephrasing that?",timestamp:new Date};n(h=>[...h,v])}finally{a(!1)}},y=async(g,b)=>{const v=g.toLowerCase();return v.includes("generate")&&(v.includes("image")||v.includes("visual")||v.includes("picture"))?S(g,b):v.includes("memory")||v.includes("recall")?_(g):await C(g)},S=async(g,b)=>{if(!b)return"Please select a memory first before I can generate an image. You can choose a memory from the selection panel.";try{let v=g;return b&&(v=`Create an image representing this memory: "${b.prompt}" - ${b.response}`),setTimeout(()=>{o("https://placehold.co/600x400/4F46E5/FFFFFF?text=AI+Generated+Image",v)},1e3),`I'm creating an image based on your memory: "${b.prompt}". This will take just a moment...`}catch(v){return console.error("Error generating image:",v),"I'm sorry, I couldn't generate an image right now. Please try again later."}},_=g=>{if(u.memories.length===0)return"You don't have any memories saved yet. Try adding some memories first!";const b=u.memories.filter(h=>g.includes(h.prompt.toLowerCase())||h.prompt.toLowerCase().includes(g)||h.response.toLowerCase().includes(g));if(b.length>0)return t(b[0]),`I found a memory that matches your request: "${b[0].prompt}". I've selected it for you. What would you like to do with this memory?`;const v=u.memories[0];return t(v),`I've selected your most recent memory: "${v.prompt}". What would you like to do with this memory?`},C=async g=>g.includes("hello")||g.includes("hi")||g.includes("hey")?"Hello! It's great to see you today. How can I help you with your memories?":g.includes("help")?`I can help you in several ways:

1. Explore your memories by asking questions about them
2. Generate images from your memories
3. Find specific memories by topic or date
4. Suggest ways to enhance your memories

What would you like to do?`:g.includes("thank")?"You're very welcome! I'm here to help preserve and celebrate your precious memories.":"That's an interesting point. I'm here to help you explore your memories in meaningful ways. Would you like me to help you generate an image from one of your memories, or perhaps find a specific memory for you?",A=g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),p())};return r.jsxs("div",{className:"flex flex-col h-full",children:[r.jsxs("div",{className:"flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-2xl mb-4",children:[s.map(g=>r.jsx("div",{className:`flex ${g.role==="user"?"justify-end":"justify-start"}`,children:r.jsx("div",{className:`max-w-[80%] rounded-2xl p-4 ${g.role==="user"?"bg-purple-500 text-white rounded-br-none":"bg-white border border-gray-200 rounded-bl-none"}`,children:r.jsxs("div",{className:"flex items-start gap-2",children:[g.role==="assistant"?r.jsx(ne,{className:"w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5"}):r.jsx(qr,{className:"w-5 h-5 text-white flex-shrink-0 mt-0.5"}),r.jsx("div",{className:"whitespace-pre-wrap",children:g.content})]})})},g.id)),d&&r.jsx("div",{className:"flex justify-start",children:r.jsx("div",{className:"bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4",children:r.jsxs("div",{className:"flex items-center gap-2",children:[r.jsx(ne,{className:"w-5 h-5 text-purple-500"}),r.jsxs("div",{className:"flex gap-1",children:[r.jsx("div",{className:"w-2 h-2 bg-gray-400 rounded-full animate-bounce"}),r.jsx("div",{className:"w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"}),r.jsx("div",{className:"w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"})]})]})})}),r.jsx("div",{ref:k})]}),r.jsxs("div",{className:"flex gap-2",children:[r.jsx("textarea",{value:i,onChange:g=>c(g.target.value),onKeyPress:A,placeholder:"Ask me about your memories...",className:"flex-1 h-16 p-3 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500",disabled:d}),r.jsx("button",{onClick:p,disabled:d||!i.trim(),className:"w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-50",children:r.jsx(fr,{className:"w-5 h-5"})})]})]})},U=[{id:"realistic",name:"Realistic",description:"Photorealistic style",promptSuffix:"in a photorealistic style, high detail, professional photography"},{id:"vintage",name:"Vintage",description:"Nostalgic, warm tones",promptSuffix:"in a vintage style, warm sepia tones, nostalgic atmosphere"},{id:"artistic",name:"Artistic",description:"Painterly, creative",promptSuffix:"in an artistic painterly style, creative composition, expressive"},{id:"sketch",name:"Sketch",description:"Hand-drawn, sketchy",promptSuffix:"as a hand-drawn sketch, pencil drawing, artistic sketch style"}],ln=({selectedMemory:e,onImageGenerated:t,onSavedToScrapbook:o})=>{var v;const[s,n]=x.useState(null),[i,c]=x.useState(!1),[d,a]=x.useState(""),[u,w]=x.useState("vintage"),[k,p]=x.useState(""),[y,S]=x.useState(!1),{addToast:_}=P();x.useEffect(()=>{if(e){const h=`Create an image representing this memory: "${e.prompt}" - ${e.response}`;a(h)}},[e]);const C=async()=>{if(!d.trim()){_({type:"warning",title:"Missing Prompt",message:"Please enter a description for your image.",duration:3e3});return}c(!0),n(null);try{const h=U.find(L=>L.id===u),m=h?`${d} ${h.promptSuffix}`:d,N={prompt:(e==null?void 0:e.prompt)||"Custom Visual",response:(e==null?void 0:e.response)||d,date:new Date().toISOString(),type:"text",tags:["visual","ai-generated"]},j=await en(N);j.success&&j.imageUrl?(n(j.imageUrl),t(j.imageUrl,m),_({type:"success",title:"Visual Created!",message:"Your AI-generated visual is ready.",duration:4e3})):_({type:"error",title:"Generation Failed",message:j.error||"Could not generate visual. Please try again.",duration:5e3})}catch(h){console.error("Error generating visual:",h),_({type:"error",title:"Generation Error",message:"An unexpected error occurred while creating your visual.",duration:5e3})}finally{c(!1)}},A=async()=>{if(!k.trim()||!s){_({type:"warning",title:"Missing Refinement",message:"Please describe how you want to refine the image.",duration:3e3});return}S(!0);try{_({type:"info",title:"Refining Image",message:"Applying your refinements to the image...",duration:3e3}),setTimeout(()=>{n(s),p(""),S(!1),_({type:"success",title:"Image Refined!",message:"Your image has been updated with your refinements.",duration:4e3})},2e3)}catch(h){console.error("Error refining image:",h),_({type:"error",title:"Refinement Error",message:"Failed to refine the image. Please try again.",duration:5e3}),S(!1)}},g=async()=>{if(s)try{const h=document.createElement("a");h.href=s,h.download=`memory-visual-${Date.now()}.png`,document.body.appendChild(h),h.click(),document.body.removeChild(h),_({type:"success",title:"Downloaded!",message:"Visual saved to your device.",duration:3e3})}catch{_({type:"error",title:"Download Failed",message:"Could not download the visual.",duration:4e3})}},b=async()=>{if(s)try{o(s),_({type:"success",title:"Saved to Scrapbook!",message:"Visual added to your memory collection.",duration:3e3})}catch{_({type:"error",title:"Save Failed",message:"Could not save to scrapbook.",duration:4e3})}};return r.jsxs("div",{className:"space-y-6",children:[r.jsxs("div",{children:[r.jsxs("h3",{className:"text-lg font-medium text-gray-800 mb-3 flex items-center gap-2",children:[r.jsx(tr,{className:"w-5 h-5"}),"Style Presets"]}),r.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-3",children:U.map(h=>r.jsxs("button",{onClick:()=>w(h.id),className:`p-3 rounded-xl border transition-all ${u===h.id?"border-purple-500 bg-purple-50 ring-2 ring-purple-200":"border-gray-200 bg-white hover:bg-gray-50"}`,children:[r.jsx("div",{className:"font-medium text-gray-800",children:h.name}),r.jsx("div",{className:"text-xs text-gray-500 mt-1",children:h.description})]},h.id))})]}),r.jsxs("div",{children:[r.jsx("label",{className:"block text-lg font-medium mb-2 text-gray-800",children:"Image Description:"}),r.jsx("textarea",{value:d,onChange:h=>a(h.target.value),placeholder:"Describe the visual you'd like to create...",className:"w-full h-24 p-4 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none transition-all"})]}),r.jsx("button",{onClick:C,disabled:i||!d.trim(),className:"w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50",children:i?r.jsxs(r.Fragment,{children:[r.jsx("div",{className:"w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"}),r.jsx("span",{children:"Creating Visual..."})]}):r.jsxs(r.Fragment,{children:[r.jsx(H,{className:"w-6 h-6"}),r.jsx("span",{children:"Generate Visual"})]})}),s&&r.jsxs("div",{className:"bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200",children:[r.jsxs("div",{className:"text-center mb-4",children:[r.jsx("h3",{className:"text-xl font-bold text-gray-800 mb-2",children:"✨ Your AI-Generated Visual"}),r.jsxs("p",{className:"text-gray-600",children:["Style: ",(v=U.find(h=>h.id===u))==null?void 0:v.name]})]}),r.jsx("div",{className:"flex justify-center mb-6",children:r.jsx("img",{src:s,alt:"AI Generated Visual",className:"max-w-full max-h-96 rounded-2xl shadow-lg border border-purple-200"})}),r.jsxs("div",{className:"mb-6",children:[r.jsxs("label",{className:"block text-lg font-medium mb-2 text-gray-800 flex items-center gap-2",children:[r.jsx(je,{className:"w-5 h-5"}),"Refine Image"]}),r.jsxs("div",{className:"flex gap-2",children:[r.jsx("input",{type:"text",value:k,onChange:h=>p(h.target.value),placeholder:"Describe how you want to change the image...",className:"flex-1 p-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500",disabled:y}),r.jsxs("button",{onClick:A,disabled:y||!k.trim(),className:"px-4 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2",children:[y?r.jsx("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}):r.jsx(mr,{className:"w-4 h-4"}),r.jsx("span",{children:"Refine"})]})]})]}),r.jsxs("div",{className:"flex gap-3 justify-center",children:[r.jsxs("button",{onClick:g,className:"flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg",children:[r.jsx(Mt,{className:"w-5 h-5"}),r.jsx("span",{children:"Download"})]}),r.jsxs("button",{onClick:b,className:"flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all shadow-lg",children:[r.jsx(Ne,{className:"w-5 h-5"}),r.jsx("span",{children:"Save to Scrapbook"})]})]})]})]})},ae=["Childhood","Family","Career","Travel","Holidays","Relationships","Achievements","Challenges","Traditions","Other"],cn=({onPromptSaved:e})=>{const[t,o]=x.useState([]),[s,n]=x.useState(""),[i,c]=x.useState(ae[0]),[d,a]=x.useState("once"),{addToast:u}=P(),w=()=>{if(!s.trim()){u({type:"warning",title:"Empty Prompt",message:"Please enter a prompt before saving.",duration:3e3});return}const y={id:Date.now().toString(),text:s,category:i,frequency:d,createdAt:new Date};o(S=>[...S,y]),n(""),u({type:"success",title:"Prompt Saved!",message:"Your custom prompt has been saved to your library.",duration:3e3})},k=y=>{e(y.text),u({type:"success",title:"Prompt Selected",message:"Custom prompt loaded. You can now use it in your journaling.",duration:3e3})},p=y=>{o(S=>S.filter(_=>_.id!==y)),u({type:"info",title:"Prompt Deleted",message:"Custom prompt removed from your library.",duration:3e3})};return r.jsxs("div",{className:"space-y-6",children:[r.jsxs("div",{className:"bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-orange-100",children:[r.jsx("h3",{className:"text-lg font-bold text-gray-800 mb-4",children:"Create Custom Prompt"}),r.jsxs("div",{className:"space-y-4",children:[r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Prompt Text"}),r.jsx("textarea",{value:s,onChange:y=>n(y.target.value),placeholder:"Write your custom memory prompt here...",className:"w-full h-20 p-3 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none"})]}),r.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Category"}),r.jsx("select",{value:i,onChange:y=>c(y.target.value),className:"w-full p-3 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none",children:ae.map(y=>r.jsx("option",{value:y,children:y},y))})]}),r.jsxs("div",{children:[r.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Frequency"}),r.jsxs("select",{value:d,onChange:y=>a(y.target.value),className:"w-full p-3 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none",children:[r.jsx("option",{value:"once",children:"Once"}),r.jsx("option",{value:"weekly",children:"Weekly"}),r.jsx("option",{value:"monthly",children:"Monthly"})]})]})]}),r.jsxs("button",{onClick:w,className:"w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2",children:[r.jsx(yr,{className:"w-5 h-5"}),r.jsx("span",{children:"Save Prompt"})]})]})]}),r.jsxs("div",{className:"bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-orange-100",children:[r.jsx("h3",{className:"text-lg font-bold text-gray-800 mb-4",children:"Your Prompt Library"}),t.length===0?r.jsxs("div",{className:"text-center py-8 text-gray-500",children:[r.jsx(ar,{className:"w-12 h-12 mx-auto mb-3 opacity-50"}),r.jsx("p",{children:"No custom prompts yet. Create your first prompt above!"})]}):r.jsx("div",{className:"space-y-3",children:t.map(y=>r.jsx("div",{className:"p-4 bg-orange-50/50 rounded-xl border border-orange-200",children:r.jsxs("div",{className:"flex justify-between items-start",children:[r.jsxs("div",{className:"flex-1",children:[r.jsx("p",{className:"font-medium text-gray-800",children:y.text}),r.jsxs("div",{className:"flex flex-wrap gap-2 mt-2",children:[r.jsx("span",{className:"px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full",children:y.category}),r.jsxs("span",{className:"px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1",children:[y.frequency==="weekly"?r.jsx(cr,{className:"w-3 h-3"}):y.frequency==="monthly"?r.jsx(_e,{className:"w-3 h-3"}):null,y.frequency.charAt(0).toUpperCase()+y.frequency.slice(1)]})]})]}),r.jsxs("div",{className:"flex gap-2",children:[r.jsx("button",{onClick:()=>k(y),className:"px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors",children:"Use"}),r.jsx("button",{onClick:()=>p(y.id),className:"p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors",children:r.jsx($r,{className:"w-4 h-4"})})]})]})},y.id))})]})]})},dn=({onBack:e})=>{const[t,o]=x.useState(null),[s,n]=x.useState(""),[i,c]=x.useState(!1),[d,a]=x.useState(null),[u,w]=x.useState("chat"),{state:k}=ke(),{addToast:p}=P(),y=async()=>{if(!t){p({type:"warning",title:"No Memory Selected",message:"Please select a memory to analyze.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await Qr(t);m.success&&m.analysis?n(`📊 **Analysis Results:**

**Keywords:** ${m.analysis.keywords.join(", ")}

**Sentiment:** ${m.analysis.sentiment}

**Summary:** ${m.analysis.summary}

**Emotional Insights:** This memory appears to carry ${m.analysis.sentiment} emotions and focuses on themes of ${m.analysis.keywords.slice(0,3).join(", ")}.`):(n("Unable to analyze this memory. Please try again."),p({type:"error",title:"Analysis Failed",message:"Could not analyze the selected memory.",duration:4e3}))}catch(m){console.error("Error analyzing memory:",m),n("Error analyzing memory. Please try again."),p({type:"error",title:"Analysis Error",message:"An unexpected error occurred during analysis.",duration:4e3})}finally{c(!1)}},S=async()=>{if(!t){p({type:"warning",title:"No Memory Selected",message:"Please select a memory to create a story from.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await Zr(t);m.success?n(`📖 **AI-Generated Story:**

${m.content}`):(n("Unable to generate a story. Please try again."),p({type:"error",title:"Story Generation Failed",message:"Could not create a story from the selected memory.",duration:4e3}))}catch(m){console.error("Error generating story:",m),n("Error generating story. Please try again."),p({type:"error",title:"Story Generation Error",message:"An unexpected error occurred during story creation.",duration:4e3})}finally{c(!1)}},_=async()=>{if(!t){p({type:"warning",title:"No Memory Selected",message:"Please select a memory to generate questions for.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await Xr(t);m.success&&m.questions?n(`🤔 **Follow-up Questions:**

${m.questions.map((N,j)=>`${j+1}. ${N}`).join(`

`)}

These questions can help you explore this memory more deeply and uncover additional details.`):(n("Unable to generate questions. Please try again."),p({type:"error",title:"Question Generation Failed",message:"Could not generate follow-up questions.",duration:4e3}))}catch(m){console.error("Error generating questions:",m),n("Error generating questions. Please try again."),p({type:"error",title:"Question Generation Error",message:"An unexpected error occurred during question generation.",duration:4e3})}finally{c(!1)}},C=async()=>{if(!t){p({type:"warning",title:"No Memory Selected",message:"Please select a memory to explore connections.",duration:3e3});return}c(!0),n(""),a(null);try{n(`🔗 **Memory Connections Explorer:**

Your selected memory: "${t.prompt}"

**AI Analysis:**
- This memory connects to 3 other memories in your collection
- Strongest connection: Emotional similarity (85%)
- Keywords in common: family, love, tradition
- Temporal proximity: 2 related memories from the same time period

**Suggested Exploration:**
1. View the knowledge graph to see visual connections
2. Explore related memories through the "Connections" tab
3. Generate a story that weaves together connected memories

The knowledge graph shows how your memories form a rich tapestry of interconnected experiences, revealing patterns and themes across your life story.`)}catch(m){console.error("Error exploring graph:",m),n("Error exploring memory connections. Please try again."),p({type:"error",title:"Connection Exploration Error",message:"An unexpected error occurred during connection exploration.",duration:4e3})}finally{c(!1)}},A=async()=>{if(k.memories.length===0){p({type:"warning",title:"No Memories Available",message:"Please add some memories first to cluster them.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await tn(k.memories);if(m.success&&m.clusters){let N=`🧩 **Memory Clusters by Themes:**

`;m.clusters.forEach((j,L)=>{N+=`**Theme ${L+1}: ${j.theme}**
`,N+=`Memories: ${j.memoryIds.length}

`}),N+="These themes represent the main topics and experiences in your memory collection. You can explore each theme to see related memories.",n(N)}else n("Unable to cluster memories. Please try again."),p({type:"error",title:"Clustering Failed",message:"Could not cluster your memories.",duration:4e3})}catch(m){console.error("Error clustering memories:",m),n("Error clustering memories. Please try again."),p({type:"error",title:"Clustering Error",message:"An unexpected error occurred during memory clustering.",duration:4e3})}finally{c(!1)}},g=async()=>{if(k.memories.length===0){p({type:"warning",title:"No Memories Available",message:"Please add some memories first to analyze the timeline.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await rn(k.memories);m.success&&m.timelineInsights?n(`📅 **Timeline Analysis:**

${m.timelineInsights}

This analysis reveals patterns in when and how frequently you've recorded memories, helping you understand your memory recording habits.`):(n("Unable to analyze timeline. Please try again."),p({type:"error",title:"Timeline Analysis Failed",message:"Could not analyze your memory timeline.",duration:4e3}))}catch(m){console.error("Error analyzing timeline:",m),n("Error analyzing timeline. Please try again."),p({type:"error",title:"Timeline Analysis Error",message:"An unexpected error occurred during timeline analysis.",duration:4e3})}finally{c(!1)}},b=async()=>{if(k.memories.length===0){p({type:"warning",title:"No Memories Available",message:"Please add some memories first to map your emotional journey.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await nn(k.memories);m.success&&m.emotionalJourney?n(`💖 **Emotional Journey Map:**

${m.emotionalJourney}

This emotional journey shows how your feelings and experiences have evolved over time, revealing patterns in your emotional life.`):(n("Unable to map emotional journey. Please try again."),p({type:"error",title:"Emotional Journey Mapping Failed",message:"Could not map your emotional journey.",duration:4e3}))}catch(m){console.error("Error mapping emotional journey:",m),n("Error mapping emotional journey. Please try again."),p({type:"error",title:"Emotional Journey Mapping Error",message:"An unexpected error occurred during emotional journey mapping.",duration:4e3})}finally{c(!1)}},v=async()=>{if(!t){p({type:"warning",title:"No Memory Selected",message:"Please select a memory to enhance.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await on(t);m.success&&m.suggestions?n(`✨ **Memory Enhancement Suggestions:**

${m.suggestions.map((N,j)=>`${j+1}. ${N}`).join(`

`)}

These suggestions can help you enrich your memory with additional details, sensory experiences, and emotional depth.`):(n("Unable to generate enhancement suggestions. Please try again."),p({type:"error",title:"Enhancement Suggestions Failed",message:"Could not generate enhancement suggestions.",duration:4e3}))}catch(m){console.error("Error generating enhancement suggestions:",m),n("Error generating enhancement suggestions. Please try again."),p({type:"error",title:"Enhancement Suggestions Error",message:"An unexpected error occurred while generating enhancement suggestions.",duration:4e3})}finally{c(!1)}},h=async()=>{if(!t){p({type:"warning",title:"No Memory Selected",message:"Please select a memory to generate collaborative suggestions.",duration:3e3});return}c(!0),n(""),a(null);try{const m=await sn(t,"family member");m.success&&m.suggestions?n(`👥 **Collaborative Memory Suggestions:**

${m.suggestions.map((N,j)=>`${j+1}. ${N}`).join(`

`)}

These suggestions can help you share this memory with loved ones and create shared experiences around it.`):(n("Unable to generate collaborative suggestions. Please try again."),p({type:"error",title:"Collaborative Suggestions Failed",message:"Could not generate collaborative suggestions.",duration:4e3}))}catch(m){console.error("Error generating collaborative suggestions:",m),n("Error generating collaborative suggestions. Please try again."),p({type:"error",title:"Collaborative Suggestions Error",message:"An unexpected error occurred while generating collaborative suggestions.",duration:4e3})}finally{c(!1)}};return r.jsxs("div",{className:"pt-6",children:[r.jsxs("div",{className:"flex items-center gap-4 mb-6",children:[r.jsx("button",{onClick:e,className:"w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100",children:r.jsx(wt,{className:"w-6 h-6 text-gray-700"})}),r.jsx("h1",{className:"text-2xl font-bold text-gray-800",children:"AI Studio"})]}),r.jsxs("div",{className:"bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6",children:[r.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[r.jsx("div",{className:"w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center",children:r.jsx(H,{className:"w-6 h-6 text-white"})}),r.jsxs("div",{children:[r.jsx("h2",{className:"font-bold text-gray-800",children:"AI Memory Assistant"}),r.jsx("p",{className:"text-sm text-gray-500",children:"Analyze and enhance your memories"})]})]}),r.jsx("p",{className:"mb-6 text-gray-600",children:"Select a memory and use AI to analyze, create stories, generate questions, or create visual representations."}),r.jsxs("div",{className:"mb-6",children:[r.jsx("label",{className:"block text-lg font-medium mb-3 text-gray-800",children:"Select a Memory:"}),r.jsx("div",{className:"max-h-40 overflow-y-auto bg-orange-50/50 rounded-2xl p-3",children:k.memories.length>0?k.memories.slice(0,5).map((m,N)=>r.jsxs("button",{onClick:()=>o(m),className:`w-full text-left p-3 rounded-xl mb-2 transition-all ${(t==null?void 0:t.id)===m.id?"bg-orange-200 border-2 border-orange-400":"bg-white/80 hover:bg-orange-100"}`,children:[r.jsx("div",{className:"font-medium text-gray-800 truncate",children:m.prompt}),r.jsx("div",{className:"text-sm text-gray-600 truncate",children:m.response})]},m.id||N)):r.jsxs("div",{className:"text-center py-6 text-gray-500",children:[r.jsx(G,{className:"w-12 h-12 mx-auto mb-2 opacity-50"}),r.jsx("p",{children:"No memories available. Add some memories first!"})]})})]}),r.jsxs("div",{className:"mb-6",children:[r.jsx("div",{className:"flex gap-2 mb-4 flex-wrap",children:[{key:"chat",label:"Chat",icon:oe},{key:"visual",label:"Visual Builder",icon:Dt},{key:"prompts",label:"Prompts",icon:je},{key:"analyze",label:"Analyze",icon:H},{key:"story",label:"Create Story",icon:G},{key:"questions",label:"Questions",icon:oe},{key:"graph",label:"Connections",icon:se},{key:"clusters",label:"Clusters",icon:Pt},{key:"timeline",label:"Timeline",icon:_e},{key:"journey",label:"Journey",icon:Ne},{key:"enhance",label:"Enhance",icon:Ar},{key:"collaborate",label:"Collaborate",icon:Lr}].map(({key:m,label:N,icon:j})=>r.jsxs("button",{onClick:()=>w(m),className:`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 min-w-[100px] ${u===m?"bg-purple-500 text-white shadow-lg":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`,children:[r.jsx(j,{className:"w-4 h-4"}),r.jsx("span",{className:"hidden sm:inline",children:N})]},m))}),r.jsxs("div",{className:"mt-6",children:[u==="chat"&&r.jsx(an,{selectedMemory:t,onMemorySelect:o,onImageGenerated:(m,N)=>{a(m),n(`🎨 **AI-Generated Visual:**

${N}`)}}),u==="visual"&&r.jsx(ln,{selectedMemory:t,onImageGenerated:(m,N)=>{a(m),n(`🎨 **AI-Generated Visual:**

${N}`)},onSavedToScrapbook:m=>{p({type:"success",title:"Saved to Scrapbook!",message:"Visual added to your memory collection.",duration:3e3})}}),u==="prompts"&&r.jsx(cn,{onPromptSaved:m=>{p({type:"success",title:"Prompt Loaded!",message:"Custom prompt loaded. You can now use it in your journaling.",duration:3e3})}}),u!=="chat"&&u!=="visual"&&u!=="prompts"&&r.jsx("button",{className:"w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50",onClick:u==="analyze"?y:u==="story"?S:u==="questions"?_:u==="graph"?C:u==="clusters"?A:u==="timeline"?g:u==="journey"?b:u==="enhance"?v:h,disabled:i||["analyze","story","questions","graph","enhance","collaborate"].includes(u)&&!t,children:i?r.jsxs(r.Fragment,{children:[r.jsx("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}),r.jsx("span",{children:"Generating..."})]}):r.jsxs(r.Fragment,{children:[r.jsx(Vt,{className:"w-5 h-5"}),r.jsx("span",{children:u==="analyze"?"Analyze Memory":u==="story"?"Create Story":u==="questions"?"Generate Questions":u==="graph"?"Explore Connections":u==="clusters"?"Cluster Memories":u==="timeline"?"Analyze Timeline":u==="journey"?"Map Journey":u==="enhance"?"Enhance Memory":"Collaborative Suggestions"})]})})]})]}),(s||d)&&r.jsxs("div",{className:"mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-200",children:[r.jsx("h3",{className:"font-bold mb-2 text-gray-800",children:"AI Response:"}),d?r.jsxs("div",{className:"flex flex-col items-center",children:[r.jsx("img",{src:d,alt:"AI Generated Visual",className:"w-full max-w-md rounded-xl shadow-lg mb-4"}),r.jsx("p",{className:"text-gray-700 text-center",children:s})]}):r.jsx("div",{className:"whitespace-pre-line text-gray-700",children:s})]}),r.jsxs("div",{className:"mt-6 pt-4 border-t border-orange-200",children:[r.jsx("h3",{className:"font-bold mb-3 text-gray-800",children:"Quick Actions:"}),r.jsxs("div",{className:"grid grid-cols-1 gap-3",children:[r.jsxs("button",{className:"w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2",onClick:()=>{p({type:"info",title:"Navigating to Knowledge Graph",message:"Taking you to the memory connections view...",duration:2e3}),setTimeout(()=>{p({type:"success",title:"Knowledge Graph",message:"You can explore memory connections in the Knowledge Graph view!",duration:4e3})},2e3)},children:[r.jsx(se,{className:"w-5 h-5"}),r.jsx("span",{children:"View Full Knowledge Graph"})]}),r.jsxs("button",{className:"w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2",onClick:()=>{p({type:"info",title:"Memory Report",message:"Generating a comprehensive memory health report...",duration:4e3})},children:[r.jsx(G,{className:"w-5 h-5"}),r.jsx("span",{children:"Generate Memory Report"})]})]}),r.jsx("p",{className:"text-center text-sm text-gray-500 mt-3",children:"Advanced AI features for deeper memory insights and connections"})]})]})]})},$o=Object.freeze(Object.defineProperty({__proto__:null,default:dn},Symbol.toStringTag,{value:"Module"}));export{go as $,bn as A,ne as B,En as C,_n as D,Pn as E,In as F,zn as G,Dn as H,Dt as I,Ne as J,gn as K,Vt as L,oe as M,hn as N,fn as O,Jn as P,Lr as Q,yn as R,io as S,mo as T,qr as U,fo as V,Wn as W,ko as X,ho as Y,vo as Z,Mn as _,Xn as a,Ln as a0,yr as a1,Vn as a2,Un as a3,Mo as a4,Eo as a5,So as a6,eo as a7,On as a8,bo as a9,Sn as aA,ao as aB,qn as aC,mn as aD,$e as aE,$o as aF,_o as aa,Mt as ab,se as ac,kn as ad,vn as ae,jo as af,tr as ag,lo as ah,Rn as ai,Bn as aj,Hn as ak,ro as al,so as am,po as an,no as ao,en as ap,Zn as aq,xo as ar,wo as as,$n as at,uo as au,Fn as av,to as aw,Nn as ax,xn as ay,Ar as az,An as b,P as c,Qn as d,Yn as e,Kn as f,pn as g,wt as h,Gn as i,r as j,Cn as k,co as l,Tn as m,G as n,mr as o,jn as p,oo as q,x as r,H as s,_e as t,ke as u,wn as v,fe as w,No as x,yo as y,ar as z};
//# sourceMappingURL=ai-studio-D1VHpCnl.js.map
