import Vue from 'vue';
import App from '../game-layout/16_9-6p.vue';
import {create} from "../../browser-util/state";

create().then(() => {
    new Vue ({
        el: '#App',
        render: h => h(App),
    })
})
