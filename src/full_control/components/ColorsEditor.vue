<script setup lang="ts">
import SegmentsEditor from "./SegmentsEditor.vue";
import {Chrome} from '@ckpack/vue-color';
import {computed, Ref, ref} from "vue";
import Button from "primevue/button";
import {EditorColors_G_VM} from "../VMs/EditorColorsVM";
import {pullAt} from "lodash";


const props = defineProps<{ model: EditorColors_G_VM, opened: Boolean }>()
const emit = defineEmits(['collapse', 'remove_editor'])
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);

const segments = ref(props.model.param_get());
const chrome_models: Ref<({ hex8: string } | string)[]> = computed(() => segments.value.map(s => s.val));
const marker_colors: Ref<(string)[]> = computed(() => segments.value.map(s => s.val.substr(0, 7)));

function collapse_fine_tune() {
  extended.value = false;
}

function update() {
  segments.value = props.model.param_get();
}

function put_to_localstorage() {
  let segments = props.model.param_get();
  if (props.model.param_name === 's_colors')
    pullAt(segments, [0, segments.length - 1]);

  localStorage['color_segments'] = JSON.stringify(segments);
}

function get_from_localstorage() {
  if (!localStorage['color_segments']) return;

  try {
    let stored_segments = JSON.parse(localStorage['color_segments']);
    if (props.model.param_name === 's_colors')
      stored_segments = [segments.value[0], ...stored_segments, segments.value[segments.value.length - 1]];

    props.model.param_set(stored_segments);
    segments.value = stored_segments;

  } catch (e) {
  }

}

defineExpose({update, collapse_fine_tune});

const g_colors_buffer: Ref<{ pos: number, val: string }[]> = ref([]);

</script>

<template>

  <div class="color-editor border p-2">

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

    <SegmentsEditor v-if="opened" v-model:segments="segments" :colors="marker_colors" @update:segments="props.model.param_set(segments)">
      <template #editors="{ n_selected } : { n_selected:number|null }">

        <template v-for="(segment, n) in segments">
          <div v-if="extended || n === n_selected" :class="{border: n === n_selected}" class="chrome-wrap p-1 pl-3">
            <Chrome v-if="props.model.param_name === 'g_colors' || (n > 0 && n < segments.length-1)" v-model="chrome_models[n]"
                    @update:modelValue="()=>{segment.val=chrome_models[n].hex8; props.model.param_set(segments)}"/>
          </div>
        </template>

      </template>
    </SegmentsEditor>

  </div>

</template>

<style lang="scss">
.color-editor {
  .vc-chrome {
    background-color: transparent;
    width: 100%;
  }

  .vc-chrome-saturation-wrap {
    //display: none;
  }

  .vc-chrome-fields-wrap {
    display: none;
  }

  .vc-chrome-body {
    background-color: transparent;
    padding: 16px 0px;
  }

}
</style>