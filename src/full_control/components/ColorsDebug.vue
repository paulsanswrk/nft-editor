<script setup>

import {SpiralViewFullControl_instance} from "../SpiralViewFullControl";
import {TinyColor} from "@ctrl/tinycolor";

const spiral_view = SpiralViewFullControl_instance;

</script>

<template>
  <div>
    <div v-for="z in [0, 0.4, 0.5, 0.95, 1, 1.1]" :style="{background: spiral_view.spiral_factory.G_color_func_hex(z)}" style="height:80px;">
      {{ z }}: {{ spiral_view.spiral_factory.G_color_func_hex(z) }} <br/>
      HSV: {{ new TinyColor(spiral_view.spiral_factory.G_color_func_hex(z)).toHsv() }}
    </div>
  </div>
</template>

<style lang="scss">


</style>