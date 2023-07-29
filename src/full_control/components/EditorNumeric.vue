<script setup lang="ts">
import {EditorModel} from "../common";
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {ref, watch} from "vue";

const props = defineProps<{ model: EditorModel, opened: Boolean }>()

const value = ref(props.model.param_get());
const value_total = ref(props.model.param_get());

const steps = ref(props.model.steps ?? [1, 0.1, 0.01]);
const step = ref(steps.value[1] ?? steps.value[0]);

const fine_tune_needed = ref(steps.value.length > 1);
const extended = ref(fine_tune_needed.value);

// const opened = ref(true);

const fine_tune_value = ref(0);
const fine_tune_step = ref(0.01);

watch(value_total, v => props.model.param_set(v));
watch([value, fine_tune_value], v => value_total.value = value.value + fine_tune_value.value);
watch(value, v => fine_tune_value.value = 0);

function inc() {
  if (value.value + step.value <= props.model.param_max)
    value.value += step.value;
}

function dec() {
  if (value.value - step.value >= props.model.param_min)
    value.value -= step.value;
}

function update() {
  value.value = props.model.param_get();
}

function collapse_fine_tune() {
  extended.value = false;
}

defineExpose({update, collapse_fine_tune});

</script>

<template>

  <div class="border border-light p-2">

    <div class="d-flex justify-content-between edit-header">
      <h6 class="text-white" @click="$emit('collapse')">{{ model.param_name }}: {{ value_total.toFixed(3) }}</h6>

      <span class="p-buttonset">
        <Button v-if="opened && fine_tune_needed" label="F" :outlined="!extended" style="padding: 0 7px;" @click="extended = !extended"/>
        <Button :icon="opened? 'pi pi-minus' : 'pi pi-plus'" outlined @click="$emit('collapse')"/>
        <Button icon="pi pi-times" outlined @click="$emit('remove_editor')"/>
      </span>
    </div>

    <div v-if="opened" class="mt-3">
      <div class="d-flex justify-content-around align-items-center mb-3">
        <InputNumber v-model="value"
                     :max-fraction-digits="5" showButtons buttonLayout="horizontal" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                     input-class="w-100"
                     :step="step" :min="model.param_min" :max="model.param_max"/>
        <Dropdown v-if="steps.length > 1" v-model="step" :options="steps"/>
      </div>

      <Slider v-model="value" class="w-100" :min="model.param_min" :max="model.param_max" :step="step"/>

      <div v-if="extended && fine_tune_needed" class="small-items mx-4 my-4">

        <div class="p-inputgroup flex-1 my-4 small">
          <span class="p-inputgroup-addon">Fine</span>
          <Button icon="pi pi-minus" @click="fine_tune_value -= fine_tune_step"/>
          <InputNumber v-model="fine_tune_value" readonly
                       :max-fraction-digits="5"
                       :step="fine_tune_step" :min="-step" :max="step"
          />
          <Button icon="pi pi-plus" @click="fine_tune_value += fine_tune_step"/>
          <Dropdown v-model="fine_tune_step" :options="[0.01, 0.001].filter(x=>x<step)" style="max-width: 90px"/>
          <Button icon="pi pi-times" @click="fine_tune_value=0"/>
        </div>
        <Slider v-model="fine_tune_value" class="w-100" :min="-step" :max="step" :step="fine_tune_step"/>

      </div>
    </div>

  </div>

</template>

<style lang="scss">
$small_size: 25px;
.small-items {
  .p-inputgroup-addon {
    max-height: $small_size;
    max-width: $small_size;
  }

  .p-component {
    max-height: $small_size;
    font-size: 12px;

    & .pi {
      font-size: 12px;
    }
  }

  .p-button {
    background-color: #aaa;
    border-color: #aaa;
    max-width: $small_size;
  }

  .p-slider-range, .p-slider-handle {
    background-color: #aaa;
    border-color: #aaa;
  }

  .p-dropdown-label {
    font-size: 12px;
    padding: 2px 6px;
  }
}

.edit-header {
  .p-button {
    max-height: $small_size;
    max-width: $small_size;

    & .pi {
      font-size: 12px;
    }
  }
}
</style>