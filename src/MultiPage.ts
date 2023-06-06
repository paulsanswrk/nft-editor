import {SpiralViewTop8} from "./top_8_rot/SpiralViewTop8";
import {SpiralViewBot6} from "./bot_6_rot/SpiralViewBot6";

const url = new URL(location.href);

console.log('type: ', url.searchParams.get('type'));
switch (url.searchParams.get('type')) {
    case 'top_8':
        new SpiralViewTop8().init();
        break;
    case 'bot_6':
        new SpiralViewBot6().init();
        break;
    default:
        new SpiralViewBot6().init();

}