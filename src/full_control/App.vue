<script setup>
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import Button from 'primevue/button';
</script>

<template>
  <div class="message mb-2 text-white">Controls</div>
  <Button label="Submit">Submit</Button>
</template>

<style lang="scss">
#app {
  background-color: #000;
  border: 1px solid #ccc;
  height: 100vw;
  padding: 15px;
  width: calc(100vw - 100vh);
}
</style>