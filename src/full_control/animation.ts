import {computed, Ref, ref} from "vue";
import {editor_models} from "./EditorsVM";
import {sleep} from "../common/help_funcs";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {easing} from "../common/easing";
import SpiralViewBase from "../base/SpiralViewBase";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

const spiral_view = SpiralViewFullControl_instance;

export const camera_speed = ref(0);
export const fps = ref(30);
export const duration = ref(5);
export const playing_time = ref(0);
export const enable_morphing = ref(true);
export const playing_morphing = ref(false);

export const anim_points: Ref<{ pos: number, val: any, easing?: string, direct_morphing?: boolean } []> = ref([{pos: 0, val: null}, {pos: 1, val: null}]);

export const current_anim_point_num = ref(0);

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

export async function toggle_playing_morphing(n_start_point: number = 0, n_end_point: number = 0) {
    if (anim_points.value.some(p => !p.val)) return;

    if (!editor_models.segments_count_match()) {
        // @ts-ignore
        window.alert("Segments counts don't match");
        return;
    }
    if (n_start_point === n_end_point) n_start_point = n_end_point = 0;

    playing_morphing.value = !playing_morphing.value;
    n_end_point ||= anim_points.value.length - 1;
    n_end_point = Math.min(n_end_point, anim_points.value.length - 1);

    if (!playing_morphing.value) return;

    const start_point = anim_points.value[n_start_point];
    const end_point = anim_points.value[n_end_point];

    editor_models.set_config(start_point.val);
    const morphing_started_at = new Date().getTime();
    const morphing_finishing_at = morphing_started_at + duration.value * (end_point.pos - start_point.pos) * 1000;
    const dt = 1000 / fps.value;

    let last_render_time = morphing_started_at;
    let n_curr_anim_segment = n_start_point;

    const base_points: Array<Array<Vector3>> = [];
    let points_buffer: Array<Vector3>;

    if (anim_points.value.some(p => p.direct_morphing)) {
        for (const anim_point of anim_points.value) {
            editor_models.set_config(anim_point.val, null, false);
            base_points.push([...spiral_view.active_spiral.spiralPoints]);
        }
        points_buffer = Array(base_points[0].length);
        for (let i = 0; i < points_buffer.length; i++) points_buffer[i] = new Vector3();
    }

    while (true) {
        if (last_render_time + dt > new Date().getTime())
            await sleep(last_render_time + dt - new Date().getTime());


        const point_a = anim_points.value[n_curr_anim_segment];
        const point_b = anim_points.value[n_curr_anim_segment + 1];

        const now = new Date().getTime();

        playing_time.value = (now - morphing_started_at) / 1000;

        const morphing_percent = start_point.pos + (now - morphing_started_at) / (morphing_finishing_at - morphing_started_at) * (end_point.pos - start_point.pos);
        if (morphing_percent >= end_point.pos) {
            playing_morphing.value = false;
            break;
        }
        const morphing_percent_rescaled = (morphing_percent - point_a.pos) / (point_b.pos - point_a.pos)

        do_morphing_increment(morphing_percent_rescaled, point_a.val, point_b.val, point_a.easing, point_a.direct_morphing);

        if (point_a.direct_morphing) {
            const easing_func = easing[point_a.easing ?? 'linear'];
            const morphing_percent_rescaled_w_easing = easing_func(morphing_percent_rescaled);

            for (let i = 0; i < base_points[n_curr_anim_segment].length; i++) {
                points_buffer[i].setAll(0);
                base_points[n_curr_anim_segment][i].scaleAndAddToRef(1 - morphing_percent_rescaled_w_easing, points_buffer[i]);
                base_points[n_curr_anim_segment + 1][i].scaleAndAddToRef(morphing_percent_rescaled_w_easing, points_buffer[i]);
            }

            spiral_view.update_spiral_geometry(points_buffer);
        }


        if (morphing_percent >= point_b.pos)
            n_curr_anim_segment++;

        last_render_time = new Date().getTime();
    }
}

export function do_morphing_increment(morphing_percent_rescaled: number, config_a: { [p: string]: any }, config_b: { [p: string]: any }, easing_type: string, direct_morphing: boolean): boolean {
    morphing_percent_rescaled = Math.min(morphing_percent_rescaled, 1);

    const easing_func = easing[easing_type ?? 'linear'];
    const morphing_percent_rescaled_w_easing = easing_func(morphing_percent_rescaled);

    editor_models.set_config_lerp(config_a, config_b, morphing_percent_rescaled, morphing_percent_rescaled_w_easing, direct_morphing);

    return morphing_percent_rescaled < 1;
}

export async function render_sequence(output_video: boolean, filename: string, image_resolution: number, only_return_blob = false): Promise<Blob> {
    {
        const do_morphing = enable_morphing.value && !anim_points.value.some(p => !p.val);

        if (do_morphing && !editor_models.segments_count_match()) {
            // @ts-ignore
            alert("Segments counts don't match");
            return;

        }
        const do_rotation = camera_speed.value !== 0;
        const bak_rot_speed = camera_speed.value;

        const base_points: Array<Array<Vector3>> = [];
        let points_buffer: Array<Vector3>;

        if (anim_points.value.some(p => p.direct_morphing)) {
            for (const anim_point of anim_points.value) {
                editor_models.set_config(anim_point.val, null, false);
                base_points.push([...spiral_view.active_spiral.spiralPoints]);
            }
            points_buffer = Array(base_points[0].length);
            for (let i = 0; i < points_buffer.length; i++) points_buffer[i] = new Vector3();
        }

        if (do_rotation) {
            camera_speed.value = 0;
            spiral_view.camera.alpha = spiral_view.defaults.alpha;
        }

        let morphing_percent = 0;
        const morphing_percent_step = 1 / (duration.value * fps.value);
        const dt = 1 / fps.value;
        let n_curr_anim_segment = 0;

        const inc_func = (v: SpiralViewBase) => {
            //rot_speed is rad/sec
            // if (do_rotation) v.camera.alpha -= bak_rot_speed * dt;

            const point_a = anim_points.value[n_curr_anim_segment];
            const point_b = anim_points.value[n_curr_anim_segment + 1];

            if (do_morphing) {
                const morphing_percent_rescaled = (morphing_percent - point_a.pos) / (point_b.pos - point_a.pos)
                do_morphing_increment(morphing_percent_rescaled, point_a.val, point_b.val, point_a.easing, point_a.direct_morphing);

                if (point_a.direct_morphing) {
                    const easing_func = easing[point_a.easing ?? 'linear'];
                    const morphing_percent_rescaled_w_easing = easing_func(morphing_percent_rescaled);

                    for (let i = 0; i < base_points[n_curr_anim_segment].length; i++) {
                        points_buffer[i].setAll(0);
                        base_points[n_curr_anim_segment][i].scaleAndAddToRef(1 - morphing_percent_rescaled_w_easing, points_buffer[i]);
                        base_points[n_curr_anim_segment + 1][i].scaleAndAddToRef(morphing_percent_rescaled_w_easing, points_buffer[i]);
                    }

                    spiral_view.update_spiral_geometry(points_buffer);
                }
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
