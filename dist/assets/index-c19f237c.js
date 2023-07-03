(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const W=window,ce=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,pe=Symbol(),ge=new WeakMap;let Ne=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==pe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ce&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=ge.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ge.set(t,e))}return e}toString(){return this.cssText}};const Le=r=>new Ne(typeof r=="string"?r:r+"",void 0,pe),m=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,s,o)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[o+1],r[0]);return new Ne(t,r,pe)},ze=(r,e)=>{ce?r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet):e.forEach(t=>{const i=document.createElement("style"),s=W.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,r.appendChild(i)})},$e=ce?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return Le(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Y;const V=window,be=V.trustedTypes,Me=be?be.emptyScript:"",ye=V.reactiveElementPolyfillSupport,ne={toAttribute(r,e){switch(e){case Boolean:r=r?Me:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},Be=(r,e)=>e!==r&&(e==e||r==r),ee={attribute:!0,type:String,converter:ne,reflect:!1,hasChanged:Be},le="finalized";let S=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,i)=>{const s=this._$Ep(i,t);s!==void 0&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=ee){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i=typeof e=="symbol"?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){const o=this[e];this[t]=s,this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||ee}static finalize(){if(this.hasOwnProperty(le))return!1;this[le]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift($e(s))}else e!==void 0&&t.push($e(e));return t}static _$Ep(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(t=>t(this))}addController(e){var t,i;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return ze(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=ee){var s;const o=this.constructor._$Ep(e,i);if(o!==void 0&&i.reflect===!0){const n=(((s=i.converter)===null||s===void 0?void 0:s.toAttribute)!==void 0?i.converter:ne).toAttribute(t,i.type);this._$El=e,n==null?this.removeAttribute(o):this.setAttribute(o,n),this._$El=null}}_$AK(e,t){var i;const s=this.constructor,o=s._$Ev.get(e);if(o!==void 0&&this._$El!==o){const n=s.getPropertyOptions(o),c=typeof n.converter=="function"?{fromAttribute:n.converter}:((i=n.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?n.converter:ne;this._$El=o,this[o]=c.fromAttribute(t,n.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||Be)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((s,o)=>this[o]=s),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$ES)===null||e===void 0||e.forEach(s=>{var o;return(o=s.hostUpdate)===null||o===void 0?void 0:o.call(s)}),this.update(i)):this._$Ek()}catch(s){throw t=!1,this._$Ek(),s}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach(i=>{var s;return(s=i.hostUpdated)===null||s===void 0?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((t,i)=>this._$EO(i,this[i],t)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};S[le]=!0,S.elementProperties=new Map,S.elementStyles=[],S.shadowRootOptions={mode:"open"},ye==null||ye({ReactiveElement:S}),((Y=V.reactiveElementVersions)!==null&&Y!==void 0?Y:V.reactiveElementVersions=[]).push("1.6.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var te;const F=window,P=F.trustedTypes,_e=P?P.createPolicy("lit-html",{createHTML:r=>r}):void 0,ae="$lit$",y=`lit$${(Math.random()+"").slice(9)}$`,Te="?"+y,ke=`<${Te}>`,A=document,U=()=>A.createComment(""),H=r=>r===null||typeof r!="object"&&typeof r!="function",Ue=Array.isArray,Ie=r=>Ue(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",ie=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,xe=/-->/g,we=/>/g,x=RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ae=/'/g,Ee=/"/g,He=/^(?:script|style|textarea|title)$/i,De=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),h=De(1),Se=De(2),C=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Pe=new WeakMap,w=A.createTreeWalker(A,129,null,!1),We=(r,e)=>{const t=r.length-1,i=[];let s,o=e===2?"<svg>":"",n=T;for(let l=0;l<t;l++){const a=r[l];let b,d,p=-1,g=0;for(;g<a.length&&(n.lastIndex=g,d=n.exec(a),d!==null);)g=n.lastIndex,n===T?d[1]==="!--"?n=xe:d[1]!==void 0?n=we:d[2]!==void 0?(He.test(d[2])&&(s=RegExp("</"+d[2],"g")),n=x):d[3]!==void 0&&(n=x):n===x?d[0]===">"?(n=s??T,p=-1):d[1]===void 0?p=-2:(p=n.lastIndex-d[2].length,b=d[1],n=d[3]===void 0?x:d[3]==='"'?Ee:Ae):n===Ee||n===Ae?n=x:n===xe||n===we?n=T:(n=x,s=void 0);const k=n===x&&r[l+1].startsWith("/>")?" ":"";o+=n===T?a+ke:p>=0?(i.push(b),a.slice(0,p)+ae+a.slice(p)+y+k):a+y+(p===-2?(i.push(void 0),l):k)}const c=o+(r[t]||"<?>")+(e===2?"</svg>":"");if(!Array.isArray(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return[_e!==void 0?_e.createHTML(c):c,i]};class D{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,n=0;const c=e.length-1,l=this.parts,[a,b]=We(e,t);if(this.el=D.createElement(a,i),w.currentNode=this.el.content,t===2){const d=this.el.content,p=d.firstChild;p.remove(),d.append(...p.childNodes)}for(;(s=w.nextNode())!==null&&l.length<c;){if(s.nodeType===1){if(s.hasAttributes()){const d=[];for(const p of s.getAttributeNames())if(p.endsWith(ae)||p.startsWith(y)){const g=b[n++];if(d.push(p),g!==void 0){const k=s.getAttribute(g.toLowerCase()+ae).split(y),I=/([.?@])?(.*)/.exec(g);l.push({type:1,index:o,name:I[2],strings:k,ctor:I[1]==="."?Fe:I[1]==="?"?Ze:I[1]==="@"?Ke:J})}else l.push({type:6,index:o})}for(const p of d)s.removeAttribute(p)}if(He.test(s.tagName)){const d=s.textContent.split(y),p=d.length-1;if(p>0){s.textContent=P?P.emptyScript:"";for(let g=0;g<p;g++)s.append(d[g],U()),w.nextNode(),l.push({type:2,index:++o});s.append(d[p],U())}}}else if(s.nodeType===8)if(s.data===Te)l.push({type:2,index:o});else{let d=-1;for(;(d=s.data.indexOf(y,d+1))!==-1;)l.push({type:7,index:o}),d+=y.length-1}o++}}static createElement(e,t){const i=A.createElement("template");return i.innerHTML=e,i}}function O(r,e,t=r,i){var s,o,n,c;if(e===C)return e;let l=i!==void 0?(s=t._$Co)===null||s===void 0?void 0:s[i]:t._$Cl;const a=H(e)?void 0:e._$litDirective$;return(l==null?void 0:l.constructor)!==a&&((o=l==null?void 0:l._$AO)===null||o===void 0||o.call(l,!1),a===void 0?l=void 0:(l=new a(r),l._$AT(r,t,i)),i!==void 0?((n=(c=t)._$Co)!==null&&n!==void 0?n:c._$Co=[])[i]=l:t._$Cl=l),l!==void 0&&(e=O(r,l._$AS(r,e.values),l,i)),e}class Ve{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:s}=this._$AD,o=((t=e==null?void 0:e.creationScope)!==null&&t!==void 0?t:A).importNode(i,!0);w.currentNode=o;let n=w.nextNode(),c=0,l=0,a=s[0];for(;a!==void 0;){if(c===a.index){let b;a.type===2?b=new z(n,n.nextSibling,this,e):a.type===1?b=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(b=new Je(n,this,e)),this._$AV.push(b),a=s[++l]}c!==(a==null?void 0:a.index)&&(n=w.nextNode(),c++)}return w.currentNode=A,o}v(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class z{constructor(e,t,i,s){var o;this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=(o=s==null?void 0:s.isConnected)===null||o===void 0||o}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),H(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==C&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):Ie(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==u&&H(this._$AH)?this._$AA.nextSibling.data=e:this.$(A.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:s}=e,o=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=D.createElement(s.h,this.options)),s);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===o)this._$AH.v(i);else{const n=new Ve(o,this),c=n.u(this.options);n.v(i),this.$(c),this._$AH=n}}_$AC(e){let t=Pe.get(e.strings);return t===void 0&&Pe.set(e.strings,t=new D(e)),t}T(e){Ue(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new z(this.k(U()),this.k(U()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,t);e&&e!==this._$AB;){const s=e.nextSibling;e.remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}}class J{constructor(e,t,i,s,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=u}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){const o=this.strings;let n=!1;if(o===void 0)e=O(this,e,t,0),n=!H(e)||e!==this._$AH&&e!==C,n&&(this._$AH=e);else{const c=e;let l,a;for(e=o[0],l=0;l<o.length-1;l++)a=O(this,c[i+l],t,l),a===C&&(a=this._$AH[l]),n||(n=!H(a)||a!==this._$AH[l]),a===u?e=u:e!==u&&(e+=(a??"")+o[l+1]),this._$AH[l]=a}n&&!s&&this.j(e)}j(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Fe extends J{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===u?void 0:e}}const qe=P?P.emptyScript:"";class Ze extends J{constructor(){super(...arguments),this.type=4}j(e){e&&e!==u?this.element.setAttribute(this.name,qe):this.element.removeAttribute(this.name)}}class Ke extends J{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){var i;if((e=(i=O(this,e,t,0))!==null&&i!==void 0?i:u)===C)return;const s=this._$AH,o=e===u&&s!==u||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==u&&(s===u||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}}class Je{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}}const Ce=F.litHtmlPolyfillSupport;Ce==null||Ce(D,z),((te=F.litHtmlVersions)!==null&&te!==void 0?te:F.litHtmlVersions=[]).push("2.7.4");const Ge=(r,e,t)=>{var i,s;const o=(i=t==null?void 0:t.renderBefore)!==null&&i!==void 0?i:e;let n=o._$litPart$;if(n===void 0){const c=(s=t==null?void 0:t.renderBefore)!==null&&s!==void 0?s:null;o._$litPart$=n=new z(e.insertBefore(U(),c),c,void 0,t??{})}return n._$AI(r),n};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var se,re;class f extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ge(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return C}}f.finalized=!0,f._$litElement$=!0,(se=globalThis.litElementHydrateSupport)===null||se===void 0||se.call(globalThis,{LitElement:f});const Oe=globalThis.litElementPolyfillSupport;Oe==null||Oe({LitElement:f});((re=globalThis.litElementVersions)!==null&&re!==void 0?re:globalThis.litElementVersions=[]).push("3.3.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $=r=>e=>typeof e=="function"?((t,i)=>(customElements.define(t,i),i))(r,e):((t,i)=>{const{kind:s,elements:o}=i;return{kind:s,elements:o,finisher(n){customElements.define(t,n)}}})(r,e);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xe=(r,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(t){t.createProperty(e.key,r)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(t){t.createProperty(e.key,r)}},Qe=(r,e,t)=>{e.constructor.createProperty(t,r)};function v(r){return(e,t)=>t!==void 0?Qe(r,e,t):Xe(r,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function G(r){return v({...r,state:!0})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var oe;((oe=window.HTMLSlotElement)===null||oe===void 0?void 0:oe.prototype.assignedElements)!=null;const Ye="/assets/lit-c8dae599.svg",et="/vite.svg";var tt=Object.defineProperty,it=Object.getOwnPropertyDescriptor,ue=(r,e,t,i)=>{for(var s=i>1?void 0:i?it(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&tt(e,t,s),s};let R=class extends f{constructor(){super(...arguments),this.docsHint="Click on the Vite and Lit logos to learn more",this.count=0}render(){return h`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src=${et} class="logo" alt="Vite logo" />
        </a>
        <a href="https://lit.dev" target="_blank">
          <img src=${Ye} class="logo lit" alt="Lit logo" />
        </a>
      </div>
      <slot></slot>
      <div class="card">
        <button @click=${this._onClick} part="button">
          count is ${this.count}
        </button>
      </div>
      <p class="read-the-docs">${this.docsHint}</p>
    `}_onClick(){this.count++}};R.styles=m`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.lit:hover {
      filter: drop-shadow(0 0 2em #325cffaa);
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    ::slotted(h1) {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `;ue([v()],R.prototype,"docsHint",2);ue([v({type:Number})],R.prototype,"count",2);R=ue([$("my-element")],R);var st=Object.defineProperty,rt=Object.getOwnPropertyDescriptor,ve=(r,e,t,i)=>{for(var s=i>1?void 0:i?rt(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&st(e,t,s),s};let j=class extends f{constructor(){super(...arguments),this.title="",this.subtitle=""}render(){return h`
      <div class="titlebar">
        <div class="title">${this.title}</div>
        <div class="subtitle">${this.subtitle}</div>
      </div>
    `}};j.styles=m`
    .titlebar {
      display: flex;
      flex-direction: row;
      padding: 0.5em;
      background: rgb(120, 190, 255);
    }
    .title {
      font-size: 1.5em;
      font-weight: bold;
      margin-right: 1em;
    }
    .subtitle {
      font-size: 1em;
      font-weight: normal;
    }
  `;ve([v()],j.prototype,"title",2);ve([v()],j.prototype,"subtitle",2);j=ve([$("ndx-titlebar")],j);const fe=m`
  .lightbtn {
    border-radius: 8%;
    margin: 0.3em 0;
    padding: 0.2em;
    margin-right: auto;
    border: 1px solid #808080;
    cursor: pointer;
  }

  .actionbtn {
    border-radius: 8%;
    margin: 0.3em 0;
    padding: 0.2em 1em;
    color: #fff;
    font-weight: bold;
    background: rgb(60, 110, 255);
    cursor: pointer;
  }

  .actionbtn:hover {
    background: rgb(40, 80, 255);
  }
`;var ot=Object.defineProperty,nt=Object.getOwnPropertyDescriptor,M=(r,e,t,i)=>{for(var s=i>1?void 0:i?nt(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&ot(e,t,s),s};let E=class extends f{constructor(){super(...arguments),this.helpLink="",this.help="",this.progress="",this.enabled=!0}render(){return h`
      <a href=${this.helpLink}>${this.help}</a>
      <slot></slot>
    `}};E.styles=[fe,m`
      :host {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-around;
      }

      a {
        margin: auto 0;
      }

      ::slotted(*) {
        border-radius: 8%;
        margin: 0.3em 0;
        padding: 0.2em 1em;
        color: #fff;
        font-weight: bold;
        background: rgb(60, 110, 255);
        cursor: pointer;
      }
      ::slotted(*:hover) {
        background: rgb(40, 80, 255);
      }
    `];M([v({type:String})],E.prototype,"helpLink",2);M([v({type:String})],E.prototype,"help",2);M([v({type:String})],E.prototype,"progress",2);M([v({type:Boolean})],E.prototype,"enabled",2);E=M([$("ndx-bottombar")],E);var lt=Object.defineProperty,at=Object.getOwnPropertyDescriptor,B=(r,e,t,i)=>{for(var s=i>1?void 0:i?at(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&lt(e,t,s),s};let _=class extends f{constructor(){super(...arguments),this.slide=0,this.title="Create a namespace",this.subtitle="v0.1.0",this.nextEnabled=!0,this.backEnabled=!0,this.buttonSize=40,this.xmlnl="http://www.w3.org/2000/svg",this.backArrow=Se`<path d="M480-160 160-480l320-320 42 42-248 248h526v60H274l248 248-42 42Z"/>`,this.nextArrow=Se`<path d="m480-160-42-43 247-247H160v-60h525L438-757l42-43 320 320-320 320Z"/>`}get length(){return this.childElementCount-1}slideBack(){this.slide>0&&this.backEnabled&&(this.slide=this.slide-1)}slideNext(){this.slide<this.length&&this.nextEnabled&&(this.slide=this.slide+1)}render(){return[...this.children].forEach(e=>e.style.transform=`translateX(-${this.slide*100}%)`),h`
      <div class="contextbar">
        <svg
          id="back"
          class=${this.slide!=0&&this.backEnabled?"enabled":""}
          @click=${this.slideBack}
          height="${this.buttonSize}"
          width="${this.buttonSize}"
          xmlns="${this.xmlnl}"
          viewBox="0 -960 960 960"
        >
          ${this.backArrow}
        </svg>
        <h1 class="title">${this.title}</h1>
        <div class="subtitle">${this.subtitle}</div>
        <svg
          id="next"
          class=${this.slide!=this.length&&this.nextEnabled?"enabled":""}
          @click=${this.slideNext}
          height="${this.buttonSize}"
          width="${this.buttonSize}"
          xmlns="${this.xmlnl}"
          viewBox="0 -960 960 960"
        >
          ${this.nextArrow}
        </svg>
      </div>
      <form id="ndx-main">
        <slot></slot>
      </form>
    `}};_.styles=m`
    :host {
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .contextbar {
      display: flex;
      flex-direction: row;
      border-bottom: 1px solid black;
      align-items: center;
      padding: 20px;
    }

    svg {
      border-radius: 25%;
      margin: 0.3em;
      padding: 0.2em;
      transition: 0.2s;
      opacity: 0.2;
    }

    .enabled {
      opacity: 1;
    }

    .enabled:hover {
      background: #f0f0f0;
    }

    .title {
      margin: 0 1em;
    }

    #next {
      margin-left: auto;
    }

    #ndx-main {
      margin-bottom: auto;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: row;
    }

    ::slotted(*) {
      flex-shrink: 0;
      width: 100%;
      height: 100%;
      transition: 0.3s;
    }
  `;B([G()],_.prototype,"slide",2);B([v({type:String})],_.prototype,"title",2);B([v({type:String})],_.prototype,"subtitle",2);B([v({type:Boolean})],_.prototype,"nextEnabled",2);B([v({type:Boolean})],_.prototype,"backEnabled",2);_=B([$("ndx-carousel")],_);/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function*dt(r,e){if(r!==void 0){let t=0;for(const i of r)yield e(i,t++)}}var ht=Object.defineProperty,ct=Object.getOwnPropertyDescriptor,Re=(r,e,t,i)=>{for(var s=i>1?void 0:i?ct(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&ht(e,t,s),s};let q=class extends f{constructor(){super(...arguments),this.authors=[["",""]]}closebtn(r){return h` <svg
      @click=${r}
      class="closebtn"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
    >
      <path
        d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"
      />
    </svg>`}removeAuthorRow(r){this.authors.length<=1||(this.authors=[...this.authors.slice(0,r),...this.authors.slice(r+1)])}appendRow(r){this.authors=[...this.authors,["",""]]}updateAuthorName(r,e){const t=r.target;this.authors=[...this.authors.slice(0,e),[t.value,this.authors[e][1]],...this.authors.slice(e+1)]}updateAuthorEmail(r,e){const t=r.target;this.authors=[...this.authors.slice(0,e),[this.authors[e][0],t.value],...this.authors.slice(e+1)]}_authorRows(r){return h`
      ${dt(r,([e,t],i)=>h`
                <input @change=${s=>this.updateAuthorName(s,i)} type="text" .value=${e} required></input>
                <input @change=${s=>this.updateAuthorEmail(s,i)} .value=${t} required></input>
                <div>
                    ${this.authors.length>1?this.closebtn(()=>this.removeAuthorRow(i)):h``}
                </div>
            `)}
    `}render(){return h`
      <div class="grid">
        <div>Name</div>
        <div>Email</div>
        <div></div>
        ${this._authorRows(this.authors)}
        <div @click=${this.appendRow} class="lightbtn">Add Author</div>
      </div>
    `}debug(){console.log(this.authors)}};q.styles=[fe,m`
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        padding: 1em;
      }
      .closebtn {
        height: 2em;
        width: 2em;
      }
      #addbtn {
        margin: 0.3em 0;
        padding: 0.2em;
        margin-right: auto;
        border: 1px solid #808080;
      }
      #addbtn:hover {
        background-color: #e0e0e0;
      }
    `];Re([v({type:Array})],q.prototype,"authors",2);q=Re([$("author-table")],q);var pt=Object.defineProperty,ut=Object.getOwnPropertyDescriptor,X=(r,e,t,i)=>{for(var s=i>1?void 0:i?ut(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&pt(e,t,s),s};let N=class extends f{constructor(){super(...arguments),this.name="",this.version="",this.completed=!1,this.description="",this.date=new Date}render(){return h`
            <div class="grid">
                <div>
                   <div>Name</div>
                   <input type="text" value=${this.name} placeholder="ndx-example"></input>
                </div>
                <div>
                   <div>Description</div>
                   <input type="textarea" .value=${this.description}></input>
                </div>
                <div>
                   <div>Full name</div>
                   <input type="text" .value="" placeholder=${this.name}></input>
                </div>
                <div>
                   <div>Version</div>
                   <input type="text" value=${this.version} placeholder="0.1.0"></input>
                </div>
                <div>
                   <div>Date</div>
                   <input type="text" value=${this.date.toLocaleDateString("en-US")}></input>
                </div>
            </div>
            <author-table></author-table>
            <ndx-bottombar help="New to NWB Extensions?" helpLink="">
               <div>Save</div>
            </ndx-bottombar>
        `}};N.styles=[fe,m`
      .bottombar {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: around;
      }
    `];X([v({type:String})],N.prototype,"name",2);X([v({type:String})],N.prototype,"version",2);X([G()],N.prototype,"completed",2);N=X([$("ndx-namespace")],N);var vt=Object.defineProperty,ft=Object.getOwnPropertyDescriptor,je=(r,e,t,i)=>{for(var s=i>1?void 0:i?ft(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&vt(e,t,s),s};let Z=class extends f{constructor(){super(...arguments),this.extendingNWBCore=!0}schemas(){var t;const r=(t=this.shadowRoot)==null?void 0:t.getElementById("schemafiles"),e=[];for(const i of r.files)e.push(i);return e}render(){return h`
      <div class="grid">
        <div class="btn">Choose a namespace</div>
        <label for="schemafiles" class="upload-btn"
          >Upload a file
          <input type="file" id="schemafiles" accept=".yaml" multiple />
        </label>

        <div>Extend an NWB Core Schema</div>
        <div>Build on a custom NWB Namepace</div>
      </div>
      <div class="grid">
        <div>Extending:</div>
        ${this.extendingNWBCore?h`
              <select name="coreSpec">
                <option>Electrical Series</option>
                <option>Time? Series</option>
                <option>EPhys? Series</option>
              </select>
            `:h`<div id="namespace" style="font-weight:bold;">
              ndx-example.namespace.yaml<br />
              ndx-example.extension.yaml
            </div>`}
      </div>
      <ndx-bottombar help="What is an NWB Spec?" helpLink="">
        <div>Save</div>
      </ndx-bottombar>
    `}};Z.styles=m`
    .grid {
      gap: 2em;
      width: 50%;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .btn {
      margin: auto;
      padding: 1em;
      border: 1px solid #808080;
    }
  `;je([G()],Z.prototype,"extendingNWBCore",2);Z=je([$("ndx-schema")],Z);var mt=Object.defineProperty,gt=Object.getOwnPropertyDescriptor,Q=(r,e,t,i)=>{for(var s=i>1?void 0:i?gt(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&mt(e,t,s),s};let L=class extends f{constructor(){super(...arguments),this.showall=!0,this.isDatasetNotFolder=!1}generateRequiredFields(){return h``}generateAdvancedFields(){return h`<label for="name">Name</label>
      <input name="name" type="text" />
      <label for="default-name">Default Name</label>
      <input name="default-name" type="checkbox" /> `}render(){return h`<div id="type">
        <div id="standard-fields">
          <div class="row">
            <div id="kind">Folder <span id="dropdownbtn">▾</span></div>
            <input name="typename" type="text" placeholder="New type name" />
          </div>
          <textarea
            name="description"
            placeholder="Describe this ${this.isDatasetNotFolder?"dataset":"folder"}"
          ></textarea>
          ${this.generateRequiredFields()}
          <div class="row">
            <div id="extends">extends</div>
            <div id="incType">Pick a type</div>
          </div>
        </div>
        <div id="advanced-fields">
          <div>Advanced fields:</div>
          ${this.generateAdvancedFields()}
        </div>
      </div>
      <typedef-subtree></typedef-subtree>`}};L.styles=m`
    :host {
      display: flex;
      flex-direction: column;
      width: min-content;
      height: min-content;
      margin: 5em 5em;
    }

    #type {
      border-radius: 1em;
      border: 2px solid #aaa;
      background: #fff;
      padding: 1em;
      display: grid;
      grid-template-columns: 5fr 3fr;
      min-width: 600px;
    }

    .row {
      display: flex;
      flex-direction: row;
      width: 100%;
      align-items: center;
    }

    #kind {
      display: flex;
      flex-direction: row;
      flex-wrap: none;
      border: 2px solid #aaa;
      padding: 0.5em;
      border-radius: 0.3em;
      margin-right: 1em;
    }

    input[name="typename"] {
      width: 100%;
      font-size: 2em;
      padding: 0 0.5em;
    }

    textarea {
      margin: 1em 0;
    }

    #dropdownbtn {
    }

    #incType {
      padding: 0.3em 0.7em;
      font-size: 1.5em;
      border: 2px solid #aaa;
      border-radius: 0.3em;
      color: #aaa;
      cursor: pointer;
    }

    #extends {
      margin-left: auto;
      margin-right: 0.5em;
      font-size: 1.5em;
    }

    #advanced-fields {
      padding: 0.5em 1em;
      margin-left: 1em;
      border-left: 1px solid #888;
    }

    #advanced-fields > div:first-child {
      margin-top: -0.5em;
      margin-bottom: 0.5em;
    }

    #advanced-fields > label {
      text-decoration: underline;
    }
  `;Q([v({type:Boolean})],L.prototype,"showall",2);Q([v({type:Boolean})],L.prototype,"isDatasetNotFolder",2);L=Q([$("typedef-constructor")],L);let de=class extends f{subtreeBranch(r=!0){return h`<div class="branch-row">
      <div class="branchline">
        <div class="elbow"></div>
        ${r?h` <div class="vert"></div>`:""}
      </div>
      <div class="branchelement">
        <div class="typedec">newdata</div>
      </div>
      <div class="branchelement">
        <div class="horizontal"></div>
      </div>
      <div class="branchelement">
        <div>Add</div>
      </div>
    </div>`}render(){return h`
      ${this.subtreeBranch()} ${this.subtreeBranch()} ${this.subtreeBranch()}
      ${this.subtreeBranch(!1)}
    `}};de.styles=m`
    :host {
      display: flex;
      flex-direction: column;
    }

    // DEBUG
    // :host * {
    //   border: 1px solid red;
    // }

    .branch-row {
      display: flex;
      flex-direction: row;
    }

    .branch-row > * {
      margin-right: 0.5em;
    }

    .branch-row > div {
      display: flex;
      flex-direction: column;
    }

    .branch-row > div:first-child {
      margin-left: 5em;
    }

    .branchline {
      display: flex;
      flex-direction: column;
    }

    .branchline > .elbow {
      min-height: 4em;
      width: 4em;
      border-bottom: 8px solid #aaa;
      border-left: 8px solid #aaa;
    }

    .branchline > .vert {
      height: 100%;
      border-left: 8px solid #aaa;
    }

    .branchelement > .horizontal {
      padding-top: 1em;
      width: 2em;
      border-bottom: 8px solid #aaa;
    }

    .branchelement {
      margin-top: 3em;
    }

    .branchelement:last-child {
      margin-top: 3.2em;
      border: 2px solid #aaa;
      margin-bottom: auto;
      padding: 0.2em 0.5em;
    }

    .typedec {
      height: 200px;
      background: lightblue;
    }
  `;de=Q([$("typedef-subtree")],de);var $t=Object.defineProperty,bt=Object.getOwnPropertyDescriptor,me=(r,e,t,i)=>{for(var s=i>1?void 0:i?bt(e,t):e,o=r.length-1,n;o>=0;o--)(n=r[o])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&$t(e,t,s),s};let K=class extends f{constructor(){super(...arguments),this.complete=!1}render(){const r=document.getElementById("carousel");return this.complete||(r.nextEnabled=!1),h`
      <ndx-type-bar></ndx-type-bar>
      <div id="board">
        <typedef-constructor></typedef-constructor>
      </div>
    `}};K.styles=m`
    :host {
      display: grid;
      background-size: 60px 60px;
      background-image: linear-gradient(to right, #ddd 1px, transparent 1px),
        linear-gradient(to bottom, #ddd 1px, transparent 1px);
      grid-template-columns: 1fr 5fr;
    }

    #board {
      overflow: scroll;
    }
  `;me([G()],K.prototype,"complete",2);K=me([$("ndx-types-builder")],K);let he=class extends f{render(){return h`
      <h1>My Types</h1>
      <slot></slot>
      <span id="addbtn">add</span>
    `}};he.styles=m`
    :host {
      display: flex;
      flex-direction: column;
      background: #fff;
      border-right: 1px solid #555;
      padding: auto;
    }

    h1 {
      margin: 0 0 0.5em 0;
      padding: 0.2em 0;
      text-align: center;
      border-bottom: 1px solid #555;
    }

    #addbtn {
      cursor: pointer;
      margin: 0 auto;
      padding: 0.5em 3em;
      font-weight: bold;
      border-radius: 0.5em;
      border: 1px solid #808080;
    }
  `;he=me([$("ndx-type-bar")],he);
