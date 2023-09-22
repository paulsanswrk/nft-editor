<script setup>

import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import {TinyColor} from "@ctrl/tinycolor";
import Button from 'primevue/button';

const spiral_view = SpiralViewFullControl_instance;
const spiral = spiral_view.active_spiral;

</script>

<template>
  <div>
    <Button label="update" @click="$forceUpdate" class="mb-3"/>

    <template v-for="c in spiral.g_colors">

      <div :style="{background: c.color}" style="height:80px;">
        {{ c.pos }}: {{ c.color }} <br/>
        HSV: {{ new TinyColor(c.color).toHsv() }}
      </div>

      <div :style="{background: spiral.segm_color_func(c.pos, spiral.g_colors_ext).toHexString()}" style="height:80px;">
        {{ c.pos }}: {{ spiral.segm_color_func(c.pos, spiral.g_colors_ext).toHexString() }} <br/>
        HSV: {{ new TinyColor(spiral.segm_color_func(c.pos, spiral.g_colors_ext).toHexString()).toHsv() }}
      </div>

    </template>
  </div>
</template>

<style lang="scss">


</style>