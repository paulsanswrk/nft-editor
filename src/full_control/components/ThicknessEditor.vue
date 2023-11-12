<script setup lang="ts">
import SegmentsEditor from "./SegmentsEditor.vue";
import {Ref, ref} from "vue";
import Button from "primevue/button";
import {EditorThickness_G_VM} from "../VMs/EditorThicknessVM";
import Slider from 'primevue/slider';

const props = defineProps<{ model: EditorThickness_G_VM, opened: Boolean }>()
const emit = defineEmits(['collapse', 'remove_editor'])
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);

const segments: Ref<{ pos: number; val: number }[]> = ref(props.model.param_get());

function collapse_fine_tune() {
  extended.value = false;
}

function update() {
  segments.value = props.model.param_get();
}

defineExpose({update, collapse_fine_tune});


</script>

<template>

  <div class="thickness-editor border p-2">

    <div class="d-flex justify-content-between edit-header mb-2">
      <h6 class="font-weight-bold text-white" @click="$emit('collapse')">{{ props.model.param_name }}</h6>

      <span class="p-buttonset">
        <Button v-if="opened && fine_tune_needed" label="F" :outlined="!extended" style="padding: 0 7px;" @click="extended = !extended"/>
        <Button :icon="opened? 'pi pi-minus' : 'pi pi-plus'" outlined @click="$emit('collapse')"/>
        <Button icon="pi pi-times" outlined @click="$emit('remove_editor')"/>
      </span>
    </div>

    <SegmentsEditor v-if="opened" v-model:segments="segments" @update:segments="props.model.param_set(segments)">
      <template #editors="{ n_selected } : { n_selected:number|null }">

        <template v-for="(segment, n) in segments">
          <div v-if="extended || n === n_selected" :class="{border: n === n_selected}" class="slider-wrap px-2 py-4 my-2">
            <Slider v-model="segment.val" :step="0.001" :min="0" :max="0.03" @change="props.model.param_set(segments)"/>
          </div>
        </template>

      </template>
    </SegmentsEditor>

  </div>

</template>

<style lang="scss">
.thickness-editor {

}
</style>