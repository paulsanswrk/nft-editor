import {ref, Ref} from "vue";

export const editor_refs: Ref<{ [k: string]: any }> = ref({});

export const fps = ref(30);
export const duration = ref(5);

export const filename = ref(Date.now().toString());
export const save_resolution = ref(1400);
