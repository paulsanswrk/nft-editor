<script setup lang="ts">

import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import 'primeicons/primeicons.css';

import {ref, Ref} from "vue";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {EditorModel, GDriveFile} from "./common";
import {Spiral_Dynamic_Config} from "../base/Spiral_Dynamic";
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

const editor_models: { [k: string]: EditorModel } = {
  m1: {param_name: 'm1', component: EditorNumeric, param_get: () => spiral_view.params.m1, param_set: (m1) => set_numeric_param({m1}), param_min: 0, param_max: 30},
  m2: {param_name: 'm2', component: EditorNumeric, param_get: () => spiral_view.params.m2, param_set: (m2) => set_numeric_param({m2}), param_min: 0.1, param_max: 30},
  z_Irreg: {param_name: 'z_Irreg', component: EditorNumeric, param_get: () => spiral_view.params.z_Irreg, param_set: (z_Irreg) => set_numeric_param({z_Irreg}), param_min: -6, param_max: 6},
  cTanh: {param_name: 'cTanh', component: EditorNumeric, param_get: () => spiral_view.params.cTanh, param_set: (cTanh) => set_numeric_param({cTanh}), param_min: -1, param_max: 1},
  at0: {param_name: 'at0', component: EditorNumeric, param_get: () => spiral_view.params.at0, param_set: (at0) => set_numeric_param({at0}), param_min: -15, param_max: 8},
  at4: {param_name: 'at4', component: EditorNumeric, param_get: () => spiral_view.params.at4, param_set: (at4) => set_numeric_param({at4}), param_min: 8.1, param_max: 30},
  camH: {param_name: 'camH', component: EditorNumeric, param_get: () => spiral_view.camera_h, param_set: (camH) => spiral_view.camera_h = camH, param_min: -20, param_max: 20},
  fov: {param_name: 'fov', component: EditorNumeric, param_get: () => spiral_view.camera_fov, param_set: (fov) => spiral_view.camera_fov = fov, param_min: 0.05, param_max: 5},
  rot_cnt: {
    param_name: 'rot_cnt',
    component: EditorNumeric,
    param_get: () => spiral_view.rot_cnt,
    param_set: (rot_cnt) => spiral_view.change_rot_cnt(Math.round(rot_cnt)),
    param_min: 1,
    param_max: 20,
    steps: [1],
  },
  u1: {param_name: 'u1', component: EditorNumeric, param_get: () => spiral_view.params.u1, param_set: (u1) => set_numeric_param({u1}), param_min: -15, param_max: 17.5},
  u2: {param_name: 'u2', component: EditorNumeric, param_get: () => spiral_view.params.u2, param_set: (u2) => set_numeric_param({u2}), param_min: 18, param_max: 50},
  offsetZ: {param_name: 'offsetZ', component: EditorNumeric, param_get: () => spiral_view.params.offsetZ, param_set: (offsetZ) => set_numeric_param({offsetZ}), param_min: -30, param_max: 30},
  offsetR: {param_name: 'offsetR', component: EditorNumeric, param_get: () => spiral_view.params.offsetR, param_set: (offsetR) => set_numeric_param({offsetR}), param_min: -10, param_max: 10},
  // alpha: {param_name: 'alpha', component: EditorNumeric, param_get: () => spiral_view.camera.alpha, param_set: (alpha) => spiral_view.camera.alpha = alpha, param_min: -3, param_max: 3},
  beta: {param_name: 'beta', component: EditorNumeric, param_get: () => spiral_view.camera.beta, param_set: (beta) => spiral_view.camera.beta = beta, param_min: 0, param_max: 10},
  tube_radius: {
    param_name: 'tube_radius', component: EditorNumeric, param_get: () => spiral_view.tube_radius, param_set: (tube_radius) => {
      spiral_view.tube_radius = tube_radius;
      spiral_view.update_spiral();
    },
    param_min: 0,
    param_max: 0.02,
    steps: [0.001]
  },
};

const filename = ref(Date.now().toString());

const all_params: string[] = sortBy(Object.keys(editor_models), k => k);

const editors: Ref<EditorModel[]> = ref([
  editor_models.m1,
  editor_models.m2,
  editor_models.rot_cnt,
]);

const active_editor_names = ref(Object.fromEntries(editors.value.map(e => [e.param_name, true])));

const spiral_view = SpiralViewFullControl_instance;

const m1 = ref(spiral_view.params.m1);

function set_numeric_param(v: Spiral_Dynamic_Config) {
  spiral_view.spiral.set_config(v);
  spiral_view.update_spiral();
}

const opened = ref(mapValues(editor_models, x => true));

const save_resolution = ref(1000);

async function save() {
  const blob = await spiral_view.export_image(save_resolution.value);

  const props = mapValues(editor_models, v => v.param_get());

  await gdrive_save(blob, filename.value, {...props});
}

const file_browser_visible = ref(false);

const file_browser = ref(null);

function file_select(file: GDriveFile) {
  filename.value = file.name;
  const defaults = spiral_view.spiral_factory.get_config();

  for (const k in editor_models)
    if (file.properties[k] !== undefined) {
      editor_models[k].param_set(Number(file.properties[k] ?? defaults[k] ?? spiral_view.defaults[k]));
      editor_refs.value[k]?.update();
    }


  // spiral_view.spiral.set_config(props as any);
  spiral_view.update_spiral();
  file_browser.value.close();
}

const editor_refs = ref({});

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
</script>

<template>
  <div class="">
    <header class="position-fixed" style="z-index: 10; background: #000">

      <Menubar class="p-0" :model="[
        { icon: 'pi pi-fw pi-file', command: () => file_browser.open() },
        {
            icon: 'pi pi-fw pi-save',
            items: [
                { label: 'Save', icon: 'pi pi-fw pi-save', command: save },
                { class: 'filename', },
                { class: 'resolution', },
                // { separator: true }
            ]
        },
        {
            icon: 'pi pi-fw pi-sliders-h',
            items: [
                { label: 'Clear all', icon: 'pi pi-fw pi-trash', command: ()=>{editors.length = 0; active_editor_names={}} },
                ...all_params.map(p=>({
                  label: p,
                  class: 'editor'
                }))
            ]
        },
        {
            icon: 'pi pi-fw pi-wrench',
            items: [
                { label: 'JSON', icon: 'pi pi-fw pi-file-export', command: ()=>dlg_json_visible=true },
            ]
        },
        { icon: 'pi pi-angle-double-down', command:()=>Object.keys(editor_models).forEach(k=>opened[k]=false) }
    ]">
        <template #end>

        </template>


        <template #itemicon="slotProps:{item: MenuItem}">
          <div v-if="slotProps.item.class == 'resolution'" class="w-100">
            <div class="mb-2">Resolution: {{ save_resolution }}</div>
            <Slider v-model="save_resolution" @click.stop="() => {}" :min="300" :max="5000"/>
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
            <Checkbox v-model="active_editor_names[slotProps.item.label]" @change.stop="toggle_editor(slotProps.item.label as string)" :binary="true"/>
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
      <component v-for="(editor, n) in sortBy(editors, e=>e.param_name)" :is="editor.component" :key="editor.param_name"
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

.p-slider-handle {
  user-select: none;
}
</style>