<script setup lang="ts">

import SegmentsEditor from "./SegmentsEditor.vue";
import {computed, ref, watch} from "vue";
import Button from "primevue/button";
import {anim_points, current_anim_point_num, playing_morphing, playing_time, toggle_playing_morphing} from "../animation";
import {editor_models} from "../EditorsVM";
import {update_editors} from "../AppVM";
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import Dropdown from 'primevue/dropdown';
import {easing_func_names} from "../../common/easing";

const props = defineProps<{ opened: Boolean }>()
const emit = defineEmits(['collapse', 'remove_editor', 'update_editors'])
const fine_tune_needed = ref(true);
const extended = ref(fine_tune_needed.value);

const play_from_current_point = ref(false);
const segm_to_play_cnt = ref(0);

const stop_at_point = computed(() => Math.min(current_anim_point_num.value + segm_to_play_cnt.value, anim_points.value.length - 1));

const end_point_opts = computed(() => Array.from({length: anim_points.value.length - current_anim_point_num.value - 1}, (v, i) => i + 1));

watch([anim_points, current_anim_point_num], () => {
  segm_to_play_cnt.value = Math.min(segm_to_play_cnt.value, anim_points.value.length - current_anim_point_num.value - 1);
});

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

    <SegmentsEditor v-if="opened" v-model:segments="anim_points" @selection_changed="n => current_anim_point_num = n" :colors="anim_points.map(p => p.val? '#fff' : '#aaa')">
      <template #editors="{ n_selected } : { n_selected: number|null }">

        <div class="d-flex justify-content-between align-items-start">

          <div v-if="n_selected !== null">
            <Button icon="pi pi-file-import" label="Set" outlined size="small" class="mr-2"
                    @click.stop="anim_points[n_selected].val=editor_models.get_config()"/>
            <Button icon="pi pi-file-export" label="Get" outlined size="small" :disabled="!anim_points[n_selected].val"
                    @click.stop="editor_models.set_config(anim_points[n_selected].val); emit('update_editors')"/>
          </div>

          <div>
            <Dropdown v-if="n_selected !== anim_points.length-1" :options="easing_func_names" v-model="anim_points[n_selected].easing" placeholder="easing" size="small"/>
          </div>

        </div>

      </template>
    </SegmentsEditor>

    <div v-if="extended" class="mt-4 text-white">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <Button icon="pi pi-play" :outlined="!playing_morphing" :disabled="playing_morphing"
                  size="small"
                  @click="toggle_playing_morphing(...(play_from_current_point? [current_anim_point_num, stop_at_point]: [0, 0])).then(()=>update_editors(anim_points[stop_at_point].val))"
                  class="mr-1"/>
        </div>

        <div>

          <div class="d-flex align-items-center">
            <Checkbox v-model="play_from_current_point" :binary="true" input-id="cb-play_from_current_point"/>
            &nbsp;
            <label for="cb-play_from_current_point" class="ml-1">Start from current</label>
          </div>

          <div v-if="play_from_current_point" class="">
            play:
            <span v-for="n in end_point_opts" class="mx-1 d-inline-flex align-items-center">
          <RadioButton name="end_point_opts" v-model="segm_to_play_cnt" :value="n" :input-id="`end_point_opt-${n}`"/>
            &nbsp;
            <label :for="`end_point_opt-${n}`">{{ n }}</label>
          </span>

          </div>

        </div>
      </div>

      <div v-if="playing_time">
        {{ playing_time.toFixed(1) }} s
      </div>

    </div>

  </div>
</template>

<style lang="scss">
.animation-points-editor {

}
</style>