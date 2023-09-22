<script setup lang="ts">

import {onMounted, Ref, ref} from "vue";

const props = defineProps<{ norm_x: Number, selected: Boolean, locked: Boolean }>()
const emit = defineEmits(['update:norm_x'])

const handle: Ref<HTMLElement | null> = ref(null);

const parent_w = ref(340);
const handle_w = ref(16);

onMounted(() => {
  parent_w.value = handle.value.offsetParent.clientWidth;
  // handle_w.value = handle.value.clientWidth;
});

function norm_to_screen(nx: number): number {
  if (handle.value) {
    const style = window.getComputedStyle(handle.value);
    const matrix = new DOMMatrixReadOnly(style.transform);
    if (matrix?.e) return 0;
  }

  let res = (parent_w.value - handle_w.value) * nx;
  // console.log('norm_to_screen', nx, '->', res)
  return res;
}

function screen_to_norm(sx: number | null = null): number {
  // const rect = handle.value.getBoundingClientRect();
  // const px = handle.value.offsetParent.getBoundingClientRect().x;
  // const transform = handle.value.style.transform;
  let hx = 0;
  if (handle.value) {
    const style = window.getComputedStyle(handle.value);
    // const left = style.left.slice(0, -2);
    const matrix = new DOMMatrixReadOnly(style.transform);
    // const hx = Number(style.left.slice(0, -2));
    hx = matrix.e;
  }

  sx ??= hx;
  const res = sx / (parent_w.value - handle_w.value);
  // console.log('screen_to_norm', {hx, px, sx, parent_w, handle_w, transform, rect, left, style, matrix, res})
  return res;
}

function drag_end(e: Event) {
  // const handle = e.target as HTMLSpanElement;
  const x = screen_to_norm(Number(handle.value.style.left.slice(0, -2)));
  // console.log('drag_end', x)
  if (x < 0)
    emit('update:norm_x', 0);
  else if (x > 1)
    emit('update:norm_x', 1);
  // handle.style.left = `${handle.offsetParent.clientWidth - handle.clientWidth}px`;
}

function moving() {
  const x = screen_to_norm();
  // console.log(x)
  if (0 <= x && x <= 1)
    emit('update:norm_x', x);
}
</script>


<template>

  <span v-if="!props.locked" v-drag:x @v-drag-end="drag_end" ref="handle" @v-drag-moving="moving"
        class="pi pi-map-marker movable-marker"
        :class="{selected: props.selected}"
        :style="{left: `${norm_to_screen(props.norm_x)}px`}"
  />

  <span v-else ref="handle" class="pi pi-map-marker movable-marker position-absolute" style="margin-top: 2px;"
        :style="{left: `${norm_to_screen(props.norm_x)}px`}"
        :class="{selected: props.selected}"
  />

</template>


<style lang="scss">
.movable-marker {
  color: #fff;

  &.selected {
    //color: #00d9ff;
    font-size: 22px;
    margin-top: -2px !important;
  }
}
</style>