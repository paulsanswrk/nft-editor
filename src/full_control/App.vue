<script setup lang="ts">

import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import 'primeicons/primeicons.css';

import {nextTick, ref, Ref, watch} from "vue";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {remove, sortBy} from "lodash";
import Button from "primevue/button";
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
import {Spiral_Transformed} from "../base/Spiral_Transformed";
import ColorsDebug from "./components/ColorsDebug.vue";
import {editor_models} from "./EditorsVM";
import EditorVM from "./VMs/EditorVM";
import EditorNumeric from "./components/EditorNumeric.vue";
import ColorsEditor from "./components/ColorsEditor.vue";
import {camera_speed, duration, enable_morphing, end_config, fps, playing_morphing, render_sequence, start_config, toggle_playing_morphing} from "./animation";
import AnimationPointsEditor from "./components/AnimationPointsEditor.vue";
import {force_gdrive_auth, GDriveFile, GDriveFileImage, GDriveFileVideo} from "../common/GDrive/gdrive_file";
import EditorAnimPointsVM from "./VMs/EditorAnimPointsVM";
import ThicknessEditor from "./components/ThicknessEditor.vue";
import Toast from 'primevue/toast';

import {useToast} from 'primevue/usetoast';
import {Vector3} from "@babylonjs/core/Maths/math.vector";

const toast = useToast();

const component_mappings = {EditorNumeric, ColorsEditor, AnimationPointsEditor, ThicknessEditor};

const spiral_view = SpiralViewFullControl_instance;

const errors_list = ref([]);
window['add_error_to_list'] = s => {
  if (errors_list.value.length > 50) errors_list.value = [];
  errors_list.value.push(s);
}

const filename = ref(Date.now().toString());
const save_resolution = ref(1400);

const editors: Ref<EditorVM[]> = ref([
  editor_models.all_models.m1,
  editor_models.all_models.m2,
  // editor_models.all_models.g_thickness,
  // editor_models.all_models.s_thickness,
  // editor_models.all_models.g_colors,
  // editor_models.all_models.s_colors,
]);

const active_editor_names = ref(Object.fromEntries(editors.value.map(e => [e.param_name, true])));

const opened = ref(editor_models.create_values(x => true));

function set_config(config: { [p: string]: any }, b_update_editors: boolean = true) {
  editor_models.set_config(config);

  if (b_update_editors)
    update_editors(config);
}

function update_editors(config?: { [p: string]: any }) {
  for (const k in editor_models.all_models)
    if (!config || config[k] !== undefined)
      editor_refs.value[k]?.update();
}

async function save_image() {
  const blob = await spiral_view.export_image(save_resolution.value);

  const bak_spiral_name = active_spiral_name.value;
  change_active_spiral('main');

  await nextTick();

  let props = editor_models.get_config_serialized();
  delete props['anim_points'];
  delete props['inner_r'];

  if (shadow_spiral_enabled.value) {
    change_active_spiral("shadow");
    const shadow_spiral_props = editor_models.get_config_serialized();
    const colors_props = {'ss_g_colors': shadow_spiral_props.g_colors, 'ss_s_colors': shadow_spiral_props.s_colors};
    const thickness_props = {'ss_g_thickness': shadow_spiral_props.g_thickness, 'ss_s_thickness': shadow_spiral_props.s_thickness};

    for (const p of ['g_colors', 's_colors', 'g_thickness', 's_thickness', 'anim_points'])
      delete shadow_spiral_props[p];

    shadow_spiral_props['transform_type'] = spiral_view.shadow_spiral.transform_type;
    const ssk = Object.keys(shadow_spiral_props).join(',');
    const ssv = Object.values(shadow_spiral_props).join(',');

    props = {...props, ...colors_props, ...thickness_props, ...{ssk, ssv}};
    // console.log('save', props);
  }

  change_active_spiral(bak_spiral_name);

  try {
    await (new GDriveFileImage).save(blob, filename.value, {...props});
    toast.add({severity: 'info', summary: 'Info', detail: 'Successfully saved', life: 1000});
  } catch (e) {
    toast.add({severity: 'error', summary: 'Info', detail: 'Save error', life: 3000});
  }
}

async function save_video() {
  const blob = await render_sequence(true, 'tmp.mp4', 0, true);
  const properties = (new EditorAnimPointsVM).param_get_serialized();

  try {
    await (new GDriveFileVideo).save(blob, filename.value, properties);
    toast.add({severity: 'info', summary: 'Info', detail: 'Successfully saved', life: 1000});
  } catch (e) {
    toast.add({severity: 'error', summary: 'Info', detail: 'Save error', life: 3000});
  }
}

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

    editor_models.set_config_serialized({
      ...shadow_spiral_props,
      ...{g_colors: file.properties.ssgc, s_colors: file.properties.sssc},
      ...{g_thickness: file.properties.ssgth, s_thickness: file.properties.sssth},
    }, defaults); //shadow editor_models?
    update_editors(shadow_spiral_props);

    spiral_view.update_spiral();
  } else
    shadow_spiral_enabled.value = false;

  change_active_spiral('main');

  await nextTick();

  // set_config(file.properties);
  editor_models.set_config_serialized(file.properties);

  await nextTick();

  if (have_shadow_spiral)
    change_active_spiral('shadow');

  spiral_view.update_spiral();
  update_editors();
  file_browser.value.close();
}

const editor_refs: Ref<{ [k: string]: any }> = ref({});

function toggle_editor(name: string) {
  if (active_editor_names.value[name]) {
    editors.value.push(editor_models.all_models[name]);
    opened[name] = true;
  } else {
    remove(editors.value, e => e.param_name == name);
    opened[name] = false;
  }
}

function remove_editor(name: string) {
  active_editor_names.value[name] = undefined;
  remove(editors.value, e => e.param_name == name);
  opened[name] = false;
}

const dlg_json_visible = ref(false);
const dlg_error_list_visible = ref(false);

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
  update_editors();
}

function copy_main_to_shadow() {
  const bak_active_spiral_name = active_spiral_name.value;
  spiral_view.set_active_spiral("main");
  const config = editor_models.get_config();
  spiral_view.set_active_spiral("shadow");
  editor_models.set_config(config);
  spiral_view.set_active_spiral(bak_active_spiral_name);

}

watch(camera_speed, (v: number) => {
      spiral_view.camera.useAutoRotationBehavior = !!v;
      if (v) spiral_view.camera.autoRotationBehavior.idleRotationSpeed = v;
    }
);

function reset_scroll_pos() {
  window.document.getElementById('editors').scrollTop = 0;
}

const textarea_json = ref('');

const camera_contols_enabled = ref(false);
watch(camera_contols_enabled, (v: boolean) => {
      if (v) {
        spiral_view.camera.inputs.addPointers();
        // console.log(spiral_view.camera.position);
      } else {
        spiral_view.camera.inputs.removeByType('ArcRotateCameraPointersInput');
        spiral_view.camera.setTarget(new Vector3(0, 0, 3));
        spiral_view.camera.beta = spiral_view.defaults.beta;
        spiral_view.camera.radius = editor_models.get_config()['camH'];
      }
    }
);

// window['camera'] = spiral_view.camera;

</script>

<template>
  <div class="" style="max-width: 450px;">
    <header class="position-fixed" style="z-index: 10; background: #000; max-width: 450px;">

      <Menubar class="p-0" :model="[
        {
            icon: 'pi pi-fw pi-file',
            items: [
                { class: 'force-gdrive-auth' },
                { label: 'Open Image', icon: 'pi pi-fw pi-file', command: ()=>file_browser.open('image') },
                { label: 'Open Video', icon: 'pi pi-fw pi-file', command: ()=>file_browser.open('video') },
                { separator: true },
                { label: 'Save Image', icon: 'pi pi-fw pi-save', command: save_image },
                { label: 'Save Video', icon: 'pi pi-fw pi-save', command: save_video },
                { class: 'filename', },
                { class: 'resolution', },
            ]
        },
        {
            icon: 'pi pi-fw pi-sliders-h',
            items: [
                { label: 'Clear all', icon: 'pi pi-fw pi-trash', command: ()=>{editors.length = 0; active_editor_names={}} },
                ...editor_models.all_params.map(p=>({
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
                { label: 'Download image', icon: 'pi pi-fw pi-download', command: ()=>spiral_view.download_canvas_image(filename, save_resolution) },
                { class: 'camera_speed', },
                { class: 'morphing', },
                { class: 'duration', },
                { class: 'fps', },
                {
                  label: 'Render sequence', icon: 'pi pi-fw pi-download',
                  command: () => render_sequence(false, filename, save_resolution).then(()=>update_editors(end_config))
                },
                {
                  label: 'Render video', icon: 'pi pi-fw pi-download',
                  command: () => render_sequence(true, filename, save_resolution).then(()=>update_editors(end_config))
                },
                // { label: 'Reset scroll pos', command: reset_scroll_pos },
                { label: camera_contols_enabled? 'Disable panning' : 'Enable panning', command: ()=>camera_contols_enabled=!camera_contols_enabled },
            ]
        },
        { icon: 'pi pi-angle-double-down', command:()=>editor_models.all_params.forEach(k=>opened[k]=false) },
        {
            label: () => active_spiral_name === 'main'? '1' : '2',
            items: [
                { class: 'select-spiral-main', },
                { class: 'select-spiral-shadow', },
                { label: 'Main To Shadow', icon: 'pi pi-angle-double-right', command: copy_main_to_shadow, disabled: !shadow_spiral_enabled },
            ]
        },
        {
          label: errors_list.length.toString(),
          icon: 'pi pi-exclamation-circle',
          // disabled: !errors_list.length,
          class: errors_list.length? 'text-danger' : '',
          command: () => dlg_error_list_visible = true
        }

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
                <Button icon="pi pi-play" :outlined="!playing_morphing" size="small" @click.stop="toggle_playing_morphing().then(()=>update_editors(end_config))" class="mr-1"/>
                <Button :icon="`pi ${enable_morphing? 'pi-eye' : 'pi-eye-slash'}`" outlined size="small" @click.stop="enable_morphing = !enable_morphing" class=""/>
              </div>
            </div>
            <table class="w-100">
              <tr>
                <td class="text-nowrap">Start: <br/>
                  <Button icon="pi pi-file-import" outlined size="small" @click.stop="start_config=editor_models.get_config()" class="mr-1"/>
                  <Button icon="pi pi-file-export" outlined size="small" :disabled="!start_config" @click.stop="set_config(start_config)" class=""/>
                </td>
                <td class="text-nowrap text-right">End: <br/>
                  <Button icon="pi pi-file-import" outlined size="small" @click.stop="end_config=editor_models.get_config()" class="mr-1"/>
                  <Button icon="pi pi-file-export" outlined size="small" :disabled="!end_config" @click.stop="set_config(end_config)" class=""/>
                </td>
              </tr>
            </table>
          </div>
          <div v-else-if="slotProps.item.class == 'force-gdrive-auth'" class="w-100">
            <Checkbox v-model="force_gdrive_auth" @change.stop="" :binary="true"/>&nbsp;
            Force Gdrive Auth
          </div>

          <i :class="slotProps.item.icon + (slotProps.item.label? ' mr-2' : '')" v-else/>
        </template>

      </Menubar>

    </header>


    <div id="editors" class="overflow-auto">

      <ColorsDebug v-if="false"/>

      <component v-for="(editor, n) in sortBy(editors, e=>e.param_name)" :is="component_mappings[editor.component_name]" :key="editor.param_name"
                 v-bind="{model: editor}"
                 :ref="el=>editor_refs[editor.param_name]=el"
                 :opened="opened[editor.param_name]"
                 @remove_editor="remove_editor(editor.param_name)"
                 @collapse="opened[editor.param_name] = !opened[editor.param_name]"
                 class="mb-4"
      />
    </div>

    <FileBrowser ref="file_browser" @file_select="file_select"/>

    <Dialog v-model:visible="dlg_json_visible" modal maximizable header="JSON" content-style="height:70vh" :style="{ width: '100%' }">
      <div class="mb-2">
        <Button label="Get" @click="textarea_json = JSON.stringify(editor_models.get_config_serialized(),null, '\t')" class="mr-2"/>
        <Button label="Set" @click="editor_models.set_config_serialized(JSON.parse(textarea_json)); update_editors()"/>
      </div>
      <Textarea class="w-100 h-100" v-model="textarea_json"/>
    </Dialog>

    <Dialog v-model:visible="dlg_error_list_visible" modal maximizable header="Error list" content-style="height:70vh" :style="{ width: '100%' }">

      <div v-for="err in errors_list" class="my-2">
        {{ err }}
      </div>

      <div class="mb-2">
        <Button label="Clear all" @click="errors_list = []"/>
      </div>
    </Dialog>


    <router-link v-if="false"/>

  </div>

  <Toast/>

</template>

<style lang="scss">

$name-h: 15px;
$btns-h: 60px;

body {
  overflow: hidden;
}

#app {
  background-color: #000;
  //border: 1px solid #ccc;
  height: 100vh;
  overflow: hidden;
  padding: $btns-h 15px 15px 0;

  width: calc(100vw - 100vh);


  header {
    top: 2px;
    width: calc(100vw - 100vh - 20px);
  }


  #editors {
    height: calc(100vh - $btns-h - $name-h);
    position: relative;
    padding-bottom: 50px;

  }

  ul.p-submenu-list {
    //min-width: 350px;
    max-height: calc(100vh - $btns-h);
    overflow: auto;
  }
}

.p-inplace-content {
  display: block;
  max-width: 100%;
}

.p-slider, .p-slider-range, .p-slider-handle {
  user-select: none;
}

.text-danger {
  .p-menuitem-link, .p-menuitem-text {
    color: red !important;
  }
}

.p-menuitem-link {
  padding: 8px 0.7rem !important;
}
</style>