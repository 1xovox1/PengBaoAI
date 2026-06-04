import{_ as j,f as q,J as G,o as s,c as n,a as l,b as o,w as a,t as r,h as _,v as u,n as H,k as J,e as y,r as d,K as O,u as P,l as g,L as Q,M,d as v,N as X,A as Y,F as A,g as F,H as Z}from"./index-BHi8505F.js";import{g as $,a as x}from"./agents-CrndzMNG.js";import"./http-BcSfiTa-.js";const ee={class:"agent-app"},le={class:"app-header"},te={key:0,class:"header-main"},ae={class:"agent-title"},se={class:"agent-icon"},oe={class:"title-text"},ie={class:"name"},ne={class:"meta"},de={class:"pill"},re={class:"pill"},ce={key:1,class:"header-right"},ue={style:{"margin-left":"6px"}},ve={key:0,class:"empty"},pe={key:1,class:"app-body"},me={class:"tab-content"},_e={key:0,class:"overview"},fe={class:"desc"},be={class:"overview-kpis"},he={class:"kpi"},ke={class:"kpi-value"},we={class:"kpi"},ye={class:"kpi-value"},ge={class:"kpi"},xe={class:"kpi-value"},Ce={class:"module-list"},Me={key:1,class:"workbench"},Ae={key:0,class:"external"},Fe=["src"],Ue={key:1,class:"internal"},Ve={class:"internal-left"},Be={class:"internal-main"},Te={key:2,class:"settings"},Ie={__name:"AgentAppView",setup(Ne){const U=O(),V=P(),B=J(()=>U.params.agentId),e=y(null),m=y("workbench"),p=y("");q(async()=>{try{const i=await $(B.value),t=i!=null&&i.icon&&x[i.icon]?x[i.icon]:x.Document;e.value={...i,icon:t}}catch{e.value=null}}),G(e,i=>{if(!i)return;const t=i.modules||[];p.value=t[0]||""},{immediate:!0});const T=()=>{V.push("/agents")},I=()=>{var i;(i=e.value)!=null&&i.appUrl&&window.open(e.value.appUrl,"_blank","noopener,noreferrer")},N=()=>{e.value&&(e.value.isFavorite=!e.value.isFavorite,Z.success(e.value.isFavorite?"已添加到收藏":"已取消收藏"))},S={props:{activeModule:{type:String,default:""}},template:`
    <div class="workbench-inner">
      <el-alert
        title="这里是“竞品监控”小系统的工作台示例（Mock 数据）"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 12px;"
      />

      <template v-if="activeModule === '监控看板'">
        <div class="kpi-grid">
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">监控商品</div><div class="kpi-value">28</div></el-card>
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">今日变价</div><div class="kpi-value">6</div></el-card>
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">预警中</div><div class="kpi-value">2</div></el-card>
          <el-card shadow="never" class="kpi-card"><div class="kpi-label">更新频率</div><div class="kpi-value">15min</div></el-card>
        </div>
        <el-card shadow="never">
          <template #header><div class="card-title">最新变价</div></template>
          <el-table :data="rows" style="width: 100%">
            <el-table-column prop="name" label="竞品" min-width="160" />
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column prop="from" label="原价" width="120" />
            <el-table-column prop="to" label="现价" width="120" />
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="status" label="状态" width="120" />
          </el-table>
        </el-card>
      </template>

      <template v-else-if="activeModule === '监控规则'">
        <el-card shadow="never">
          <template #header><div class="card-title">规则配置</div></template>
          <el-form label-width="120px">
            <el-form-item label="监控平台">
              <el-select model-value="京东" style="width: 240px">
                <el-option label="京东" value="京东" />
                <el-option label="天猫" value="天猫" />
                <el-option label="拼多多" value="拼多多" />
              </el-select>
            </el-form-item>
            <el-form-item label="触发阈值">
              <el-input model-value="降价 >= 50 元 或 >= 5%" style="max-width: 520px" />
            </el-form-item>
            <el-form-item label="频率">
              <el-radio-group model-value="15min">
                <el-radio-button label="5min" />
                <el-radio-button label="15min" />
                <el-radio-button label="1h" />
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存规则</el-button>
              <el-button>测试一次</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>

      <template v-else-if="activeModule === '订阅提醒'">
        <el-card shadow="never">
          <template #header><div class="card-title">订阅渠道</div></template>
          <el-form label-width="120px">
            <el-form-item label="企业微信">
              <el-switch model-value />
            </el-form-item>
            <el-form-item label="邮件">
              <el-switch model-value="false" />
            </el-form-item>
            <el-form-item label="提醒人群">
              <el-select model-value="电商运营组" style="width: 240px">
                <el-option label="电商运营组" value="电商运营组" />
                <el-option label="市场推广组" value="市场推广组" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存订阅</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>

      <template v-else>
        <el-card shadow="never">
          <template #header><div class="card-title">对比报告</div></template>
          <div class="hint">这里可接入报表/下载/自动生成周报（当前为占位）。</div>
        </el-card>
      </template>
    </div>
  `,data(){return{rows:[{name:"竞品A",sku:"A-128",from:"¥1999",to:"¥1899",time:"10:12",status:"降价"},{name:"竞品B",sku:"B-256",from:"¥2499",to:"¥2599",time:"09:40",status:"涨价"},{name:"竞品C",sku:"C-64",from:"¥999",to:"¥899",time:"08:55",status:"降价"}]}}},D={props:{agent:{type:Object,required:!0},activeModule:{type:String,default:""}},template:`
    <div class="workbench-inner">
      <el-alert
        :title="'这里是“' + agent.name + '”的小系统工作台占位（后续可接入真实功能模块）'"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 12px;"
      />
      <el-card shadow="never">
        <template #header><div class="card-title">当前模块：{{ activeModule || '未选择' }}</div></template>
        <div class="hint">
          你可以把每个模块理解为一个独立页面/功能：例如“生成器/规则/看板/历史/导出”等。
          后续只要把模块路由、权限、API 接上，就能形成真正可上线的小系统。
        </div>
      </el-card>
    </div>
  `};return(i,t)=>{const f=d("el-icon"),b=d("el-button"),E=d("el-empty"),h=d("el-tab-pane"),z=d("el-tabs"),k=d("el-card"),C=d("el-tag"),K=d("el-menu-item"),L=d("el-menu"),w=d("el-form-item"),R=d("el-input"),W=d("el-form");return s(),n("div",ee,[l("div",le,[o(b,{text:"",class:"back-btn",onClick:T},{default:a(()=>[o(f,null,{default:a(()=>[o(g(Q))]),_:1}),t[2]||(t[2]=l("span",{style:{"margin-left":"6px"}},"返回",-1))]),_:1}),e.value?(s(),n("div",te,[l("div",ae,[l("div",se,[o(f,{size:22},{default:a(()=>[(s(),u(M(e.value.icon)))]),_:1})]),l("div",oe,[l("div",ie,r(e.value.name),1),l("div",ne,[l("span",de,r(e.value.department),1),l("span",re,r(e.value.capability),1)])])])])):_("",!0),e.value?(s(),n("div",ce,[e.value.appType==="external"&&e.value.appUrl?(s(),u(b,{key:0,type:"primary",onClick:I},{default:a(()=>[...t[3]||(t[3]=[v(" 打开系统 ",-1)])]),_:1})):_("",!0),o(b,{text:"",class:H({favorited:e.value.isFavorite}),onClick:N},{default:a(()=>[o(f,null,{default:a(()=>[(s(),u(M(e.value.isFavorite?g(X):g(Y))))]),_:1}),l("span",ue,r(e.value.isFavorite?"已收藏":"收藏"),1)]),_:1},8,["class"])])):_("",!0)]),e.value?(s(),n("div",pe,[o(z,{modelValue:m.value,"onUpdate:modelValue":t[0]||(t[0]=c=>m.value=c),class:"app-tabs"},{default:a(()=>[o(h,{name:"overview",label:"概览"}),o(h,{name:"workbench",label:"工作台"}),o(h,{name:"settings",label:"设置"})]),_:1},8,["modelValue"]),l("div",me,[m.value==="overview"?(s(),n("div",_e,[o(k,{shadow:"never",class:"card"},{header:a(()=>[...t[4]||(t[4]=[l("div",{class:"card-title"},"这个小系统做什么？",-1)])]),default:a(()=>[l("div",fe,r(e.value.description),1),l("div",be,[l("div",he,[t[5]||(t[5]=l("div",{class:"kpi-label"},"使用次数",-1)),l("div",ke,r(e.value.usageCount),1)]),l("div",we,[t[6]||(t[6]=l("div",{class:"kpi-label"},"评分",-1)),l("div",ye,r(e.value.rating),1)]),l("div",ge,[t[7]||(t[7]=l("div",{class:"kpi-label"},"模块数",-1)),l("div",xe,r((e.value.modules||[]).length),1)])])]),_:1}),o(k,{shadow:"never",class:"card"},{header:a(()=>[...t[8]||(t[8]=[l("div",{class:"card-title"},"功能模块",-1)])]),default:a(()=>[l("div",Ce,[(s(!0),n(A,null,F(e.value.modules||[],c=>(s(),u(C,{key:c,effect:"plain"},{default:a(()=>[v(r(c),1)]),_:2},1024))),128))])]),_:1})])):m.value==="workbench"?(s(),n("div",Me,[e.value.appType==="external"&&e.value.appUrl?(s(),n("div",Ae,[l("iframe",{class:"app-iframe",src:e.value.appUrl},null,8,Fe)])):(s(),n("div",Ue,[l("div",Ve,[t[9]||(t[9]=l("div",{class:"side-title"},"模块",-1)),o(L,{"default-active":p.value,class:"module-menu",onSelect:t[1]||(t[1]=c=>p.value=c)},{default:a(()=>[(s(!0),n(A,null,F(e.value.modules||[],c=>(s(),u(K,{key:c,index:c},{default:a(()=>[v(r(c),1)]),_:2},1032,["index"]))),128))]),_:1},8,["default-active"])]),l("div",Be,[e.value.slug==="competitor-monitor"?(s(),u(S,{key:0,"active-module":p.value},null,8,["active-module"])):(s(),u(D,{key:1,agent:e.value,"active-module":p.value},null,8,["agent","active-module"]))])]))])):(s(),n("div",Te,[o(k,{shadow:"never",class:"card"},{header:a(()=>[...t[10]||(t[10]=[l("div",{class:"card-title"},"上线形态",-1)])]),default:a(()=>[o(W,{"label-width":"120px"},{default:a(()=>[o(w,{label:"承载方式"},{default:a(()=>[o(C,{type:"info",effect:"plain"},{default:a(()=>[v(r(e.value.appType==="external"?"外部系统（iframe/跳转）":"内置工作台（本项目承载）"),1)]),_:1})]),_:1}),e.value.appType==="external"?(s(),u(w,{key:0,label:"系统地址"},{default:a(()=>[o(R,{"model-value":e.value.appUrl,readonly:""},null,8,["model-value"])]),_:1})):_("",!0),o(w,{label:"说明"},{default:a(()=>[...t[11]||(t[11]=[l("div",{class:"hint"},[v(" 后续你只需要给每个 Agent 配一个 "),l("code",null,"appUrl"),v("（外部小系统）或配置模块与权限（内置小系统），就能做到“点进去就是一个系统”。 ")],-1)])]),_:1})]),_:1})]),_:1})]))])])):(s(),n("div",ve,[o(E,{description:"Agent 不存在或已下线"})]))])}}},ze=j(Ie,[["__scopeId","data-v-41ef319e"]]);export{ze as default};
