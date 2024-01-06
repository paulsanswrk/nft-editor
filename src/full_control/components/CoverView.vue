<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Slider from 'primevue/slider';
import Button from "primevue/button";
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';

import {create_downsampled_image, dlg_cover_view_visible, downsample_img, downsample_resolution} from "../../common/downsampling";
import {Ref, ref, watch} from "vue";

const cropped_size = ref(383);
const crop_ratio = ref(1);

const dialog_size = ref(383);

const dialog: Ref<Dialog | null> = ref(null);

const chosen_size = ref(383);

type position_type = "center" | "top" | "bottom" | "left" | "right" | "topleft" | "topright" | "bottomleft" | "bottomright" | undefined;

const dialog_pos: Ref<position_type> = ref('center' as position_type);

const show_object_bounds_789 = ref(false);
const show_object_bounds_383 = ref(false);

const circle_mode = ref(false);

watch([show_object_bounds_789, show_object_bounds_383], v =>
    document.getElementById('canvas-wrapper').className = [show_object_bounds_789.value ? 'border-visible-789' : '', show_object_bounds_383.value ? 'border-visible-383' : ''].join(' '));

watch(crop_ratio, () => downsample_resolution.value = 640 / crop_ratio.value);

</script>

<template>
  <Dialog v-model:visible="dlg_cover_view_visible" maximizable header="Cover"
          :style="{width: `${dialog_size+40}px`, height:`${dialog_size+160}px`}"
          :position="dialog_pos"
          ref="dialog"
          @show="create_downsampled_image()">

    <div class="mb-3 d-flex justify-content-start align-items-stretch">

      <div class="mx-2">
        <div class="mb-2 overflow-hidden">
          Size: {{ cropped_size }}
          <Dropdown class="float-right p-0" :options="[383, 578, 789]" v-model="chosen_size" @change="crop_ratio=1; dialog_size=cropped_size=chosen_size" size="small"/>
        </div>
        <Slider v-model="cropped_size" :min="300" :max="2400" :step="1" style="min-width: 175px;"/>
      </div>

      <div class="mx-2 d-inline-flex flex-column justify-content-between">
        <div class="mb-2">
          Crop ratio: {{ crop_ratio.toFixed(2) }}
          <Button size="small" label="=" class="ml-2 py-0 px-1" @click="crop_ratio = 1"/>
        </div>
        <Slider v-model="crop_ratio" :min="0.01" :max="1" :step="0.01" style="min-width: 175px;"/>
      </div>

      <div class="mx-2 d-inline-flex flex-column justify-content-between">

        <div class="mb-2 text-nowrap">
          Show object bounds (789)
          <Checkbox v-model="show_object_bounds_789" :binary="true"/>
        </div>

        <div class="mb-2 text-nowrap">
          Show object bounds (383)
          <Checkbox v-model="show_object_bounds_383" :binary="true"/>
        </div>

      </div>

    </div>

    <div class="text-center" style="width: 100%;">

      <div id="crop-wrap" :style="{width: `${cropped_size}px`, height: `${cropped_size}px`}" class="d-inline-block overflow-hidden position-relative border border-1" :class="{round: circle_mode}">
        <img
            :style="{width: `${cropped_size/crop_ratio}px`, height: `${cropped_size/crop_ratio}px`, top: `${-(cropped_size/crop_ratio-cropped_size)/2}px`, left: `${-(cropped_size/crop_ratio-cropped_size)/2}px`}"
            :src="downsample_img" class="position-absolute"/>
      </div>

    </div>

    <template #header>

      <div class="d-flex align-items-center justify-content-start">
        <span class="mr-3">Cover</span>

        <Button size="small" outlined icon="pi pi-refresh" class="mx-1 p-1" @click="create_downsampled_image()"/>
        <Button size="small" outlined label="LB" class="mx-1 p-1" @click="dialog_pos = 'bottomleft'"/>
        <Button size="small" outlined label="RB" class="mx-1 p-1" @click="dialog_pos = 'bottomright'"/>
        <Button size="small" outlined label="TL" class="mx-1 p-1" @click="dialog_pos = 'topleft'"/>
        <Button size="small" outlined icon="pi pi-arrows-v" class="mx-1 p-1" @click="dialog_size = Math.min(cropped_size, crop_ratio*cropped_size)"/>
        <Button size="small" :outlined="!circle_mode" icon="pi pi-circle" class="mx-1 p-1" @click="circle_mode = !circle_mode"/>
      </div>

    </template>

  </Dialog>
</template>

<style lang="scss">
#crop-wrap {

  &.round {
    border-radius: 100%;
  }

  img {
  }
}
</style>