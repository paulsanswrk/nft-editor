<script setup lang="ts">
import SegmentsEditor from "./SegmentsEditor.vue";
import {Chrome} from '@ckpack/vue-color';
import {computed, Ref, ref} from "vue";
import Button from "primevue/button";
import {EditorColors_G_VM} from "../VMs/EditorColorsVM";


const props = defineProps<{ model: EditorColors_G_VM, opened: Boolean }>()
const emit = defineEmits(['collapse', 'remove_editor'])
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);

const segments = ref(props.model.param_get());
const chrome_models: Ref<({ hex8: string } | string)[]> = computed(() => segments.value.map(s => s.val));

function collapse_fine_tune() {
  extended.value = false;
}

function update() {
  segments.value = props.model.param_get();
}

defineExpose({update, collapse_fine_tune});


</script>

<template>

  <div class="color-editor border p-2">

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

        <div v-for="(segment, n) in segments" :class="{border: n === n_selected}" class="chrome-wrap p-1">
          <Chrome v-if="props.model.param_name === 'g_colors' || (n > 0 && n < segments.length-1)" v-model="chrome_models[n]"
                  @update:modelValue="()=>{segment.val=chrome_models[n].hex8; props.model.param_set(segments)}"/>
        </div>

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