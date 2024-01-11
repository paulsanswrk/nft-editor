<script setup lang="ts">
import {Chrome} from '@ckpack/vue-color';
import {onMounted, ref} from "vue";
import EditorLighting_BJS_VM from "../VMs/EditorLighting_BJS_VM";
import Button from "primevue/button";
import {sleep} from "../../common/help_funcs";
import Slider from 'primevue/slider';

const props = defineProps<{ model: EditorLighting_BJS_VM, opened: Boolean }>()
const emit = defineEmits(['collapse', 'remove_editor'])
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);

const lighting_model = ref({...props.model.param_get()});

onMounted(async () => {
  await sleep(100);
  lighting_model.value = {...props.model.param_get()};
})

function collapse_fine_tune() {
  extended.value = false;
}

function update() {
  lighting_model.value = {...props.model.param_get()};
}

function put_to_localstorage() {
  let lighting_params = props.model.param_get();
  localStorage['lighting'] = JSON.stringify(lighting_params);
}

function get_from_localstorage() {
  if (!localStorage['lighting']) return;

  try {
    let lighting_params = JSON.parse(localStorage['lighting']);

    props.model.param_set(lighting_params);
    update();

  } catch (e) {
  }

}

defineExpose({update, collapse_fine_tune})

</script>

<template>

  <div class="lighting-editor color-editor border p-2 pl-4">

    <div class="d-flex justify-content-between edit-header mb-2">
      <h6 class="font-weight-bold text-white" @click="$emit('collapse')">{{ props.model.param_name }}</h6>

      <span class="p-buttonset">
        <Button icon="pi pi-file-export" outlined @click="put_to_localstorage()" title="Save to buffer"/>
        <Button icon="pi pi-file-import" outlined @click="get_from_localstorage()" title="Load from buffer"/>
        <Button v-if="opened && fine_tune_needed" label="F" :outlined="!extended" style="padding: 0 7px;" @click="extended = !extended"/>
        <Button :icon="opened? 'pi pi-minus' : 'pi pi-plus'" outlined @click="$emit('collapse')"/>
        <Button icon="pi pi-times" outlined @click="$emit('remove_editor')"/>
      </span>
    </div>

    <div v-if="opened && !!lighting_model">
      <h6 class="text-white">Scene Clear Color</h6>
      <Chrome v-model="lighting_model.scene_clearColor" @update:modelValue="v => {props.model.param_set({scene_clearColor: v.hex8})}"/>

      <h6 class="text-white">Scene Ambient Color</h6>
      <Chrome v-model="lighting_model.scene_ambientColor" @update:modelValue="v => {props.model.param_set({scene_ambientColor: v.hex})}"/>

      <h6 class="text-white">Light Diffuse Color</h6>
      <Chrome v-if="lighting_model.light_diffuseColor" v-model="lighting_model.light_diffuseColor" @update:modelValue="v => {props.model.param_set({light_diffuseColor: v.hex})}"/>

      <h6 class="text-white">Light Ground Color</h6>
      <Chrome v-if="lighting_model.light_groundColor" v-model="lighting_model.light_groundColor" @update:modelValue="v => {props.model.param_set({light_groundColor: v.hex})}"/>

      <h6 class="text-white">Light Direction</h6>
      <div v-if="lighting_model.light_direction" class="d-flex justify-content-between text-white mb-3">
        <div style="width: 30%">
          X: {{ lighting_model.light_direction.x }} <br/>
          <Slider v-model="lighting_model.light_direction.x" :min="-10" :max="10" @change="v => {props.model.param_set({light_direction: lighting_model.light_direction})}"/>
        </div>
        <div style="width: 30%">
          Y: {{ lighting_model.light_direction.y }} <br/>
          <Slider v-model="lighting_model.light_direction.y" :min="-10" :max="10" :step="0.1" @change="v => {props.model.param_set({light_direction: lighting_model.light_direction})}"/>
        </div>
        <div style="width: 30%">
          Z: {{ lighting_model.light_direction.z }} <br/>
          <Slider v-model="lighting_model.light_direction.z" :min="-10" :max="10" :step="0.1" @change="v => {props.model.param_set({light_direction: lighting_model.light_direction})}"/>
        </div>
      </div>

      <h6 class="text-white">Material Ambient Color</h6>
      <Chrome v-model="lighting_model.mat_ambientColor" @update:modelValue="v => {props.model.param_set({mat_ambientColor: v.hex})}"/>

      <h6 class="text-white">Material Diffuse Color</h6>
      <Chrome v-model="lighting_model.mat_diffuseColor" @update:modelValue="v => {props.model.param_set({mat_diffuseColor: v.hex})}"/>

      <h6 class="text-white">Material Emissive Color</h6>
      <Chrome v-model="lighting_model.mat_emissiveColor" @update:modelValue="v => {props.model.param_set({mat_emissiveColor: v.hex})}"/>

      <h6 class="text-white">Material Specular Color</h6>
      <Chrome v-model="lighting_model.mat_specularColor" @update:modelValue="v => {props.model.param_set({mat_specularColor: v.hex})}"/>

      <h6 class="text-white">Material Specular Power</h6>
      <Slider v-model="lighting_model.mat_specularPower" :min="0" :max="128" :step="0.1" @change="v => {props.model.param_set({mat_specularPower: v})}"/>

    </div>

  </div>

</template>

<style lang="scss">
.lighting-editor {
  .vc-chrome-saturation-wrap {
    padding-bottom: 0;
    height: 35px;

    .vc-saturation {
      height: 30px;
    }
  }
}
</style>