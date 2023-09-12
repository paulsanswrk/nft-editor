<script setup lang="ts">
import SegmentsEditor from "./SegmentsEditor.vue";
import {ref} from "vue";
import Button from "primevue/button";
import {anim_points} from "../animation";
import {editor_models} from "../EditorsVM";

const props = defineProps<{ opened: Boolean }>()
const emit = defineEmits(['collapse', 'remove_editor'])
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);


function collapse_fine_tune() {
  extended.value = false;
}

function update() {
}

defineExpose({update, collapse_fine_tune});


</script>

<template>

  <div class="animation-points-editor border p-2">

    <div class="d-flex justify-content-between edit-header mb-2">
      <h6 class="font-weight-bold text-white" @click="$emit('collapse')">Animation Points</h6>

      <span class="p-buttonset">
        <Button v-if="opened && fine_tune_needed" label="F" :outlined="!extended" style="padding: 0 7px;" @click="extended = !extended"/>
        <Button :icon="opened? 'pi pi-minus' : 'pi pi-plus'" outlined @click="$emit('collapse')"/>
        <Button icon="pi pi-times" outlined @click="$emit('remove_editor')"/>
      </span>
    </div>

    <SegmentsEditor v-if="opened" v-model:segments="anim_points">
      <template #editors="{ n_selected } : { n_selected: number|null }">

        <div v-if="n_selected !== null">
          <Button icon="pi pi-file-import" outlined size="small" class="mr-2"
                  @click.stop="anim_points[n_selected].val=editor_models.get_config()"/>
          <Button icon="pi pi-file-export" outlined size="small" :disabled="!anim_points[n_selected].val"
                  @click.stop="editor_models.set_config(anim_points[n_selected].val)"/>
        </div>

      </template>
    </SegmentsEditor>

  </div>

</template>

<style lang="scss">
.animation-points-editor {

}
</style>