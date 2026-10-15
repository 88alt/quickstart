<template>
  <main class="canvas-home layout-design-home ordered-home" :class="{'ordered-editing':editing,'slot-overview-active':overview}" data-ordered-home @click="blankClick">
    <header class="lab-header"><router-link class="lab-brand" :to="target('/')"><span class="canvas-logo">Q<i></i></span><span>Quickstart<small>iStoreOS</small></span></router-link><span class="lab-header-context">{{t('我的网络空间','My network space')}}</span><div class="lab-header-actions"><button @click="toggleTheme" :aria-label="t('切换主题','Toggle theme')">{{theme==='dark'?'☼':'◐'}}</button><details class="lab-scenes"><summary :aria-label="t('设计预览','Design preview')"><span class="direct-preview-long">{{t('设计预览','Design preview')}}</span><span class="direct-preview-short">{{t('预览','Preview')}}</span></summary><div><small>{{t('合成数据 · 刷新恢复示例','Synthetic data · Reload resets')}}</small><label>{{t('布局示例','Layout sample')}}<select aria-label="布局示例" :value="route.query.preset||'normal'" @change="changeSample"><option value="normal">{{t('默认并排','Default rows')}}</option><option value="half">{{t('应用半宽','Half-width apps')}}</option><option value="stacked">{{t('左大右上下','Tall left')}}</option><option value="mirrored">{{t('左上下右大','Tall right')}}</option><option value="services">{{t('三列服务','Three services')}}</option></select></label><label>{{t('数据场景','Scenario')}}<select aria-label="数据场景" :value="demo.scenario" @change="changeQuery('scenario',$event)"><option v-for="scene in scenes" :key="scene[0]" :value="scene[0]">{{t(scene[1],scene[2])}}</option></select></label><label>{{t('地址分配方','Address allocator')}}<select aria-label="地址分配方" :value="demo.authority" @change="changeQuery('authority',$event)"><option value="external">{{t('其他主路由','Another router')}}</option><option value="local">{{t('本机','This router')}}</option><option value="unknown">{{t('待确认','Unknown')}}</option></select></label><button @click="toggleLanguage">中文 / English</button></div></details><button ref="editButton" class="lab-edit-button" @click="editing?cancel():begin()" :aria-pressed="editing" :aria-label="t('自定义首页','Customize home')"><StudioGlyph name="tune"/><span>{{t('自定义首页','Customize home')}}</span></button></div></header>
    <div class="lab-intro"><div><span class="lab-eyebrow">{{t('首页概览','HOME OVERVIEW')}}</span><h1>{{t('连接、设备与生活','Your connected home')}}</h1></div><span class="lab-intro-status"><i :class="{ready:data.network?.internetConnected&&!errors.network}"></i>{{t('我的网络','My network')}}<small>{{t('设计示例','Design sample')}}</small></span></div>

    <section v-if="editing" class="direct-toolbar" aria-label="首页布局编辑器">
      <span class="direct-edit-label"><i></i>{{t('整理首页','Arrange home')}}</span>
      <button @click="openSlot(null)" data-open-library>＋ {{t('添加模块','Add module')}}</button>
      <button @click="toggleOverview" :aria-pressed="overview" data-overview>{{overview?t('真实页面','Real page'):t('布局总览','Overview')}}</button>
      <button @click="undo" :disabled="!history.length" data-undo>↶ <span>{{t('撤销','Undo')}}</span></button>
      <button @click="openPanel('more')">{{t('更多','More')}} ···</button>
      <div class="direct-toolbar-end"><button @click="cancel" data-cancel>{{t('取消','Cancel')}}</button><button @click="apply" class="primary" data-apply>{{t('完成','Done')}}</button></div>
    </section>
    <DirectEditPanel v-if="panel==='more'" :title="t('预览与恢复','Preview and restore')" @close="closePanel">
      <p class="direct-panel-note">{{t('布局只保留在本次预览，刷新恢复示例。','Preview memory only. Reload resets the sample.')}}</p>
      <button class="direct-panel-action" @click="mutate(()=>recommended());closePanel()" data-reset>{{t('恢复推荐布局','Restore recommended')}}</button>
      <button class="direct-panel-action" @click="addRow();panel='row'" data-add-row>＋ {{t('添加空行','Add empty row')}}</button>
      <button class="direct-panel-action" @click="hideAll();closePanel()">{{t('全部收起','Hide all')}}</button>
      <div class="ordered-width"><label>{{t('内容预览宽度','Content preview width')}}<input type="range" min="292" :max="Math.max(292,availableWidth)" step="1" :value="Math.min(previewWidth||availableWidth,availableWidth)" @input="previewWidth=Number(($event.target as HTMLInputElement).value)" aria-label="内容预览宽度"/><output>{{Math.round(contentWidth)}}px</output></label><button @click="previewWidth=0">{{t('自动宽度','Auto width')}}</button><span>{{t('缩窄不改写你的布局，变宽后恢复','Narrow previews preserve the wide layout')}}</span></div>
    </DirectEditPanel>
    <DirectEditPanel v-if="panel==='targets'&&moving" :title="t('移动到哪里','Choose a destination')" @close="closePanel">
      <p class="direct-panel-note">{{sourceName}} · {{t('选择目标，确认前不会改变布局。','Choose a destination. Nothing changes until confirmed.')}}</p>
      <button v-for="target in moveTargets" :key="targetKey(target)" class="direct-target-option" :data-target-option="targetKey(target)" :aria-disabled="!!targetInfo(target).issue" @click="place(target)"><span>{{targetInfo(target).label}}</span><small v-if="targetInfo(target).issue">{{issueText(targetInfo(target).issue)}}</small></button>
    </DirectEditPanel>
    <div v-if="moving" class="direct-moving-bar" role="status"><span>{{sourceName}} <small>{{t('选择位置','Choose destination')}}</small></span><button @click="panel='targets'">{{t('目标列表','Destinations')}}</button><button @click="cancelMoving">{{t('取消移动','Cancel move')}}</button></div>
    <div v-if="dragPoint" class="direct-drag-ghost" :style="{left:dragPoint.x+'px',top:dragPoint.y+'px'}">⠿ {{sourceName}}<small>{{hoverInfo}}</small></div>
    <DirectEditPanel v-if="panel==='row'" :title="t('这一行的布局','This row’s layout')" @close="closePanel">
      <template v-if="selectedRow">
        <div class="ordered-template-list" aria-label="行布局样式"><button v-for="preset in templates" :key="preset.id" @click="setTemplate(preset.id)" :class="{active:selectedRow.template===preset.id}" :aria-pressed="selectedRow.template===preset.id" :data-template="preset.id"><span class="ordered-miniature" :class="preset.id"><i v-for="(n,index) in preset.slots" :key="index"><b v-for="k in n" :key="k"></b></i></span>{{t(preset.zh,preset.en)}}</button></div>
        <section v-if="requestedTemplate" class="slot-change-preview" data-structure-preview>
          <h3>{{t('布局预览','Layout preview')}} · {{requestedTemplateName}}</h3>
          <p v-if="visibleIds([selectedRow]).length>templateCapacity">{{t('请选择保留的模块；未保留项仅从首页隐藏。','Choose what to keep. Other modules will only be hidden.')}}</p>
          <template v-if="visibleIds([selectedRow]).length>templateCapacity"><label v-for="id in visibleIds([selectedRow])" :key="id" class="slot-retained"><input type="checkbox" :checked="retainedIds.includes(id)" @change="toggleRetained(id)" :data-retain="id"/>{{name(id)}}</label></template>
          <p v-else>{{visibleIds([selectedRow]).map(name).join(' · ')}}</p>
          <p v-if="structureResult.hidden.length">{{t('将隐藏：','Will hide: ')}}{{structureResult.hidden.map(name).join('、')}}</p>
          <p v-if="structureResult.issue" role="status">{{issueText(structureResult.issue)}}</p>
          <button v-if="structureResult.requiredHeight" @click="structureHeight=structureResult.requiredHeight" data-accept-height>{{t('采用建议行高','Use suggested height')}} · {{structureResult.requiredHeight}} px</button>
          <div class="slot-confirm"><button @click="requestedTemplate=null">{{t('取消更改','Cancel change')}}</button><button :disabled="!!structureResult.issue" @click="confirmStructure" data-confirm-structure class="primary">{{t('采用此布局','Use layout')}}</button></div>
        </section>
        <div class="direct-size-presets"><small>{{t('行高','Row height')}}</small><button v-for="(label,index) in [t('紧凑','Compact'),t('标准','Standard'),t('宽裕','Spacious')]" :key="label" @click="setHeight(presetHeights[index])" :aria-pressed="selectedRow.height===presetHeights[index]" :data-height-preset="index">{{label}}<small>{{presetHeights[index]}} px</small></button></div>
        <div v-if="selectedRow.columns.length>1" class="direct-ratio-presets"><small>{{t('列宽比例','Column proportions')}}</small><button v-for="ratio in widthPresets" :key="ratio.join('/')" @click="setWeights(ratio)" :aria-pressed="selectedRow.columns.map(c=>c.weight).join('/')===ratio.join('/')" :data-width-preset="ratio.join('/')"><i v-for="(weight,index) in ratio" :key="index" :style="{flex:weight}"></i><span>{{ratio.join(' / ')}}</span></button></div>
        <label v-for="(column,ci) in selectedRow.columns.filter(c=>c.cards.length===2)" :key="ci" class="direct-split-choice">{{t('上下比例','Top / bottom')}}<button v-for="value in [50,60,40]" :key="value" @click="setSplit(selectedRow.columns.indexOf(column),value)" :data-stack-preset="value">{{value}} / {{100-value}}</button></label>
        <details class="direct-precise"><summary>{{t('精确尺寸','Exact size')}}</summary><label>{{t('行高','Row height')}}<select aria-label="行高" :value="selectedRow.height" @change="setHeight(Number(($event.target as HTMLSelectElement).value))"><option v-for="n in heightOptions" :key="n" :value="n" :disabled="heightIssue(n)">{{n}} px {{heightIssue(n)?t('· 高度不足','· Too short'):''}}</option></select></label><label v-if="selectedRow.columns.length>1">{{t('列宽','Column widths')}}<select aria-label="列宽比例" :value="selectedRow.columns.map(c=>c.weight).join('/')" @change="setWeights(String(($event.target as HTMLSelectElement).value).split('/').map(Number))"><option v-for="ratio in widthPresets" :key="ratio.join('/')" :value="ratio.join('/')">{{ratio.join(' / ')}}</option></select></label></details>
        <div class="ordered-row-actions"><button @click="moveRow(-1)" :disabled="selectedIndex===0" :aria-label="t('整行上移','Move row up')">↑</button><button @click="moveRow(1)" :disabled="selectedIndex===draft.length-1" :aria-label="t('整行下移','Move row down')">↓</button><button @click="hideRow" data-hide-row>{{t('收起整行','Hide row')}}</button></div>
        <p class="ordered-editor-hint">{{t('选择结构，在首页直接拖动分隔线调整比例。上下组合使用紧凑摘要。','Choose a structure; resize dividers on the home page. Stacks use compact summaries.')}}</p>
      </template>
    </DirectEditPanel>
    <p class="ordered-notice" v-if="notice" role="status" aria-live="polite" data-layout-notice>{{notice}}</p>
    <DirectEditPanel v-if="panel==='finish'&&finishPreview" :title="t('完成前整理','Review before finishing')" @close="closePanel">
      <p class="direct-panel-note">{{t('仅整理本次留下的空位，不合并不同行。确认前首页布局不变。','Only empty slots are simplified. Rows are never merged. Nothing is applied until you confirm.')}}</p>
      <div v-for="row in draft" :key="row.id" class="slot-finish-row" :data-finish-row="row.id"><strong>{{t('第','Row ')+(draft.indexOf(row)+1)+t('行','')}}</strong><small>{{rowDescription(row)}} → {{rowDescription(finishPreview.rows.find(r=>r.id===row.id))}}</small></div>
      <section v-for="problem in finishPreview.problems" :key="problem.row" class="slot-change-preview" data-finish-problem>
        <p>{{t('第','Row ')+(draft.findIndex(r=>r.id===problem.row)+1)+t('行：',' · ')}}{{issueText(problem.issue)}}</p>
        <button v-if="problem.requiredHeight" @click="acceptFinishHeight(problem.row,problem.requiredHeight)" data-finish-height>{{t('采用建议行高','Use suggested height')}} · {{problem.requiredHeight}} px</button>
        <button @click="fixRow(problem.row)" data-fix-row>{{t('定位并修改布局','Locate and fix layout')}}</button>
      </section>
      <div class="slot-confirm"><button @click="closePanel()" data-cancel-finish>{{t('继续编辑','Keep editing')}}</button><button :disabled="!!finishPreview.issue" @click="confirmFinish" data-confirm-finish class="primary">{{t('确认整理并完成','Confirm and finish')}}</button></div>
    </DirectEditPanel>

    <section v-if="editing&&overview" class="slot-overview" data-layout-overview @pointerover="trackTarget" @focusin="trackTarget">
      <div class="slot-overview-heading"><h2>{{t('把首页排成你喜欢的样子','Make room for what matters')}}</h2><p role="status">{{moving?hoverInfo:t('点选模块来移动，或拖动名称；调整尺寸请返回真实页面。','Select a module to move it, or drag its name. Resize on the real page.')}}</p></div>
      <section v-for="(row,ri) in draft" :key="row.id" class="slot-overview-row" :data-overview-row="row.id">
        <button v-if="moving" class="slot-overview-gap" :data-placement="'edge:'+row.id" @click="place({kind:'edge',before:row.id})" :aria-label="targetInfo({kind:'edge',before:row.id}).label"><span>＋ {{targetInfo({kind:'edge',before:row.id}).label}}</span></button>
        <header><strong>{{t('第','Row ')+(ri+1)+t('行','')}}</strong><span>{{row.height}} px · {{row.columns.map(c=>c.weight).join(' / ')}}</span><button @pointerdown="startMovePointer($event,{kind:'row',id:row.id})" @click="startMoving({kind:'row',id:row.id})" :data-row-handle="row.id" :aria-label="t('移动整行','Move row')+' '+(ri+1)">⠿</button><button @click="selected=row.id;openPanel('row')" :data-select-row="row.id">{{t('布局','Layout')}} ▦</button></header>
        <div class="slot-overview-grid" :class="{stacked:row.columns.some(c=>c.cards.length===2)}" :style="{gridTemplateColumns:row.columns.map(c=>'minmax(0,'+c.weight+'fr)').join(' '),height:row.columns.some(c=>c.cards.length===2)?'184px':'88px'}">
          <div v-for="(column,ci) in row.columns" :key="ci" class="slot-overview-column" :style="columnStyle(column)">
            <div v-for="(id,si) in column.cards" :key="si" class="slot-overview-card" :class="{chosen:selectedCard===id,drop:hoverTarget==='slot:'+row.id+':'+ci+':'+si}">
              <template v-if="id"><button class="slot-overview-name" @pointerdown="startMovePointer($event,{kind:'card',id})" @click="selectCard(row.id,id)" :data-drag-card="id"><StudioGlyph :name="widget(id).glyph"/>{{name(id)}}</button><div class="slot-overview-actions"><button v-if="selectedCard===id" @click="startMoving({kind:'card',id})" :data-move-card="id">{{t('移动','Move')}}</button><button v-else @click="locateReal(id)" :aria-label="t('查看','Preview ')+name(id)">↗</button><button @click="openSlot({kind:'slot',row:row.id,column:ci,slot:si})" :aria-label="t('替换','Replace ')+name(id)">···</button></div></template>
              <button v-else class="slot-overview-empty" :data-overview-empty="'slot:'+row.id+':'+ci+':'+si" @click="openSlot({kind:'slot',row:row.id,column:ci,slot:si})">＋ {{t('添加','Add')}}</button>
              <button v-if="moving" class="slot-overview-drop" :data-placement="'slot:'+row.id+':'+ci+':'+si" :aria-label="targetInfo({kind:'slot',row:row.id,column:ci,slot:si}).label" :aria-disabled="!!targetInfo({kind:'slot',row:row.id,column:ci,slot:si}).issue" @click="place({kind:'slot',row:row.id,column:ci,slot:si})"><span>{{id?name(id):t('空位','Empty')}}</span><small>{{targetInfo({kind:'slot',row:row.id,column:ci,slot:si}).issue?issueText(targetInfo({kind:'slot',row:row.id,column:ci,slot:si}).issue):t('放入此处','Place here')}}</small></button>
            </div>
          </div>
          <template v-if="moving&&moving.kind!=='row'"><button v-for="index in row.columns.length+1" :key="index" class="slot-overview-insert" :style="{left:overviewInsertion(row,index-1)}" :data-placement="'beside:'+row.id+':'+(index-1)" :aria-label="targetInfo({kind:'beside',row:row.id,index:index-1}).label" :aria-disabled="!!targetInfo({kind:'beside',row:row.id,index:index-1}).issue" @click="place({kind:'beside',row:row.id,index:index-1})"><span>＋</span></button></template>
        </div>
      </section>
      <button v-if="moving" class="slot-overview-end" data-placement="edge:end" @click="place({kind:'edge',before:null})">＋ {{t('放到最后','Place at end')}}</button>
      <button v-if="!draft.length" class="slot-overview-end" @click="addRow()">＋ {{t('添加空行','Add empty row')}}</button>
    </section>
    <div class="lab-available" :class="{'slot-parked':overview}" ref="availableElement"><div class="lab-content ordered-content" ref="contentElement" :style="{maxWidth:previewWidth?previewWidth+'px':undefined}">
      <section v-for="row in actualRows" :key="row.id" class="ordered-row" :class="{selected:editing&&row.source===selected}" :style="rowStyle(row)" :data-ordered-row="row.id" :data-row-source="row.source">
        <button v-if="moving&&isFirstFragment(row)" class="direct-gap-target" :data-placement="'edge:'+row.source" @click="place({kind:'edge',before:row.source})">＋ {{t('独占新行 / 整行移到这里','New row / move row here')}}</button>
        <div v-if="editing" class="direct-row-tools"><button @click="selected=row.source;openPanel('row')" :aria-label="t('第','Row ')+(draft.findIndex(r=>r.id===row.source)+1)+t('行布局',' layout')" :data-select-row="row.source">{{t('布局','Layout')}} ▦</button></div>
        <div v-for="(column,ci) in row.columns" :key="column.source" class="ordered-column" :style="columnStyle(column)" :data-ordered-column="ci">
          <div v-for="(id,si) in column.cards" :key="id||'empty-'+si" class="ordered-card" :class="{drop:hoverTarget===slotKey(row,column,si),chosen:selectedCard===id}" :data-ordered-card="id||undefined">
            <template v-if="id">
              <div v-if="editing" class="ordered-card-controls slot-card-tools"><button @click="openSlot(slotTarget(row,column,si))" :aria-label="t('替换','Replace ')+name(id)" :data-replace-module="id">{{t('替换','Replace')}}</button><button @click="hideCard(id)" :aria-label="t('从首页移除','Hide ')+name(id)" :data-hide-module="id">×</button></div>
              <CompactPreviewCard v-if="column.compact&&compactIds.includes(id)" :inert="editing?'':undefined" :id="id" :data="data" :errors="errors" @navigate="go" @retry="retry"/>
              <LayoutPreviewCard v-else :inert="editing?'':undefined" :id="id" :data="data" :errors="errors" :devices="devices" :theme="theme" contained @navigate="go" @device="openDevice" @retry="retry"/>
            </template>
            <button v-else class="direct-empty-slot" @click="openSlot(slotTarget(row,column,si))" :data-empty-slot="slotKey(row,column,si)">＋ {{t('添加模块','Add module')}}</button>
            <button v-if="moving" class="direct-placement" :class="{invalid:targetInfo(slotTarget(row,column,si)).issue}" :data-placement="slotKey(row,column,si)" :aria-label="targetInfo(slotTarget(row,column,si)).label" :aria-disabled="!!targetInfo(slotTarget(row,column,si)).issue" @click="place(slotTarget(row,column,si))"><span>{{targetInfo(slotTarget(row,column,si)).label}}<small v-if="targetInfo(slotTarget(row,column,si)).issue">{{issueText(targetInfo(slotTarget(row,column,si)).issue)}}</small></span></button>
            <button v-if="editing&&!moving&&column.cards.length===2&&si===0" class="ordered-stack-handle" :aria-label="t('调整上下比例','Adjust stack ratio')" role="separator" tabindex="0" aria-orientation="horizontal" :aria-valuenow="column.split" :aria-valuemin="splitBounds(row.source,column.source)[0]" :aria-valuemax="splitBounds(row.source,column.source)[1]" @click="openSize(row.source)" @pointerdown="startStack($event,row.source,column.source)" @keydown.up.prevent="nudgeSplit(row.source,column.source,-5)" @keydown.down.prevent="nudgeSplit(row.source,column.source,5)"><span>⋯</span><output v-if="resizingRow===row.source">{{column.split}} / {{100-column.split}}</output></button>
          </div>
        </div>
        <template v-if="editing&&!moving&&row.columns.length>1"><button v-for="(_,index) in row.columns.slice(0,-1)" :key="index" class="ordered-column-handle" role="separator" tabindex="0" aria-orientation="vertical" :aria-valuenow="row.columns[index].weight" :aria-valuemin="widthBounds(row,index)[0]" :aria-valuemax="widthBounds(row,index)[1]" :style="{left:'clamp(9px,'+divider(row,index)+'px,calc(100% - 9px))'}" :aria-label="t('调整列宽','Adjust column widths')+' '+(index+1)" @click="openSize(row.source)" @pointerdown="startWidth($event,row,index)" @keydown.left.prevent="nudgeWidth(row,index,-5)" @keydown.right.prevent="nudgeWidth(row,index,5)"><span>⋮</span><output v-if="resizingRow===row.source">{{row.columns.map(c=>c.weight).join(' / ')}}</output></button></template>
      </section>
      <button v-if="moving" class="direct-last-target" data-placement="edge:end" @click="place({kind:'edge',before:null})">＋ {{t('放到最后，独占新行 / 整行移到最后','New row at end / move row to end')}}</button>
      <section v-if="!actualRows.length" class="ordered-empty"><StudioGlyph name="grid"/><h2>{{t('首页，由你安排','A home of your own')}}</h2><p>{{t('添加常看的模块，也可以随时恢复推荐布局。','Add the things you check most, or restore the recommended layout.')}}</p><button @click="editing?openSlot(null):begin()">{{t('添加模块','Add modules')}}</button></section>
    </div></div>
    <footer class="lab-footer"><span>Quickstart <i>/</i> {{t('有序布局 · 设计预览','Ordered layout · Design preview')}}</span><HomeApplications collapsed :fallback-entries="quickEntrances" @navigate="go"/></footer>
    <DirectEditPanel v-if="panel==='slot'" :title="pendingSlot?t('选择槽位模块','Choose module'):t('添加一行模块','Add module in a new row')" @close="closePanel">
      <p class="direct-panel-note">{{t('选择后先预览；已有模块会移到这里，原位置留空。','Preview before confirming. Existing modules move here and leave their old slot empty.')}}</p>
      <div class="slot-module-list"><button v-for="item in widgetDefinitions" :key="item.id" @click="choice=item.id" :disabled="!!choiceResult(item.id).issue" :aria-pressed="choice===item.id" :data-choice="item.id"><StudioGlyph :name="item.glyph"/><span>{{name(item.id)}}<small>{{choiceResult(item.id).issue?issueText(choiceResult(item.id).issue):sourceLabel(item.id)}}</small></span><span>{{originOf(draft,item.id)?'↗':'＋'}}</span></button></div>
      <template #actions><section v-if="choice" class="slot-change-preview" data-choice-preview>
        <h3>{{name(choice)}} → {{pendingSlot?slotLabel(pendingSlot):t('页面末尾新行','New row at end')}}</h3>
        <p v-if="originOf(draft,choice)">{{t('将从原位置移到这里，不创建副本。','Moves from its current position; no duplicate.')}}</p>
        <p v-if="choiceResult(choice).hidden.length">{{choiceResult(choice).hidden.map(name).join('、')}}{{t('将从首页隐藏，设置保留。',' will be hidden. Settings are kept.')}}</p>
        <button class="primary" @click="confirmChoice" data-confirm-choice>{{t('确认放置','Place module')}}</button>
      </section><div v-else class="slot-confirm"><button v-if="pendingSlot&&at(draft,pendingSlot)" @click="removePending" data-remove-pending>{{t('从首页移除','Hide module')}}</button><button @click="closePanel()">{{t('返回首页','Back to home')}}</button></div></template>
    </DirectEditPanel>
  </main>
</template>
<script setup lang="ts">
import {computed,nextTick,onMounted,onUnmounted,ref,watch} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import StudioGlyph from './StudioGlyph.vue'
import DirectEditPanel from './DirectEditPanel.vue'
import {placement,targets,targetKey,type MoveSource,type MoveTarget} from './overviewPlacement'
import LayoutPreviewCard from './LayoutPreviewCard.vue'
import CompactPreviewCard from './CompactPreviewCard.vue'
import HomeApplications from './HomeApplications.vue'
import {useStudioModel} from './studioModel'
import {demo} from './fixtures'
import {quickEntrances} from './canvasLayout'
import {homeApplicationSession} from './homeApplications'
import {getTheme} from '../utils/theme'
import {assignSlot,at,originOf,reshape,changeSize,moveToNewRow,validate,normalize,type Normalized,type Slot,type LayoutResult} from './slotLayout'
import {widgetDefinitions,widget,type WidgetId} from './rowLayout'
import {templates,clone,compactIds,orderedSession,recommended,makeRow,visibleIds,layoutIssue,rowMinimum,changeTemplate,renderRows,type Template,type OrderedRow,type ActualRow,type ActualColumn} from './orderedLayout'
const route=useRoute(),router=useRouter(),english=window.vue_lang==='en',t=(zh:string,en:string)=>english?en:zh,name=(id:WidgetId)=>t(widget(id).zh,widget(id).en)
const editing=ref(false),draft=ref(clone(orderedSession.value)),history=ref<OrderedRow[][]>([]),selected=ref(draft.value[0]?.id||''),notice=ref(''),previewWidth=ref(0),theme=ref(getTheme())
const layout=computed(()=>editing.value?draft.value:orderedSession.value),visible=computed(()=>visibleIds(layout.value)),hidden=computed(()=>widgetDefinitions.filter(w=>!visible.value.includes(w.id)))
const selectedIndex=computed(()=>draft.value.findIndex(r=>r.id===selected.value)),selectedRow=computed(()=>draft.value[selectedIndex.value])
const heightOptions=computed(()=>Array.from(new Set([selectedRow.value?.height||320,152,240,280,320,340,360,400,480,560])).sort((a,b)=>a-b))
function heightIssue(height:number){if(!selectedRow.value)return false;const row=clone(selectedRow.value);row.height=height;return Boolean(layoutIssue([row]))}
const presetHeights=computed(()=>{const legal=heightOptions.value.filter(n=>!heightIssue(n));return [legal[0]||560,legal.find(n=>n>=320)||legal[0]||560,legal.find(n=>n>=480)||legal[legal.length-1]||560]})
const widthPresets=computed(()=>{const values=selectedRow.value?.columns.length===3?[[34,33,33],[50,25,25],[25,50,25]]:[[50,50],[60,40],[65,35],[40,60]],current=selectedRow.value?.columns.map(c=>c.weight)||[];return values.some(v=>v.join('/')===current.join('/'))?values:[current,...values]})
const readerLayout=computed(()=>visible.value.map(id=>({id,enabled:true})))
const {data,errors,devices,retry}=useStudioModel(readerLayout,['traffic'])
const availableElement=ref<HTMLElement|null>(null),contentElement=ref<HTMLElement|null>(null),availableWidth=ref(1160),contentWidth=ref(1160)
const actualRows=computed(()=>renderRows(layout.value,contentWidth.value,homeApplicationSession.favorites.length,editing.value))
const editButton=ref<HTMLButtonElement|null>(null),library=ref(false),libraryElement=ref<HTMLElement|null>(null)
const panel=ref(''),selectedCard=ref<WidgetId|null>(null)
const pendingSlot=ref<Extract<MoveTarget,{kind:'slot'}>|null>(null),resizingRow=ref('')
const choice=ref<WidgetId|null>(null),requestedTemplate=ref<Template|null>(null),retainedIds=ref<WidgetId[]>([]),structureHeight=ref<number|undefined>()
const finishPreview=ref<Normalized|null>(null)
const overview=ref(false)
function toggleOverview(){interruptMove();closePanel();overview.value=!overview.value;window.scrollTo({top:0})}
async function locateReal(id:WidgetId){interruptMove();overview.value=false;selectedCard.value=id;selected.value=originOf(draft.value,id)?.row||'';await nextTick();contentElement.value?.querySelector<HTMLElement>(`[data-replace-module="${id}"]`)?.scrollIntoView({block:'center'})}
function overviewInsertion(row:OrderedRow,index:number){if(!index)return '0%';if(index===row.columns.length)return '100%';return row.columns.slice(0,index).reduce((n,c)=>n+c.weight,0)+'%'}
function rowDescription(row?:OrderedRow){if(!row)return t('移除空行','Remove empty row');const item=templates.find(t=>t.id===row.template)!;return t(item.zh,item.en)+' · '+visibleIds([row]).map(name).join(' / ')+' · '+row.height+'px'}
function acceptFinishHeight(id:string,height?:number){if(!finishPreview.value||height===undefined)return;const rows=clone(finishPreview.value.rows);rows.find(r=>r.id===id)!.height=height;finishPreview.value=normalize(rows)}
function confirmFinish(){if(finishPreview.value&&!finishPreview.value.issue)finishApply(finishPreview.value.rows)}
async function fixRow(id:string){selected.value=id;openPanel('row');await nextTick();contentElement.value?.querySelector<HTMLElement>(`[data-row-source="${id}"]`)?.scrollIntoView({block:'center'})}
const templateCapacity=computed(()=>templates.find(t=>t.id===requestedTemplate.value)?.slots.reduce((a,b)=>a+b,0)||0)
const requestedTemplateName=computed(()=>{const item=templates.find(v=>v.id===requestedTemplate.value);return item?t(item.zh,item.en):''})
const structureResult=computed(()=>!requestedTemplate.value?{rows:draft.value,issue:'',changed:false,hidden:[]} as LayoutResult:reshape(draft.value,selected.value,requestedTemplate.value,visibleIds([selectedRow.value]).length>templateCapacity.value?retainedIds.value:undefined,structureHeight.value))
function slotLabel(s:Slot){const index=draft.value.findIndex(r=>r.id===s.row);return t('第','Row ')+(index+1)+t('行 · 第',' · Column ')+(s.column+1)+(draft.value[index]?.columns[s.column].cards.length===2?(s.slot===0?t('列上方',' top'):t('列下方',' bottom')):t('列',''))}
function sourceLabel(id:WidgetId){const source=originOf(draft.value,id);return source?t('已在首页 · 移到这里 · ','On home · Move here · ')+slotLabel(source):t('未展示 · 添加','Hidden · Add')}
function choiceResult(id:WidgetId){return pendingSlot.value?.kind==='slot'?assignSlot(draft.value,pendingSlot.value,id):moveToNewRow(draft.value,id,null)}
function openSlot(target:MoveTarget|null){interruptMove();pendingSlot.value=target?.kind==='slot'?target:null;choice.value=null;openPanel('slot')}
function confirmChoice(){if(!choice.value)return;const result=choiceResult(choice.value);if(result.issue){warn(result.issue);return}commitResult(result);closePanel()}
function removePending(){const id=pendingSlot.value?at(draft.value,pendingSlot.value):null;closePanel();if(id)void hideCard(id)}
function commitResult(result:LayoutResult){if(result.issue){warn(result.issue);return false}return mutate(()=>result.rows)}
function toggleRetained(id:WidgetId){retainedIds.value=retainedIds.value.includes(id)?retainedIds.value.filter(v=>v!==id):[...retainedIds.value,id]}
function confirmStructure(){if(commitResult(structureResult.value))requestedTemplate.value=null}
function chooseModule(id:WidgetId){const target=pendingSlot.value;closeLibrary();startMoving({kind:'module',id});if(target)void place(target)}
async function locate(id:WidgetId){closeLibrary();selectedCard.value=id;selected.value=draft.value.find(r=>visibleIds([r]).includes(id))?.id||'';await nextTick();const element=contentElement.value?.querySelector<HTMLElement>(`[data-drag-card="${id}"]`);element?.scrollIntoView({block:'center',behavior:'auto'});element?.focus({preventScroll:true})}
function openSize(row:string){if(suppressClick)return;selected.value=row;openPanel('row')}
function openPanel(value:string){interruptMove();panel.value=value;selectedCard.value=null;requestedTemplate.value=null}
function closePanel(){panel.value=''}
function blankClick(event:MouseEvent){if(!(event.target as HTMLElement).closest('button,input,select,a,summary,.direct-panel,.ordered-library')){selected.value='';selectedCard.value=null}}
function begin(){draft.value=clone(orderedSession.value);history.value=[];editing.value=true;overview.value=false;selected.value='';selectedCard.value=null;notice.value=''}
function cancel(){cancelMoveGesture?.();finishGesture?.();stopMoving();panel.value='';library.value=false;editing.value=false;overview.value=false;draft.value=clone(orderedSession.value);notice.value=t('已取消，恢复本次预览已应用的布局。','Cancelled. Applied preview layout restored.');editButton.value?.focus()}
function apply(){interruptMove();const result=normalize(draft.value);if(result.issue||result.changed){finishPreview.value=result;openPanel('finish');return}finishApply(result.rows)}
function finishApply(rows:OrderedRow[]){const problem=validate(rows);if(problem.issue){warn(problem.issue);return}orderedSession.value=clone(rows);draft.value=clone(rows);panel.value='';library.value=false;editing.value=false;overview.value=false;notice.value=t('布局已应用到本次预览；刷新恢复示例。','Layout applied in this preview. Reload resets it.');editButton.value?.focus()}
function warn(issue:string){notice.value=issueText(issue)}
function mutate(change:(rows:OrderedRow[])=>OrderedRow[]){const before=clone(draft.value),next=change(clone(before)),issue=validate(next).issue;if(issue){warn(issue);return false}if(JSON.stringify(before)===JSON.stringify(next))return false;history.value=[...history.value.slice(-29),before];draft.value=next;if(!next.some(r=>r.id===selected.value))selected.value=next[0]?.id||'';notice.value='';return true}
function undo(){cancelMoveGesture?.();finishGesture?.();stopMoving();const previous=history.value.pop();if(previous){draft.value=previous;if(!previous.some(r=>r.id===selected.value))selected.value=previous[0]?.id||'';notice.value=t('已撤销上一次布局修改。','Last layout change undone.')}}
function setTemplate(template:Template){requestedTemplate.value=template;const capacity=templates.find(v=>v.id===template)!.slots.reduce((a,b)=>a+b,0);retainedIds.value=visibleIds([selectedRow.value]).slice(0,capacity);structureHeight.value=undefined}
function setHeight(value:number){commitResult(changeSize(draft.value,selected.value,{height:value}))}
function setWeights(weights:number[]){commitResult(changeSize(draft.value,selected.value,{weights}))}
function setFirstWeight(value:number){const columns=selectedRow.value.columns;setWeights(columns.length===2?[value,100-value]:[value,Math.floor((100-value)/2),100-value-Math.floor((100-value)/2)])}
function setSplit(ci:number,value:number){const row=selectedRow.value,column=row.columns[ci],minimum=column.cards.map(id=>id?compactIds.includes(id)?148:widget(id).minHeight:0);if(minimum[0]>(row.height-18)*value/100||minimum[1]>(row.height-18)*(100-value)/100){notice.value=t('上下比例已达到卡片最小高度限制。','Stack ratio is limited by card minimum heights.');return}mutate(rows=>{rows[selectedIndex.value].columns[ci].split=value;return rows})}
async function hideCard(id:WidgetId){const source=originOf(draft.value,id);if(!source)return;selected.value=source.row;commitResult(assignSlot(draft.value,source,null));selectedCard.value=null;await nextTick();const key=`slot:${source.row}:${source.column}:${source.slot}`;if(overview.value)document.querySelector<HTMLElement>(`[data-overview-empty="${key}"]`)?.focus({preventScroll:true});else contentElement.value?.querySelector<HTMLElement>(`[data-empty-slot="${key}"]`)?.focus({preventScroll:true})}
function toggleModule(id:WidgetId){if(visible.value.includes(id)){hideCard(id);return}const row=makeRow([id],'single',Math.max(320,widget(id).singleHeight));if(mutate(rows=>[...rows,row]))selected.value=row.id}
function addRow(){const row=makeRow();mutate(rows=>[...rows,row]);selected.value=row.id}
function hideRow(){mutate(rows=>rows.filter(r=>r.id!==selected.value));closePanel()}
function hideAll(){mutate(()=>[])}
function moveRow(delta:number){mutate(rows=>{const index=selectedIndex.value;[rows[index],rows[index+delta]]=[rows[index+delta],rows[index]];return rows})}
function selectCard(row:string,id:WidgetId){if(suppressClick)return;selected.value=row;selectedCard.value=selectedCard.value===id?null:id;notice.value=''}
const moving=ref<MoveSource|null>(null),hoverTarget=ref(''),dragPoint=ref<{x:number;y:number}|null>(null)
const moveTargets=computed(()=>targets(draft.value)),sourceName=computed(()=>!moving.value?'':moving.value.kind==='row'?t('整行','Whole row'):name(moving.value.id as WidgetId))
function issueText(issue:string){return issue==='compact'?t('不支持上下摘要，请选择普通槽位。','No stacked summary. Choose a standard slot.'):issue==='retained'||issue==='choose-retained'?t('请按槽位数量选择保留模块。','Choose modules within this layout’s capacity.'):issue==='incomplete-stack'?t('上下组合仍有空位，请补齐或更换行布局。','Fill the stacked slots or choose another layout.'):issue==='hard-spec'?t('整理后的规格不适配，请更换布局。','The simplified layout does not fit.'):issue==='capacity'?t('此行无法继续插入，请选择新行或更换布局。','This row is full. Use a new row or change its layout.'):issue==='structure'?t('比例合计须为100%，且与布局槽位一致。','Proportions must total 100% and match the layout.'):issue==='row-target'?t('整行请放到行间','Move whole rows between rows'):issue==='target'?t('目标已变化，请重新选择','Destination changed; choose again'):issue.startsWith('height:')?t('需要行高至少 ','Needs row height of at least ')+issue.split(':')[1]+' px':issue.startsWith('width:')?t('需要更宽的槽位：','Needs a wider slot: ')+issue.split(':')[1]+' px':t('无法采用此组合：','Cannot use this layout: ')+issue}
function targetInfo(target:MoveTarget){
 const index=target.kind!=='edge'?draft.value.findIndex(r=>r.id===target.row):target.before?draft.value.findIndex(r=>r.id===target.before):draft.value.length
 const structure=target.kind==='slot'?slotLabel(target):target.kind==='beside'?t('并排插入第','Insert beside row ')+(index+1)+t('行',''):target.before?t('第','Before row ')+(index+1)+t('行之前',''):t('页面末尾','End of page')
 const id=target.kind==='slot'?draft.value[index]?.columns[target.column]?.cards[target.slot]:null
 const result=moving.value?placement(draft.value,moving.value,target):{issue:''}
 const action=target.kind==='edge'?(moving.value?.kind==='row'?t('整行移到这里','Move row here'):t('独占新行','New single row')):target.kind==='beside'?t('预览扩列','Preview new column'):id?t('替换','Replace ')+name(id)+t('，原模块隐藏','; current module will be hidden'):t('移入空位','Move into empty slot')
 return {label:structure+' · '+action,issue:result.issue}
}
const hoverInfo=computed(()=>{const target=moveTargets.value.find(t=>targetKey(t)===hoverTarget.value);if(!target)return t('选择位置；来源空位会保留，可撤销。','Choose a destination. The source slot stays empty; undo is available.');const info=targetInfo(target);if(info.issue)return issueText(info.issue);const next=moving.value?placement(draft.value,moving.value,target).rows:[];return info.label+(target.kind!=='edge'?' → '+rowDescription(next.find(r=>r.id===target.row)):'')})
function trackTarget(event:Event){if(!moving.value)return;const key=(event.target as HTMLElement).closest<HTMLElement>('[data-placement]')?.dataset.placement;if(key)hoverTarget.value=key}
const slotTarget=(row:ActualRow,column:ActualColumn,si:number):MoveTarget=>({kind:'slot',row:row.source,column:column.source,slot:column.slots[si]})
const slotKey=(row:ActualRow,column:ActualColumn,si:number)=>targetKey(slotTarget(row,column,si))
const isFirstFragment=(row:ActualRow)=>actualRows.value.find(r=>r.source===row.source)?.id===row.id
function startMoving(source:MoveSource){if(suppressClick){suppressClick=false;return}finishGesture?.();overview.value=true;moving.value=source;panel.value='';notice.value=''}
async function cancelMoving(){const source=moving.value;cancelMoveGesture?.();stopMoving();notice.value=t('已取消移动，布局未改变。','Move cancelled. Layout unchanged.');await nextTick();if(source){const key=source.kind==='row'?'data-row-handle':'data-drag-card';contentElement.value?.querySelector<HTMLElement>(`[${key}="${source.id}"]`)?.focus({preventScroll:true})}}
function stopMoving(){moving.value=null;hoverTarget.value='';dragPoint.value=null;if(panel.value==='targets')panel.value=''}
async function place(target:MoveTarget){if(!moving.value)return;const source=moving.value,result=placement(draft.value,source,target);if(result.issue){notice.value=issueText(result.issue);return}if(result.changed)mutate(()=>result.rows);stopMoving();notice.value=result.changed?t('位置已调整，可撤销。','Position updated. Undo is available.'):t('位置未改变。','Position unchanged.');await nextTick();const selector=source.kind==='row'?`[data-row-handle="${source.id}"]`:`[data-drag-card="${source.id}"]`;contentElement.value?.querySelector<HTMLElement>(selector)?.focus({preventScroll:true})}
let cancelMoveGesture:(()=>void)|undefined,suppressClick=false
function startMovePointer(event:PointerEvent,source:MoveSource){
 if(event.button!==0||event.isPrimary===false||finishGesture||panel.value)return
 cancelMoveGesture?.();const start={x:event.clientX,y:event.clientY},pointer=event.pointerId,viewport=[innerWidth,innerHeight];let active=false
 const move=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;if(!active&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<6)return;if(!active){startMoving(source);active=true}e.preventDefault();dragPoint.value={x:Math.max(contentElement.value?.getBoundingClientRect().left||0,Math.min(innerWidth-180,e.clientX+12)),y:Math.max(0,Math.min(innerHeight-80,e.clientY+12))};hoverTarget.value=(document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-placement]') as HTMLElement)?.dataset.placement||''}
 const clean=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);cancelMoveGesture=undefined}
 const cancel=()=>{clean();if(active){suppressClick=true;setTimeout(()=>suppressClick=false,0);stopMoving()}}
 const up=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;clean();if(active){suppressClick=true;setTimeout(()=>suppressClick=false,0);if(viewport[0]!==innerWidth||viewport[1]!==innerHeight){stopMoving();return}const target=moveTargets.value.find(t=>targetKey(t)===hoverTarget.value);if(target)void place(target);else stopMoving();dragPoint.value=null}}
 cancelMoveGesture=cancel;window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel)
}
function rowStyle(row:ActualRow){return {height:row.height+'px',gridTemplateColumns:row.columns.map(c=>'minmax('+Math.min(contentWidth.value,Math.max(...c.cards.map(id=>id?widget(id).minWidth:260)))+'px,'+c.weight+'fr)').join(' ')}}
function columnStyle(column:Pick<ActualColumn,'cards'|'split'>){return {gridTemplateRows:column.cards.length===1?'minmax(0,1fr)':`minmax(0,${column.split}fr) minmax(0,${100-column.split}fr)`}}
function divider(row:ActualRow,index:number){const element=contentElement.value?.querySelector<HTMLElement>('[data-ordered-row="'+row.id+'"]'),columns=element?.querySelectorAll<HTMLElement>('.ordered-column');if(!element||!columns?.[index])return 0;return columns[index].getBoundingClientRect().right-element.getBoundingClientRect().left+9}
let finishGesture:(()=>void)|undefined
function gesture(event:PointerEvent,move:(dx:number,dy:number)=>void,done:(cancelled:boolean)=>void){
 if(event.button!==0)return;event.preventDefault();finishGesture?.();const x=event.clientX,y=event.clientY,pointer=event.pointerId,viewport=[innerWidth,innerHeight,contentElement.value?.clientWidth];let moved=false
 const onMove=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;const dx=e.clientX-x,dy=e.clientY-y;moved ||= Math.hypot(dx,dy)>3;move(dx,dy)}
 const finish=(cancelled:boolean)=>{window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);finishGesture=undefined;if(moved){suppressClick=true;setTimeout(()=>suppressClick=false,0)}done(cancelled);resizingRow.value=''}
 const up=(e:PointerEvent)=>{if(e.pointerId===pointer)finish(viewport[0]!==innerWidth||viewport[1]!==innerHeight||viewport[2]!==contentElement.value?.clientWidth)},cancel=()=>finish(true)
 finishGesture=cancel;window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel)
}
function finishSize(before:OrderedRow[],cancelled:boolean){if(cancelled){draft.value=before;return}const issue=layoutIssue(draft.value);if(issue){draft.value=before;warn(issue);return}if(JSON.stringify(before)!==JSON.stringify(draft.value))history.value=[...history.value.slice(-29),before]}
function widthBounds(actual:ActualRow,index:number){const sum=actual.columns.reduce((s,c)=>s+c.weight,0),total=actual.columns[index].weight+actual.columns[index+1].weight,usable=contentWidth.value-18*(actual.columns.length-1),min=(c:ActualColumn)=>Math.max(...c.cards.map(id=>id?widget(id).minWidth:260));return [Math.ceil(min(actual.columns[index])/usable*sum*10)/10,Math.floor((total-min(actual.columns[index+1])/usable*sum)*10)/10]}
function startWidth(event:PointerEvent,actual:ActualRow,index:number){if(event.isPrimary===false||finishGesture||cancelMoveGesture)return;const before=clone(draft.value),row=draft.value.find(r=>r.id===actual.source)!,a=actual.columns[index].source,b=actual.columns[index+1].source,start=row.columns[a].weight,total=start+row.columns[b].weight,width=contentWidth.value-18*(actual.columns.length-1),sum=actual.columns.reduce((s,c)=>s+c.weight,0),bounds=widthBounds(actual,index);resizingRow.value=row.id;gesture(event,dx=>{const raw=Math.round((start+dx/width*sum)/5)*5,value=Math.max(bounds[0],Math.min(bounds[1],raw));row.columns[a].weight=value;row.columns[b].weight=Number((total-value).toFixed(1));if(value!==raw)notice.value=t('已到卡片最小宽度。','Card minimum width reached.')},cancelled=>finishSize(before,cancelled))}
function nudgeWidth(actual:ActualRow,index:number,delta:number){selected.value=actual.source;const bounds=widthBounds(actual,index);mutate(rows=>{const row=rows.find(r=>r.id===actual.source)!,a=actual.columns[index].source,b=actual.columns[index+1].source,total=row.columns[a].weight+row.columns[b].weight,value=Math.max(bounds[0],Math.min(bounds[1],row.columns[a].weight+delta));row.columns[a].weight=value;row.columns[b].weight=Number((total-value).toFixed(1));return rows})}
function nudgeSplit(id:string,index:number,delta:number){selected.value=id;setSplit(index,Math.max(20,Math.min(80,selectedRow.value.columns[index].split+delta)))}
function splitBounds(id:string,index:number){const row=draft.value.find(r=>r.id===id)!,column=row.columns[index],usable=row.height-18,minimum=column.cards.map(card=>card?compactIds.includes(card)?148:widget(card).minHeight:0);return [Math.max(20,Math.ceil(minimum[0]/usable*20)*5),Math.min(80,Math.floor((1-minimum[1]/usable)*20)*5)]}
function startStack(event:PointerEvent,id:string,index:number){if(event.isPrimary===false||finishGesture||cancelMoveGesture)return;selected.value=id;const before=clone(draft.value),row=selectedRow.value,column=row.columns[index],start=column.split,usable=row.height-18,bounds=splitBounds(id,index);resizingRow.value=id;gesture(event,(_,dy)=>{const raw=Math.round((start+dy/usable*100)/5)*5;column.split=Math.max(bounds[0],Math.min(bounds[1],raw));if(column.split!==raw)notice.value=t('已到卡片最小高度。','Card minimum height reached.')},cancelled=>finishSize(before,cancelled))}
const target=(path:string,device?:string)=>({path,query:{...route.query,layout:'ordered',variant:'rows',device,filter:path==='/devicemanagement'?'all':undefined}})
function go(path:string){if(editing.value){notice.value=t('请先应用或取消布局草稿，再打开详情。','Apply or cancel the layout draft before opening details.');return}void router.push(target(path))}
function openDevice(id:string){if(editing.value){notice.value=t('请先应用或取消布局草稿，再打开设备。','Apply or cancel the draft before opening a device.');return}void router.push(target('/devicemanagement',id))}
function toggleTheme(){const value=theme.value==='dark'?'light':'dark';document.body.setAttribute('theme',value);void router.replace({query:{...route.query,theme:value}})}
function toggleLanguage(){if(editing.value){notice.value=t('切换语言会刷新示例，请先结束布局编辑。','Changing language reloads the sample. Finish editing first.');return}location.href=router.resolve({path:'/',query:{...route.query,layout:'ordered',variant:'rows',lang:english?'zh-cn':'en'}}).href}
function changeQuery(key:string,event:Event){demo.recovered=false;void router.replace({query:{...route.query,[key]:(event.target as HTMLSelectElement).value}})}
function changeSample(event:Event){if(editing.value){notice.value=t('切换示例会刷新布局，请先应用或取消草稿。','Changing the sample reloads the layout. Apply or cancel first.');return}location.href=router.resolve({path:'/',query:{...route.query,layout:'ordered',variant:'rows',preset:(event.target as HTMLSelectElement).value}}).href}
let libraryOpener:HTMLElement|null=null
watch(library,async open=>{if(open){interruptMove();panel.value='';selectedCard.value=null;libraryOpener=document.activeElement as HTMLElement;await nextTick();libraryElement.value?.querySelector<HTMLButtonElement>('button')?.focus()}else libraryOpener?.focus({preventScroll:true})})
function closeLibrary(){library.value=false;pendingSlot.value=null}
function libraryKeyboard(event:KeyboardEvent){if(event.key==='Escape'){event.stopPropagation();closeLibrary()}if(event.key==='Tab'){const controls=Array.from(libraryElement.value?.querySelectorAll<HTMLElement>('button,input')||[]),first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}}
watch(()=>route.query.theme,()=>theme.value=getTheme())
function escapeMove(event:KeyboardEvent){if(event.key==='Escape'&&(moving.value||cancelMoveGesture||finishGesture)){event.preventDefault();event.stopImmediatePropagation();const source=moving.value;cancelMoveGesture?.();finishGesture?.();stopMoving();if(source){const key=source.kind==='row'?'data-row-handle':'data-drag-card';void nextTick(()=>contentElement.value?.querySelector<HTMLElement>(`[${key}="${source.id}"]`)?.focus({preventScroll:true}))}notice.value=t('已取消操作，布局未改变。','Action cancelled. Layout unchanged.')}else if(event.key==='Escape'&&(library.value||panel.value)){event.preventDefault();event.stopImmediatePropagation();if(library.value)closeLibrary();else closePanel()}}
function interruptMove(){cancelMoveGesture?.();finishGesture?.();stopMoving()}
watch(()=>[demo.scenario,demo.authority],interruptMove)
let observer:ResizeObserver|undefined
onMounted(()=>{window.addEventListener('keydown',escapeMove,true);window.addEventListener('resize',interruptMove);observer=new ResizeObserver(entries=>{for(const e of entries){if(e.target===availableElement.value)availableWidth.value=e.contentRect.width;if(e.target===contentElement.value)contentWidth.value=e.contentRect.width}});if(availableElement.value)observer.observe(availableElement.value);if(contentElement.value)observer.observe(contentElement.value);Object.defineProperty(window,'__quickstartOrdered',{configurable:true,get:()=>({editing:editing.value,overview:overview.value,panel:panel.value,applied:clone(orderedSession.value),draft:clone(draft.value),visible:visible.value,width:contentWidth.value,actual:actualRows.value,minimum:selectedRow.value?rowMinimum(selectedRow.value):0,history:history.value.length,moving:clone(moving.value),gestureActive:Boolean(cancelMoveGesture||finishGesture)})})})
onUnmounted(()=>{observer?.disconnect();interruptMove();window.removeEventListener('keydown',escapeMove,true);window.removeEventListener('resize',interruptMove);finishGesture?.();delete (window as any).__quickstartOrdered})
const scenes=[['system-error','系统读取失败','System unavailable'],['long-names','长设备名称','Long names'],['many-disks','24块磁盘','24 disks'],['normal','正常','Normal'],['many','128台设备','128 devices'],['empty','没有设备','Empty'],['loading','加载中','Loading'],['error','设备API失败','Inventory error'],['stale','旧快照','Stale snapshot'],['old','旧后端','Old backend'],['permission','权限失败','Access denied'],['no-speed','服务未安装','Service missing'],['disabled','服务未启用','Service disabled'],['speed-error','服务异常','Service error'],['unsupported','固件不支持','Unsupported'],['network-error','网络模块失败','Network unavailable'],['storage-error','存储失败','Storage unavailable'],['services-error','服务失败','Services unavailable'],['apps-empty','没有扩展应用','No extra apps'],['apps-error','应用清单失败','Apps unavailable'],['apps-loading','应用加载','Apps loading'],['apps-many','大量应用','Many apps']]
</script>
<style src="./canvas.css" scoped></style>
<style src="./layoutDesignHome.css" scoped></style>
<style src="./orderedHome.css" scoped></style>
<style src="./directEdit.css"></style>
<style src="./slotEdit.css"></style>
