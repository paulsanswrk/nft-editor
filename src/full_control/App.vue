<script setup lang="ts">

import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import 'primeicons/primeicons.css';

import {nextTick, ref, Ref} from "vue";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {EditorModel, GDriveFile} from "./common";
import EditorNumeric from "./components/EditorNumeric.vue";
import Dropdown from 'primevue/dropdown';
import {forIn, mapValues, pull, sortBy} from "lodash";
import Button from "primevue/button";
import {gdrive_save} from "../common/gdrive";
import FileBrowser from "./components/FileBrowser.vue";
import SplitButton from 'primevue/splitbutton';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
import {MenuItem} from "primevue/menuitem";
import Slider from 'primevue/slider';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import {Spiral_Transformed, Spiral_Transformed_Config} from "../base/Spiral_Transformed";

const spiral_view = SpiralViewFullControl_instance;

const params: Ref<Spiral_Transformed_Config> = ref(spiral_view.spiral_factory.get_config());

const editor_models: { [k: string]: EditorModel } = {
  m1: {param_name: 'm1', component: EditorNumeric, param_get: () => params.value.m1, param_set: (m1) => set_numeric_param({m1}), param_min: 0, param_max: 30},
  m2: {param_name: 'm2', component: EditorNumeric, param_get: () => params.value.m2, param_set: (m2) => set_numeric_param({m2}), param_min: 0.1, param_max: 30},
  z_Irreg: {param_name: 'z_Irreg', component: EditorNumeric, param_get: () => params.value.z_Irreg, param_set: (z_Irreg) => set_numeric_param({z_Irreg}), param_min: -6, param_max: 6},
  cTanh: {param_name: 'cTanh', component: EditorNumeric, param_get: () => params.value.cTanh, param_set: (cTanh) => set_numeric_param({cTanh}), param_min: -1, param_max: 1},
  at0: {param_name: 'at0', component: EditorNumeric, param_get: () => params.value.at0, param_set: (at0) => set_numeric_param({at0}), param_min: -15, param_max: 8},
  at4: {param_name: 'at4', component: EditorNumeric, param_get: () => params.value.at4, param_set: (at4) => set_numeric_param({at4}), param_min: 8.1, param_max: 30},
  camH: {param_name: 'camH', component: EditorNumeric, param_get: () => spiral_view.camera_h, param_set: (camH) => spiral_view.camera_h = camH, param_min: -20, param_max: 20},
  fov: {param_name: 'fov', component: EditorNumeric, param_get: () => spiral_view.camera_fov, param_set: (fov) => spiral_view.camera_fov = fov, param_min: 0.05, param_max: 5},
  rot_cnt: {
    param_name: 'rot_cnt', component: EditorNumeric, param_get: () => params.value.rot_cnt, param_set: (rot_cnt) => {
      params.value.rot_cnt = rot_cnt;
      spiral_view.active_spiral.set_config({rot_cnt});

      // set_numeric_param({rot_cnt});
      spiral_view.change_rot_cnt(rot_cnt);
    }, param_min: 1, param_max: 20, steps: [1],
  },
  u1: {param_name: 'u1', component: EditorNumeric, param_get: () => params.value.u1, param_set: (u1) => set_numeric_param({u1}), param_min: -15, param_max: 17.5},
  u2: {param_name: 'u2', component: EditorNumeric, param_get: () => params.value.u2, param_set: (u2) => set_numeric_param({u2}), param_min: 18, param_max: 50},
  offsetZ: {param_name: 'offsetZ', component: EditorNumeric, param_get: () => params.value.offsetZ, param_set: (offsetZ) => set_numeric_param({offsetZ}), param_min: -30, param_max: 30},
  offsetR: {param_name: 'offsetR', component: EditorNumeric, param_get: () => params.value.offsetR, param_set: (offsetR) => set_numeric_param({offsetR}), param_min: -10, param_max: 10},
  // alpha: {param_name: 'alpha', component: EditorNumeric, param_get: () => spiral_view.camera.alpha, param_set: (alpha) => spiral_view.camera.alpha = alpha, param_min: -3, param_max: 3},
  beta: {param_name: 'beta', component: EditorNumeric, param_get: () => spiral_view.camera.beta, param_set: (beta) => spiral_view.camera.beta = beta, param_min: 0, param_max: 10},
  tube_radius: {
    param_name: 'tube_radius',
    component: EditorNumeric,
    param_get: () => params.value.tube_radius,
    param_set: (tube_radius) => set_numeric_param({tube_radius}),
    param_min: 0,
    param_max: 0.02,
    steps: [0.001]
  },
  inner_r: {param_name: 'inner_r', component: EditorNumeric, param_get: () => params.value['inner_r'] ?? 0, param_set: (inner_r) => set_numeric_param({inner_r}), param_min: 0, param_max: 40},
};

const filename = ref(Date.now().toString());

const all_params: string[] = sortBy(Object.keys(editor_models), k => k);

const editors: Ref<EditorModel[]> = ref([
  editor_models.m1,
  editor_models.m2,
  editor_models.rot_cnt,
]);

const active_editor_names = ref(Object.fromEntries(editors.value.map(e => [e.param_name, true])));


function set_numeric_param(value: Spiral_Transformed_Config) {
  forIn(value, (v, k) => params.value[k] = v);
  spiral_view.active_spiral.set_config(value);
  // active_spiral.value.set_config(v);
  spiral_view.update_spiral();
}

const opened = ref(mapValues(editor_models, x => true));

const save_resolution = ref(1400);

async function save() {
  const blob = await spiral_view.export_image(save_resolution.value);

  const bak_spiral_name = active_spiral_name.value;
  change_active_spiral('main');

  await nextTick();

  let props = mapValues(editor_models, v => v.param_get() as any);

  if (shadow_spiral_enabled.value) {
    const shadow_spiral_props = spiral_view.shadow_spiral.get_config();
    shadow_spiral_props['transform_type'] = spiral_view.shadow_spiral.transform_type;
    const ssk = Object.keys(shadow_spiral_props).join(',');
    const ssv = Object.values(shadow_spiral_props).join(',');

    props = {...props, ...{ssk, ssv}};
    // console.log('save', props);
  }

  change_active_spiral(bak_spiral_name);

  await gdrive_save(blob, filename.value, {...props});
}

const file_browser_visible = ref(false);

const file_browser = ref(null);

async function file_select(file: GDriveFile) {
  filename.value = file.name;

  spiral_view.hide_shadow_spiral();

  const have_shadow_spiral = !!file.properties['ssk'];
  if (have_shadow_spiral) {
    // console.log('file_select', {...file.properties});
    const defaults = new Spiral_Transformed().get_config();

    shadow_spiral_enabled.value = true;
    spiral_view.create_shadow_spiral();
    change_active_spiral('shadow');
    await nextTick();

    const ssk = (file.properties['ssk'] as string).split(',');
    const ssv = (file.properties['ssv'] as string).split(',');
    const shadow_spiral_props = Object.fromEntries(ssk.map((k, n) => [k, ssv[n]]));

    for (const k in editor_models)
      if (shadow_spiral_props[k] !== undefined) {
        editor_models[k].param_set(Number(shadow_spiral_props[k] ?? defaults[k] ?? spiral_view.defaults[k]));
        editor_refs.value[k]?.update();
      }

    spiral_view.update_spiral();
  } else
    shadow_spiral_enabled.value = false;

  const defaults = spiral_view.spiral_factory.get_config();

  change_active_spiral('main');
  await nextTick();

  for (const k in editor_models)
    if (file.properties[k] !== undefined) {
      editor_models[k].param_set(Number(file.properties[k] ?? defaults[k] ?? spiral_view.defaults[k]));
      editor_refs.value[k]?.update();
    }

  await nextTick();

  if (have_shadow_spiral)
    change_active_spiral('shadow');

  spiral_view.update_spiral();
  file_browser.value.close();
}

const editor_refs: Ref<{ [k: string]: any }> = ref({});

function toggle_editor(name: string) {
  if (active_editor_names.value[name]) {
    editors.value.push(editor_models[name]);
    opened[name] = true;
  } else {
    editors.value.splice(editors.value.indexOf(editor_models[name]), 1);
    opened[name] = false;
  }
}

const dlg_json_visible = ref(false);

const shadow_spiral_enabled = ref(false);
const active_spiral_name: Ref<'main' | 'shadow'> = ref('main' as ('main' | 'shadow'));


function toggle_shadow_spiral() {
  if (shadow_spiral_enabled.value)
    spiral_view.create_shadow_spiral();
  else {
    spiral_view.hide_shadow_spiral();
    active_spiral_name.value = 'main';
  }
}

function change_active_spiral(name?: ('main' | 'shadow')) {
  if (name) active_spiral_name.value = name;
  spiral_view.set_active_spiral(active_spiral_name.value);
  params.value = spiral_view.active_spiral.get_config();
  forIn(editor_refs.value, e => e?.update());
}

</script>

<template>
  <div class="">
    <header class="position-fixed" style="z-index: 10; background: #000">

      <Menubar class="p-0" :model="[
        {
            icon: 'pi pi-fw pi-file',
            items: [
                { label: 'Open', icon: 'pi pi-fw pi-file', command: ()=>file_browser.open() },
                { separator: true },
                { label: 'Save', icon: 'pi pi-fw pi-save', command: save },
                { class: 'filename', },
                { class: 'resolution', },
            ]
        },
        {
            icon: 'pi pi-fw pi-sliders-h',
            items: [
                { label: 'Clear all', icon: 'pi pi-fw pi-trash', command: ()=>{editors.length = 0; active_editor_names={}} },
                ...all_params.map(p=>({
                  label: p,
                  class: 'editor',
                  key: p,
                }))
            ]
        },
        {
            icon: 'pi pi-fw pi-wrench',
            items: [
                { label: 'JSON', icon: 'pi pi-fw pi-file-export', command: ()=>dlg_json_visible=true },
            ]
        },
        { icon: 'pi pi-angle-double-down', command:()=>Object.keys(editor_models).forEach(k=>opened[k]=false) },
        {
            label: () => active_spiral_name === 'main'? '1' : '2',
            items: [
                { class: 'select-spiral-main', },
                { class: 'select-spiral-shadow', },
            ]
        },
    ]">

        <template #itemicon="slotProps:{item: MenuItem}">
          <div v-if="slotProps.item.class == 'resolution'" class="w-100">
            <div class="mb-2">Resolution: {{ save_resolution }}</div>
            <Slider v-model="save_resolution" @click.stop="() => {}" :min="300" :max="5000" :step="100"/>
          </div>
          <div v-else-if="slotProps.item.class == 'filename'" class="w-100" style="">
            <Inplace :closable="true" @click.stop="()=>{}">
              <template #display>{{ filename }}</template>
              <template #content>
                <InputText v-model="filename" autofocus style="max-width: calc(100% - 38px); "/>
              </template>
            </Inplace>
          </div>
          <div v-else-if="slotProps.item.class == 'editor'" class="w-100">
            <Checkbox v-model="active_editor_names[slotProps.item.key]" @change.stop="toggle_editor(slotProps.item.key)" :binary="true"/>
          </div>
          <div v-else-if="slotProps.item.class == 'select-spiral-main'" class="w-100">
            <RadioButton v-model="active_spiral_name" name="active_spiral_name" value="main" @change.stop="()=>change_active_spiral()"/>
            Main
          </div>
          <div v-else-if="slotProps.item.class == 'select-spiral-shadow'" class="w-100">
            <RadioButton v-model="active_spiral_name" name="active_spiral_name" value="shadow" :disabled="!shadow_spiral_enabled" @change.stop="()=>change_active_spiral()"/>
            <Checkbox v-model="shadow_spiral_enabled" @change.stop="toggle_shadow_spiral" :binary="true"/>
            Shadow
          </div>
          <i :class="slotProps.item.icon + (slotProps.item.label? ' mr-2' : '')" v-else/>
        </template>

      </Menubar>


      <span v-if="false" class="float-right">
        <Button icon="pi pi-folder-open" outlined @click="file_browser.open()" class="mr-2"/>
        <Button icon="pi pi-save" outlined @click="save" class="mr-2"/>
        <Button icon="pi pi-angle-double-down" outlined @click="Object.keys(editor_models).forEach(k=>opened[k]=false)" class="mr-2"/>
        <SplitButton
            :model="[
                { label: 'Reset Camera', icon: 'pi pi-compass', command: () => spiral_view.reset_camera() },
                { label: 'Collapse Fine-TUne', icon: 'pi pi-angle-down', command: () => forIn(editor_refs, e=>e.collapse_fine_tune()) },
                ]"
            icon="pi pi-ellipsis-v" outlined class="mr-2"/>

        <Dropdown placeholder="Add..."
                  :options="all_params.filter(p=>!editors.some(e=>e.param_name === p))"
                  @change="event => {editors.push(editor_models[event.value]); opened[event.value]=true}"
        />
    </span>

    </header>


    <div id="editors" class="overflow-auto">
      <component v-for="(editor, n) in sortBy(editors, e=>e.param_name)" :is="{...editor.component}" :key="editor.param_name"
                 v-bind="{model: editor}"
                 :ref="el=>editor_refs[editor.param_name]=el"
                 :opened="opened[editor.param_name]"
                 @remove_editor="pull(editors, editor)"
                 @collapse="opened[editor.param_name] = !opened[editor.param_name]"
                 class="mb-4"
      />
    </div>

    <FileBrowser ref="file_browser" @file_select="file_select"/>

    <Dialog v-model:visible="dlg_json_visible" modal maximizable header="JSON" content-style="height:70vh" :style="{ width: '100%' }">
      <Textarea class="w-100 h-100" :value="JSON.stringify(mapValues(editor_models as any, v => String((v as any).param_get())))"/>
    </Dialog>

    <router-link v-if="false"/>

  </div>
</template>

<style lang="scss">

body {
  overflow: hidden;
}

#app {
  background-color: #000;
  //border: 1px solid #ccc;
  height: 100vh;
  overflow: hidden;
  padding: 2px 15px 15px 0;
  width: calc(100vw - 100vh);

  $name-h: 15px;
  $btns-h: 60px;

  header {
    right: 20px;
    //top: 20px;
    width: calc(100vw - 100vh - 20px);

  }


  #editors {
    height: calc(100vh - $btns-h - $name-h);
    position: relative;
    top: $btns-h + $name-h;

  }
}

ul.p-submenu-list {
  //min-width: 350px;
}

.p-inplace-content {
  display: block;
  max-width: 100%;
}

.p-slider, .p-slider-range, .p-slider-handle {
  user-select: none;
}

.p-menuitem-link {
  padding: 0.7rem !important;
}
</style>