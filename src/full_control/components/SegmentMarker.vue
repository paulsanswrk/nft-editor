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
  // console.log('norm_to_screen', nx, '->', res)
  return (parent_w.value - handle_w.value) * nx;
}

</script>


<template>

  <span v-if="!props.locked" ref="handle"
        class="pi pi-map-marker segment-marker"
        :class="{selected: props.selected}"
        :style="{left: `${norm_to_screen(props.norm_x)}px`}"
  />

  <span v-else ref="handle" class="pi pi-map-marker segment-marker position-absolute" style="margin-top: 2px;"
        :style="{left: `${norm_to_screen(props.norm_x)}px`}"
        :class="{selected: props.selected}"
  />

</template>


<style lang="scss">
.segment-marker {
  color: #fff;
  position: absolute;

  &.selected {
    //color: #00d9ff;
    font-size: 22px;
    margin-top: -2px !important;
  }
}
</style>