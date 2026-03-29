<script setup lang="ts">

import EditorNumericOrSegmentedVM from "../VMs/EditorNumericOrSegmentedVM";
import {nextTick, Ref, ref} from "vue";
import Button from "primevue/button";
import NumericEditor from "./NumericEditor.vue";
import SegmentsEditor from "./SegmentsEditor.vue";
import Slider from "primevue/slider";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import {throttle} from "lodash";

const props = defineProps<{ model: EditorNumericOrSegmentedVM, opened: Boolean }>()
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);

const is_segmented = ref(props.model.is_segmented);

const segments: Ref<{ pos: number; val: number }[]> = ref(is_segmented.value ? props.model.param_get() : []);

const numeric_editor = ref<InstanceType<typeof NumericEditor> | null>(null);
const segments_editor = ref<InstanceType<typeof SegmentsEditor> | null>(null);

const steps = ref(props.model.editorNumericVM.steps ?? [1, 0.1, 0.01]);
const step = ref(steps.value[1] ?? steps.value[0]);


function update() {
  is_segmented.value = props.model.is_segmented;

  if (is_segmented.value) {
    segments.value = props.model.param_get();
  } else
    numeric_editor.value?.update();
}

function collapse_fine_tune() {
  if (is_segmented.value)
    // @ts-ignore
    segments_editor.value?.collapse_fine_tune();
  else
    // @ts-ignore
    numeric_editor.value?.collapse_fine_tune();
}

defineExpose({update, collapse_fine_tune});

async function toggle() {
  props.model.toggle();
  is_segmented.value = props.model.is_segmented;

  await nextTick();

  if (is_segmented.value) {
    segments.value = props.model.param_get();
  }
}

const segments_changed = throttle(() => {
  props.model.param_set(segments.value)
}, 100)


</script>

<template>

  <div>

    <NumericEditor v-if="!is_segmented" :model="model.editorNumericVM"
                   :opened="opened"
                   @collapse="$emit('collapse')"
                   @remove_editor="$emit('remove_editor')"
                   ref="numeric_editor">
      <template #extra_buttons>
        <Button icon="pi pi-sliders-h" :outlined="!is_segmented" @click="toggle"/>
      </template>
    </NumericEditor>

    <div v-else class="thickness-editor border p-2">
      <div class="d-flex justify-content-between edit-header mb-2">
        <h6 class="font-weight-bold text-white" @click="$emit('collapse')">{{ props.model.param_name }}</h6>

        <span class="p-buttonset">
          <Button icon="pi pi-sliders-h" :outlined="!is_segmented" @click="toggle"/>
          <Button v-if="opened && fine_tune_needed" label="F" :outlined="!extended" style="padding: 0 7px;" @click="extended = !extended"/>
          <Button :icon="opened? 'pi pi-minus' : 'pi pi-plus'" outlined @click="$emit('collapse')"/>
          <Button icon="pi pi-times" outlined @click="$emit('remove_editor')"/>
        </span>
      </div>

      <SegmentsEditor v-if="opened" :segments="segments"
                      @update:segments="_segments => {props.model.param_set(_segments); update()}"
                      :opened="opened"
                      ref="segments_editor" :colors="[]">

        <template #editors="{ n_selected } : { n_selected:number|null }">

          <template v-for="(segment, n) in segments">
            <div v-if="extended || n === n_selected" :class="{border: n === n_selected}" class="slider-wrap px-2 py-4 my-2">

              <template v-if="!extended">

                <div class="d-flex justify-content-around align-items-center mb-3">
                  <Button icon="pi pi-minus" @click="() => {segment.val -= step; segments_changed()}"/>
                  <InputNumber v-model="segment.val" readonly
                               :max-fraction-digits="5"
                               input-class="w-100"
                               :step="step" :min="model.editorNumericVM.param_min" :max="model.editorNumericVM.param_max"/>
                  <Button icon="pi pi-plus" @click="() => {segment.val += step; segments_changed()}"/>

                  <Select v-if="steps.length > 1" v-model="step" :options="steps.map(s=>({label: props.model.editorNumericVM.format(s), val: s}))" option-label="label" option-value="val"/>

                </div>

                <Slider v-model="segment.val" class="w-100" :min="model.editorNumericVM.param_min" :max="model.editorNumericVM.param_max" :step="step" @change="segments_changed"/>

              </template>

              <Slider v-else v-model="segment.val" :step="0.01" :min="model.editorNumericVM.param_min" :max="model.editorNumericVM.param_max" @change="segments_changed"/>

            </div>
          </template>

        </template>

      </SegmentsEditor>

    </div>

  </div>

</template>

<style scoped lang="scss">

</style>