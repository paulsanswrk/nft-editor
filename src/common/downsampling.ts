import {SpiralViewFullControl_instance} from "../full_control/SpiralViewFullControl";
import {imageProcessor, resize, sharpen} from "ts-image-processor";
import {ref} from "vue";

export const dlg_cover_view_visible = ref(false);

export const downsample_resolution = ref(640);
export const downsample_img = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAWElEQVR42mP8/wcAAwAB/AV5YAAAAABJRU5ErkJggg==');

const spiral_view = SpiralViewFullControl_instance;

export async function create_downsampled_image() {
    const hires_img = await spiral_view.export_image_base64(3600);

    downsample_img.value = await imageProcessor
        .src(hires_img)
        .pipe(
            resize({maxWidth: downsample_resolution.value, maxHeight: downsample_resolution.value}),
            sharpen(),
        );

}