<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Galleria from 'primevue/galleria';
import ProgressSpinner from 'primevue/progressspinner';
import {Ref, ref} from "vue";
import {gdrive_listFiles} from "../../common/gdrive";
import {GDriveFile} from "../common";

const dialog_opened = ref(false)

defineEmits(['file_select'])

const responsiveOptions = ref([
  {breakpoint: '1801px', numVisible: 10},
  {breakpoint: '1601px', numVisible: 8},
  {breakpoint: '1201px', numVisible: 6},
  {breakpoint: '991px', numVisible: 4},
  {breakpoint: '767px', numVisible: 3},
  {breakpoint: '575px', numVisible: 1}
]);

const files: Ref<GDriveFile[]> = ref([]);

async function open() {

  files.value = await gdrive_listFiles();
  dialog_opened.value = true;
}

function close() {
  files.value = [];
  dialog_opened.value = false;
}


defineExpose({open, close});

function showDialogMaximized(dialog: any) {
  dialog.maximize();
}

</script>

<template>
  <div v-if="dialog_opened">

    <Dialog v-if="files.length" :visible="dialog_opened" modal maximizable header="Open file" :style="{ width: '50vw' }" @update:visible="close">
      <div class="card md:flex md:justify-content-center">
        <Galleria :value="files" :responsiveOptions="responsiveOptions" :numVisible="12" :showItemNavigators="true" containerStyle="background: #000;">
          <template #item="slotProps:{item:GDriveFile}">
            <div class="position-relative">
              <div class="position-absolute d-flex align-items-center justify-content-center w-100" style="top:15px;">
                <strong>{{ slotProps.item.name }}</strong>
                <Button label="Select" outlined size="small" class="mx-2" @click="$emit('file_select', slotProps.item)"/>
                <Button label="Cancel" severity="warning" outlined size="small" @click="close"/>
              </div>
              <img :src="slotProps.item.thumbnailLink.replace('=s220', '')" :alt="slotProps.item.name" style="height: 60vh; width: 60vh;"/>
            </div>
          </template>
          <template #thumbnail="slotProps:{item:GDriveFile}">
            <div class="mx-1">
              <img class="img-thumbnail" :src="slotProps.item.thumbnailLink" :alt="slotProps.item.name"/>
            </div>
          </template>
        </Galleria>
      </div>
    </Dialog>

    <div class="text-center m-5" v-else>
      <ProgressSpinner/>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>