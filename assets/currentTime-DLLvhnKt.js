import{c as a,r as c}from"./index-CWcWAsEA.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],h=a("book-open",i);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],m=a("search",u);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],w=a("user",d),o=()=>new Date,y=(e=o())=>{const t=e.getDay(),n=t===0?6:t-1,s=e.getHours()*60+e.getMinutes();return{day:n,minutes:s}},l=(e,t)=>e.day===t.day&&t.minutes>=e.startMin&&t.minutes<e.endMin,g=(e,t=o())=>l(e,y(t)),p=()=>{const[e,t]=c.useState(o);return c.useEffect(()=>{const n=()=>t(o());let s;const r=window.setTimeout(()=>{n(),s=window.setInterval(n,6e4)},(60-e.getSeconds())*1e3-e.getMilliseconds());return()=>{window.clearTimeout(r),s&&window.clearInterval(s)}},[e]),e};export{h as B,m as S,w as U,g as a,y as g,l as i,p as u};
