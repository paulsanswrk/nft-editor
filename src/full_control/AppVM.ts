import {ref, Ref} from "vue";
import {editor_models} from "./EditorsVM";

export const editor_refs: Ref<{ [k: string]: any }> = ref({});

export function update_editors(config?: { [p: string]: any }) {
    for (const k in editor_models.all_models)
        if (!config || config[k] !== undefined)
            editor_refs.value[k]?.update();
}