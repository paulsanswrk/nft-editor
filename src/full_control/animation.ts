import {computed, Ref, ref} from "vue";
import {editor_models} from "./EditorsVM";
import {sleep} from "../common/help_funcs";
import {SpiralViewFullControl_instance} from "./SpiralViewFullControl";
import {easing} from "../common/easing";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {duration, fps} from "./AppVM";

const spiral_view = SpiralViewFullControl_instance;

export const camera_speed = ref(0);

export const playing_time = ref(0);
export const enable_morphing = ref(true);
export const playing_animation = ref(false);

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

let base_points: Array<Array<Vector3>> = [];
let points_buffer: Array<Vector3>;
let n_segment_by_frame: { [n: number]: number } = {};

export async function play_animation(n_start_point: number = 0, n_end_point: number = 0) {
    if (!editor_models.segments_count_match()) {
        // @ts-ignore
        window.alert("Segments counts don't match");
        return;
    }

    const ap = anim_points.value;

    if (n_start_point === n_end_point) n_start_point = n_end_point = 0;
    n_end_point ||= ap.length - 1;
    n_end_point = Math.min(n_end_point, ap.length - 1);

    playing_animation.value = true;

    prepare_buffers(n_start_point, n_end_point);

    const start_point = ap[n_start_point];
    const end_point = ap[n_end_point];

    const playback_started_at = new Date().getTime();
    const playback_finishing_at = playback_started_at + duration.value * (end_point.pos - start_point.pos) * 1000;

    const dt = 1000 / fps.value;
    let last_render_time = playback_started_at;

    const n_end_frame = Math.max(...Object.keys(n_segment_by_frame).map(n_frame => Number(n_frame)));

    while (true) {
        if (last_render_time + dt > new Date().getTime())
            await sleep(last_render_time + dt - new Date().getTime());

        const now = new Date().getTime();
        const render_pos = start_point.pos + (now - playback_started_at) / (playback_finishing_at - playback_started_at) * (end_point.pos - start_point.pos);
        let n_frame = duration.value * fps.value * render_pos;
        n_frame = Math.round(n_frame);

        playing_time.value = (now - playback_started_at) / 1000;

        if (n_frame > n_end_frame) {
            playing_animation.value = false;
            break;
        }

        gen_frame(n_frame);

        last_render_time = new Date().getTime();
    }
}

export function do_morphing_increment(render_pos_in_segment: number, config_a: { [p: string]: any }, config_b: { [p: string]: any }, easing_type: string, direct_morphing: boolean): boolean {
    render_pos_in_segment = Math.min(render_pos_in_segment, 1);

    const easing_func = easing[easing_type ?? 'linear'];
    const render_pos_in_segment_w_easing = easing_func(render_pos_in_segment);

    editor_models.set_config_lerp(config_a, config_b, render_pos_in_segment, render_pos_in_segment_w_easing, direct_morphing);

    return render_pos_in_segment < 1;
}

function gen_frame(n_frame: number) {

    const ap = anim_points.value;
    const render_pos = n_frame / (duration.value * fps.value);

    const n_curr_anim_segment = n_segment_by_frame[n_frame];

    if (n_curr_anim_segment === undefined) {
        console.log('n_curr_anim_segment === undefined', {n_frame, render_pos, n_segment_by_frame});
        return;
    }

    const segment_left = ap[n_curr_anim_segment];
    const segment_right = ap[n_curr_anim_segment + 1];

    const render_pos_in_segment = (render_pos - segment_left.pos) / (segment_right.pos - segment_left.pos);

    spiral_view.prevent_updating_geometry = true;
    do_morphing_increment(render_pos_in_segment, segment_left.val, segment_right.val, segment_left.easing, segment_left.direct_morphing);

    if (segment_left.direct_morphing) {
        const easing_func = easing[segment_left.easing ?? 'linear'];
        const morphing_percent_rescaled_w_easing = easing_func(render_pos_in_segment);

        for (let i = 0; i < base_points[n_curr_anim_segment].length; i++) {
            const point = points_buffer[i];
            point.setAll(0);
            base_points[n_curr_anim_segment][i].scaleAndAddToRef(1 - morphing_percent_rescaled_w_easing, point);
            base_points[n_curr_anim_segment + 1][i].scaleAndAddToRef(morphing_percent_rescaled_w_easing, point);
        }

        spiral_view.prevent_updating_geometry = false;
        spiral_view.update_spiral_geometry(points_buffer);
    }

}

function prepare_buffers(n_start_point: number, n_end_point: number) {
    const ap = anim_points.value;
    base_points = Array(ap.length);
    let points_buffer_len = 0;

    ap.forEach((anim_point, n) => {
        if ((anim_point.direct_morphing || (n > 0 && ap[n - 1].direct_morphing) || (n < ap.length - 1 && ap[n + 1].direct_morphing)) && n_start_point <= n && n <= n_end_point) {
            editor_models.set_config(anim_point.val, null, false);
            base_points[n] = [...spiral_view.active_spiral.spiralPoints];
            points_buffer_len = base_points[n].length;
        }
    })

    if (points_buffer_len) {
        points_buffer = Array(points_buffer_len);
        for (let i = 0; i < points_buffer_len; i++) points_buffer[i] = new Vector3();
    }

    n_segment_by_frame = {};
    let n_segment = 0;
    const dt = 1 / (duration.value * fps.value);

    function is_segment_included(n_segm: number): boolean {
        return n_start_point <= n_segm && n_segm < n_end_point;
    }

    for (let n_frame = 0; n_frame < duration.value * fps.value; n_frame++) {
        const pos = n_frame * dt;

        if (pos < ap[n_segment + 1].pos) { //inside current segment
            if (is_segment_included(n_segment))
                n_segment_by_frame[n_frame] = n_segment;
        } else { //will move to the next segment
            if (pos == ap[n_segment + 1].pos) { //frame starts exactly on a segment boundary
                if (is_segment_included(n_segment))
                    n_segment_by_frame[n_frame] = n_segment;
                else if (is_segment_included(n_segment + 1))
                    n_segment_by_frame[n_frame] = n_segment + 1;
            } else { //frame starts in the next segment
                if (is_segment_included(n_segment + 1))
                    n_segment_by_frame[n_frame] = n_segment + 1;
            }
            n_segment++;
        }
    }
}

export async function render_sequence(output_video: boolean, filename: string, image_resolution: number, only_return_blob = false,
                                      n_start_point: number = 0, n_end_point: number = 0): Promise<Blob> {
    {
        const ap = anim_points.value;

        if (n_start_point === n_end_point) n_start_point = n_end_point = 0;
        n_end_point ||= ap.length - 1;
        n_end_point = Math.min(n_end_point, ap.length - 1);

        if (!editor_models.segments_count_match()) {
            // @ts-ignore
            alert("Segments counts don't match");
            return;

        }
        const do_rotation = camera_speed.value !== 0;
        const bak_rot_speed = camera_speed.value;

        prepare_buffers(n_start_point, n_end_point);

        if (do_rotation) {
            camera_speed.value = 0;
            spiral_view.camera.alpha = spiral_view.defaults.alpha;
        }

        const frames = Object.entries(n_segment_by_frame).filter(p => n_start_point <= p[1] && p[1] < n_end_point).map(p => Number(p[0]));
        const n_start_frame = Math.min(...frames);
        const n_end_frame = Math.max(...frames);

        let blob: Blob;

        if (output_video) {
            blob = await spiral_view.render_mp4(gen_frame, n_start_frame, n_end_frame);
            if (!only_return_blob)
                await spiral_view.download_file(blob, `${filename}_render.mp4`);
        } else
            await spiral_view.download_image_sequence(gen_frame, image_resolution, n_start_frame, n_end_frame, `${filename}_`);

        if (do_rotation)
            camera_speed.value = bak_rot_speed;

        return blob;
    }
}

export function interpolate_alpha() {
    const a1 = anim_points.value[0].val?.alpha ?? 0, a2 = anim_points.value[anim_points.value.length - 1].val?.alpha ?? 0;

    for (const p of anim_points.value) {
        if (p.val)
            p.val.alpha = a1 + (a2 - a1) * p.pos;
    }
}
