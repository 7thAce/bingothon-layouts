import Vue from 'vue';
import VueRouter from 'vue-router';
import { create, getReplicant } from "../../browser-util/state";
import * as Layouts from "./layout-list";
import { AllGameLayouts, CurrentGameLayout } from '../../../schemas';

Vue.use(VueRouter);

const routes = [
  {name: "2p 15:9 Layout", path: "/2p-15_9-layout", component: Layouts.Layout_15x9_2p},
  {name: "4p 4:3 Layout", path: "/4p-4_3-layout", component: Layouts.Layout_4x3_4p},
  {name: "4p 4:3 co-op Layout", path: "/4p-4_3-co-op-layout", component: Layouts.Layout_4x3_4p_CoOp},
  {name: "3p 4:3 Layout", path: "/3p-4_3-layout", component: Layouts.Layout_4x3_3p},
  {name: "2p 4:3 Layout", path: "/2p-4_3-layout", component: Layouts.Layout_4x3_2p},
  {name: "1p 4:3 Layout", path: "/1p-4_3-layout", component: Layouts.Layout_4x3_1p},
  {name: "4p 16:9 Layout", path: "/4p-16_9-layout", component: Layouts.Layout_16x9_4p},
  {name: "3p 16:9 Layout", path: "/3p-16_9-layout", component: Layouts.Layout_16x9_3p},
  {name: "2p 16:9 Layout", path: "/2p-16_9-layout", component: Layouts.Layout_16x9_2p},
  {name: "1p 16:9 Layout", path: "/1p-16_9-layout", component: Layouts.Layout_16x9_1p},
  {path: "*", redirect: "/4p-4_3-layout"},
];

// put all of the game layouts in the replicant
const allGameLayouts = routes.map(r => { return {name: r.name || "", path: r.path || ""}}).filter(r => !!r.name);
getReplicant<AllGameLayouts>('allGameLayouts').value = allGameLayouts;

const router = new VueRouter({
  routes,
});

// if the replicant changes, update the game layouts route
getReplicant<CurrentGameLayout>('currentGameLayout').on('change',newVal => {
  console.log('switching to',newVal);
  router.push({name: newVal.name});
});

create().then(()=> {
  new Vue({
    router,
  }).$mount('#app');
});
