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
import {forIn, mapValues, sortBy} from "lodash";
import Button from "primevue/button";
import {gdrive_save} from "../common/gdrive";
import FileBrowser from "./components/FileBrowser.vue";
import SplitButton from 'primevue/splitbutton';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';


const editor_models: { [k: string]: EditorModel } = {
  m1: {param_name: 'm1', component: EditorNumeric, param_get: () => spiral_view.params.m1, param_set: (m1) => set_numeric_param({m1}), param_min: 0, param_max: 25},
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
};

const filename = ref(Date.now().toString());

const all_params: string[] = sortBy(Object.keys(editor_models), k => k);

const editors: Ref<EditorModel[]> = ref([
  editor_models.m1,
  editor_models.m2,
  editor_models.rot_cnt,
]);

const spiral_view = SpiralViewFullControl_instance;

const m1 = ref(spiral_view.params.m1);

function set_numeric_param(v: Spiral_Dynamic_Config) {
  spiral_view.spiral.set_config(v);
  spiral_view.update_spiral();
}

const opened = ref(mapValues(editor_models, x => true));

async function save() {
  const blob = await spiral_view.export_image(1000);

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
      editor_models[k].param_set(Number(file.properties[k] ?? defaults[k]));
      editor_refs.value[k]?.update();
    }


  // spiral_view.spiral.set_config(props as any);
  spiral_view.update_spiral();
  file_browser.value.close();
}

const editor_refs = ref({});
</script>

<template>
  <div class="">
    <header class="position-fixed" style="z-index: 10; background: #000">

      <div class="mb-1 text-white">
        <Inplace :closable="true">
          <template #display>
            Name: {{ filename }} <i class="pi pi-file-edit"/>
          </template>
          <template #content>
            <InputText v-model="filename" autofocus/>
          </template>
        </Inplace>
      </div>

      <span class="float-right">
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
                 @remove_editor="editors.splice(n, 1)"
                 @collapse="opened[editor.param_name] = !opened[editor.param_name]"
                 class="mb-4"
      />
    </div>

    <FileBrowser ref="file_browser" @file_select="file_select"/>


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
</style>