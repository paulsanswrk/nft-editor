<script setup lang="ts">
import Button from 'primevue/button';
import MovableMarker from "./MovableMarker.vue";
import {ref} from "vue";
import {maxBy} from "lodash";

const props = defineProps<{ segments: { pos: number, val: any }[] }>()
const emit = defineEmits(['update:segments'])


const x = ref(0.5);
const n_selected = ref(null);

function add() {
  const segments: { pos: number; val: any }[] = props.segments.slice(0);
  // debugger
  const lengths = segments.map((s, n) => ({n, pos: s.pos, val: s.val, len: (segments[n + 1]?.pos ?? 0) - s.pos}));
  const max_len = maxBy(lengths, 'len');

  segments.splice(max_len.n + 1, 0, {pos: max_len.pos + max_len.len / 2, val: max_len.val});

  n_selected.value = max_len.n + 1;
  // segments.splice(1, 0, {pos: 0.5, val: segments[0].val});
  emit('update:segments', segments);
}

</script>

<template>

  <div class="segments-editor position-relative">

    <div style="height: 30px;">
      <div class="axe position-absolute w-100" style="top:22px; height: 12px; background: #333;"/>

      <MovableMarker v-for="(seg, n) in props.segments"
                     v-model:norm_x="seg.pos"
                     :locked="n === 0 || n === props.segments.length-1"
                     :selected="n===n_selected"
                     @mousedown="n_selected=n"
                     @update:norm_x="$emit('update:segments', props.segments)"
      />
    </div>

    <div class="text-right overflow-hidden">
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