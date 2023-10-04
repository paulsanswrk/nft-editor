<script setup lang="ts">
import Button from 'primevue/button';
import {ref} from "vue";
import {moveItemInArray} from "../../common/help_funcs";
import Slider from 'primevue/slider';
import SegmentMarker from "./SegmentMarker.vue";

const props = defineProps<{ segments: { pos: number, val: any }[], colors: string[] | null }>()
const emit = defineEmits(['update:segments', 'selection_changed'])


const x = ref(0.5);
const n_selected = ref(0);

function add() {
  const segments: { pos: number; val: any }[] = props.segments.slice(0);
  const n_place_after = Math.min(segments.length - 2, n_selected.value);

  segments.splice(n_place_after + 1, 0,
      {
        pos: segments[n_place_after].pos + ((segments[n_place_after + 1]?.pos ?? 1) - segments[n_place_after].pos) / 2,
        val: segments[n_place_after].val
      });

  n_selected.value = n_place_after + 1;
  emit('update:segments', segments);
  emit('selection_changed', n_selected.value);
}

function swap(n1: number, n2: number) {
  const pos1 = props.segments[n1].pos;
  const pos2 = props.segments[n2].pos;

  moveItemInArray(props.segments, n1, n2);
  props.segments[n1].pos = pos1;
  props.segments[n2].pos = pos2;

  emit('update:segments', props.segments);
}

function equal_distances() {
  const len = props.segments.length - 1;
  props.segments.forEach((s, n) => s.pos = n / len);
}

</script>

<template>

  <div class="segments-editor position-relative">

    <Slider v-model="props.segments[n_selected].pos"
            :step="0.01" :min="(props.segments[n_selected-1]?.pos ?? 0) + 0.01" :max="(props.segments[n_selected+1]?.pos ?? 1) - 0.01"
            :disabled="!n_selected || n_selected === props.segments.length-1"
            @change="$emit('update:segments', props.segments)"
            class="mx-2 my-4"
    />


    <div style="height: 30px;" class="mb-2 position-relative">
      <div class="axe position-absolute w-100" style="top:22px; height: 12px; background: #333;"/>

      <SegmentMarker v-for="(seg, n) in props.segments"
                     v-model:norm_x="seg.pos"
                     :locked="n === 0 || n === props.segments.length-1"
                     :selected="n===n_selected"
                     :style="{color: props.colors?.[n] ?? '#fff'}"
                     @mousedown="n_selected=n; emit('selection_changed', n_selected)"
      />
    </div>

    <div class="text-right overflow-hidden">

      <div class="float-left">
        <span v-if="n_selected !== null" class="text-white">
          {{ segments[n_selected]?.pos.toFixed(2) }}
        </span>
      </div>

      <Button icon="pi pi-angle-left" size="small" text raised rounded outlined style="padding: 5px"
              @click="n_selected = (n_selected-1+props.segments.length) % props.segments.length; emit('selection_changed', n_selected)"/>
      <Button icon="pi pi-angle-right" size="small" text raised rounded outlined style="padding: 5px"
              @click="n_selected = (n_selected+1) % props.segments.length; emit('selection_changed', n_selected)"/>
      <Button icon="pi pi-arrows-h" size="small" text raised rounded outlined style="padding: 5px" :disabled="props.segments.length == 2" @click="equal_distances"/>
      <Button icon="pi pi-angle-up" size="small" text raised rounded outlined style="padding: 5px" :disabled="n_selected === null || n_selected == props.segments.length-1"
              @click="swap(<number>n_selected, n_selected+1); n_selected++; emit('selection_changed', n_selected)"/>
      <Button icon="pi pi-angle-down" size="small" text raised rounded outlined style="padding: 5px" :disabled="!n_selected"
              @click="swap(<number>n_selected, n_selected-1); n_selected--; emit('selection_changed', n_selected)"/>
      <Button icon="pi pi-plus" size="small" text raised rounded outlined style="padding: 5px" @click="add"/>
      <Button icon="pi pi-times" size="small" text raised rounded outlined style="padding: 5px"
              @click="props.segments.splice(<number>n_selected, 1); $emit('update:segments', props.segments)"
              :disabled="!n_selected || n_selected === props.segments.length-1"/>
    </div>

    <div class="segments-editors">

      <slot name="editors" :segments="props.segments" :n_selected="n_selected"/>

    </div>

  </div>

</template>

<style lang="scss">

.segments-editor {
  //height: 400px;
  width: 100%;

  .axe {
    height: 150px;
    overflow: hidden;
    width: 100%;
  }

}

</style>