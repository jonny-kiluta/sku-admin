import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      affixTab: true,
      icon: 'lucide:table-2',
      keepAlive: true,
      order: 1,
      title: $t('sku.title'),
    },
    name: 'SkuPriceList',
    path: '/sku',
    component: () => import('#/views/sku/list.vue'),
  },
];

export default routes;
