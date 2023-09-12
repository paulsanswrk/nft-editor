import {computed, Ref, ref} from "vue";
import {editor_models} from "./EditorsVM";
import {sleep} from "../common/help_funcs";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";

const spiral_view = SpiralViewFullControl_instance;

export const camera_speed = ref(0);
export const fps = ref(30);
export const duration = ref(5);
export const enable_morphing = ref(true);
export const playing_morphing = ref(false);

// export const start_config: Ref<{ [p: string]: any } | null> = ref(null);
// export const end_config: Ref<{ [p: string]: any } | null> = ref(null);

export const anim_points: Ref<{ pos: number, val: any } []> = ref([{pos: 0, val: null}, {pos: 1, val: null}]);

export const start_config = computed({
    get() {
        return anim_points.value[0].val;
    },
    set(v) {
        anim_points.value[0].val = v;
    }
})

export const end_config = computed({
    get() {
        return anim_points.value[anim_points.value.length - 1].val;
    },
    set(v) {
        anim_points.value[anim_points.value.length - 1].val = v;
    }
})

export async function toggle_playing_morphing() {
    if (!start_config.value || !end_config.value) return;

    if (!editor_models.color_segments_count_match([start_config.value, end_config.value])) {
        // @ts-ignore
        window.alert("Color segments counts don't match");
        return;
    }

    playing_morphing.value = !playing_morphing.value;

    if (!playing_morphing.value) return;

    editor_models.set_config(start_config.value);
    const morphing_started_at = new Date().getTime();
    const morphing_finishing_at = morphing_started_at + duration.value * 1000;
    const dt = 1000 / fps.value;

    let last_render_time = morphing_started_at;
    let n_curr_anim_segment = 0;

    while (true) {
        if (last_render_time + dt > new Date().getTime())
            await sleep(last_render_time + dt - new Date().getTime());

        const point_a = anim_points.value[n_curr_anim_segment];
        const point_b = anim_points.value[n_curr_anim_segment + 1];

        const now = new Date().getTime();
        const morphing_percent = (now - morphing_started_at) / (morphing_finishing_at - morphing_started_at);
        if (morphing_percent >= 1) {
            playing_morphing.value = false;
            break;
        }
        const morphing_percent_rescaled = (morphing_percent - point_a.pos) / (point_b.pos - point_a.pos)

        do_morphing_increment(morphing_percent_rescaled, point_a.val, point_b.val);

        if (morphing_percent >= point_b.pos)
            n_curr_anim_segment++;

        last_render_time = new Date().getTime();
    }
}

export function do_morphing_increment(morphing_percent: number, config_a: { [p: string]: any }, config_b: { [p: string]: any }): boolean {
    morphing_percent = Math.min(morphing_percent, 1);

    editor_models.set_config_lerp(config_a, config_b, morphing_percent);

    return morphing_percent < 1;
}

export async function render_sequence(output_video: boolean, filename: string, image_resolution: number, only_return_blob = false): Promise<Blob> {
    {
        const do_morphing = enable_morphing.value && !anim_points.value.some(p => !p.val);

        if (do_morphing && !editor_models.color_segments_count_match(anim_points.value.map(p => p.val))) {
            // @ts-ignore
            alert("Color segments counts don't match");
            return;

        }
        const do_rotation = camera_speed.value !== 0;
        const bak_rot_speed = camera_speed.value;

        if (do_rotation) {
            camera_speed.value = 0;
            spiral_view.camera.alpha = spiral_view.defaults.alpha;
        }

        let morphing_percent = 0;
        const morphing_percent_step = 1 / (duration.value * fps.value);
        const dt = 1 / fps.value;
        let n_curr_anim_segment = 0;

        const inc_func = v => {
            if (do_rotation)
                //rot_speed is rad/sec
                v.camera.alpha -= bak_rot_speed * dt;

            const point_a = anim_points.value[n_curr_anim_segment];
            const point_b = anim_points.value[n_curr_anim_segment + 1];

            if (do_morphing) {
                const morphing_percent_rescaled = (morphing_percent - point_a.pos) / (point_b.pos - point_a.pos)
                do_morphing_increment(morphing_percent_rescaled, point_a.val, point_b.val);
            }

            morphing_percent += morphing_percent_step;

            if (morphing_percent >= 1)
                return false;

            if (morphing_percent >= point_b.pos)
                n_curr_anim_segment++;

            return true;
        };

        let blob: Blob;

        if (do_morphing)
            editor_models.set_config(start_config.value);

        if (output_video) {
            blob = await spiral_view.render_mp4(inc_func, fps.value);
            if (!only_return_blob)
                await spiral_view.download_file(blob, `${filename}_render.mp4`);
        } else
            await spiral_view.download_image_sequence(inc_func, image_resolution, `${filename}_`);

        if (do_rotation)
            camera_speed.value = bak_rot_speed;

        return blob;
    }
}
