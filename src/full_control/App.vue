<script setup lang="ts">

import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import 'primeicons/primeicons.css';

import {nextTick, ref, Ref, watch} from "vue";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {EditorModel, GDriveFile} from "./common";
import EditorNumeric from "./components/EditorNumeric.vue";
import {forIn, mapValues, pull, sortBy} from "lodash";
import Button from "primevue/button";
import {gdrive_save} from "../common/gdrive";
import FileBrowser from "./components/FileBrowser.vue";
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
  at0: {param_name: 'at0', component: EditorNumeric, param_get: () => params.value.at0, param_set: (at0) => set_numeric_param({at0}), param_min: -25, param_max: 8},
  at4: {param_name: 'at4', component: EditorNumeric, param_get: () => params.value.at4, param_set: (at4) => set_numeric_param({at4}), param_min: 8.1, param_max: 50},
  camH: {param_name: 'camH', component: EditorNumeric, param_get: () => spiral_view.camera_h, param_set: (camH) => spiral_view.camera_h = camH, param_min: -30, param_max: 30},
  fov: {param_name: 'fov', component: EditorNumeric, param_get: () => spiral_view.camera_fov, param_set: (fov) => spiral_view.camera_fov = fov, param_min: 0.05, param_max: 5},
  rot_cnt: {
    param_name: 'rot_cnt', component: EditorNumeric, param_get: () => params.value.rot_cnt, param_set: (rot_cnt) => {
      params.value.rot_cnt = rot_cnt;
      spiral_view.active_spiral.set_config({rot_cnt});

      // set_numeric_param({rot_cnt});
      spiral_view.change_rot_cnt(rot_cnt);
    }, param_min: 1, param_max: 20, steps: [1],
  },
  u1: {param_name: 'u1', component: EditorNumeric, param_get: () => params.value.u1, param_set: (u1) => set_numeric_param({u1}), param_min: -40, param_max: 17.5},
  u2: {param_name: 'u2', component: EditorNumeric, param_get: () => params.value.u2, param_set: (u2) => set_numeric_param({u2}), param_min: 18, param_max: 60},
  offsetZ: {param_name: 'offsetZ', component: EditorNumeric, param_get: () => params.value.offsetZ, param_set: (offsetZ) => set_numeric_param({offsetZ}), param_min: -50, param_max: 30},
  offsetR: {param_name: 'offsetR', component: EditorNumeric, param_get: () => params.value.offsetR, param_set: (offsetR) => set_numeric_param({offsetR}), param_min: -20, param_max: 10},
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

function get_config(): { [p: string]: any } {
  return mapValues(editor_models, v => v.param_get() as any);
}

function set_config(config: { [p: string]: any }, update_editors: boolean = true) {
  const defaults = spiral_view.spiral_factory.get_config();

  for (const k in editor_models)
    if (config[k] !== undefined) {
      editor_models[k].param_set(Number(config[k] ?? defaults[k] ?? spiral_view.defaults[k]));
      if (update_editors) editor_refs.value[k]?.update();
    }
}

async function save() {
  const blob = await spiral_view.export_image(save_resolution.value);

  const bak_spiral_name = active_spiral_name.value;
  change_active_spiral('main');

  await nextTick();

  let props = get_config();

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

  change_active_spiral('main');

  await nextTick();

  set_config(file.properties);

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

const camera_speed = ref(0);
const fps = ref(30);
const duration = ref(10);
const enable_morphing = ref(true);
const playing_morphing = ref(false);
const start_config: Ref<{ [p: string]: any } | null> = ref(null);
const end_config: Ref<{ [p: string]: any } | null> = ref(null);

watch(camera_speed, (v: number) => {
      spiral_view.camera.useAutoRotationBehavior = !!v;
      if (v) spiral_view.camera.autoRotationBehavior.idleRotationSpeed = v;
    }
);

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function toggle_playing_morphing() {
  if (!start_config.value || !end_config.value) return;

  playing_morphing.value = !playing_morphing.value;

  if (!playing_morphing.value) return;

  set_config(start_config.value);
  const morphing_started_at = new Date().getTime();
  const morphing_finishing_at = morphing_started_at + duration.value * 1000;
  const dt = 1000 / fps.value;

  let last_render_time = morphing_started_at;

  while (playing_morphing.value) {
    if (last_render_time + dt > new Date().getTime())
      await sleep(last_render_time + dt - new Date().getTime());

    const now = new Date().getTime();
    const morphing_percent = (now - morphing_started_at) / (morphing_finishing_at - morphing_started_at);
    playing_morphing.value = do_morphing_increment(morphing_percent);
    last_render_time = new Date().getTime();
  }
}

function do_morphing_increment(morphing_percent: number): boolean {
  morphing_percent = Math.min(morphing_percent, 1);

  const config = get_config();
  for (const key in config) {
    config[key] = start_config.value[key] + morphing_percent * (end_config.value[key] - start_config.value[key])
  }
  set_config(config, false);

  if (morphing_percent >= 1) {
    set_config(config, true);
    return false;
  }

  return true;
}

async function render_sequence() {
  {
    const do_rotation = camera_speed.value !== 0;
    const do_morphing = enable_morphing.value;
    const bak_rot_speed = camera_speed.value;

    if (do_rotation) {
      camera_speed.value = 0;
      spiral_view.camera.alpha = spiral_view.defaults.alpha;
    }

    let morphing_percent = 0;
    const morphing_percent_step = 1 / (duration.value * fps.value);
    const dt = 1 / fps.value;

    await spiral_view.download_in_loop(v => {

      if (do_rotation) {
        //rot_speed is rad/sec
        v.camera.alpha -= bak_rot_speed * dt;
      }

      if (do_morphing) do_morphing_increment(morphing_percent);

      return (morphing_percent += morphing_percent_step) <= 1;
    }, save_resolution.value, `${filename.value}_`);


    if (do_rotation) {
      camera_speed.value = bak_rot_speed;
    }

  }
}

const textarea_json = ref('');

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
                { label: 'Download image', icon: 'pi pi-fw pi-download', command: ()=>spiral_view.download_image(filename, save_resolution) },
                { class: 'camera_speed', },
                { class: 'morphing', },
                { class: 'duration', },
                { class: 'fps', },
                {
                  label: 'Render sequence', icon: 'pi pi-fw pi-download',
                  command: () => render_sequence()
                },
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
          <div v-else-if="slotProps.item.class == 'fps'" class="w-100">
            <div class="mb-2 text-nowrap">FPS: {{ fps }}</div>
            <Slider v-model="fps" @click.stop="() => {}" :min="5" :max="100" :step="1"/>
          </div>
          <div v-else-if="slotProps.item.class == 'camera_speed'" class="w-100">
            <div class="mb-2 text-nowrap">Camera speed: {{ camera_speed }}
              <i aria-label="Reset" class="pi pi-times float-right small" @click.stop="() => camera_speed = 0"/>
            </div>
            <Slider v-model="camera_speed" @click.stop="() => {}" :min="-0.5" :max="0.5" :step="0.01"/>
          </div>
          <div v-else-if="slotProps.item.class == 'duration'" class="w-100">
            <div class="mb-2 text-nowrap">Duration: {{ duration }}</div>
            <Slider v-model="duration" @click.stop="() => {}" :min="1" :max="120" :step="1"/>
          </div>
          <div v-else-if="slotProps.item.class == 'morphing'" class="w-100">
            <div class="mb-2 text-nowrap d-flex align-items-center justify-content-between">Morphing
              <div class="">
                <Button icon="pi pi-play" :outlined="!playing_morphing" size="small" @click.stop="toggle_playing_morphing" class="mr-1"/>
                <Button :icon="`pi ${enable_morphing? 'pi-eye' : 'pi-eye-slash'}`" outlined size="small" @click.stop="enable_morphing = !enable_morphing" class=""/>
              </div>
            </div>
            <table class="w-100">
              <tr>
                <td class="text-nowrap">Start: <br/>
                  <Button icon="pi pi-file-import" outlined size="small" @click.stop="start_config=get_config()" class="mr-1"/>
                  <Button icon="pi pi-file-export" outlined size="small" :disabled="!start_config" @click.stop="set_config(start_config)" class=""/>
                </td>
                <td class="text-nowrap text-right">End: <br/>
                  <Button icon="pi pi-file-import" outlined size="small" @click.stop="end_config=get_config()" class="mr-1"/>
                  <Button icon="pi pi-file-export" outlined size="small" :disabled="!end_config" @click.stop="set_config(end_config)" class=""/>
                </td>
              </tr>
            </table>
          </div>

          <i :class="slotProps.item.icon + (slotProps.item.label? ' mr-2' : '')" v-else/>
        </template>

      </Menubar>

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
      <div class="mb-2">
        <Button label="Get" @click="textarea_json = JSON.stringify(get_config())" class="mr-2"/>
        <Button label="Set" @click="set_config(JSON.parse(textarea_json))"/>
      </div>
      <Textarea class="w-100 h-100" v-model="textarea_json"/>
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