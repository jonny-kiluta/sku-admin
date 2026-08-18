<script lang="ts" setup>
import type { VxeTableGridColumns } from '#/adapter/vxe-table';

import { computed, onBeforeUnmount, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { GripVertical, Settings } from '@vben/icons';

import {
  NButton,
  NCheckbox,
  NPopover,
  NProgress,
  NSpin,
  useMessage,
} from 'naive-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import EditableNumber from './editable-number.vue';
import GalleryImage from './gallery-image.vue';

interface SkuRow {
  [key: string]: any;
  changed: Record<string, boolean>;
  counterPrice: number;
  floorPrice: number;
  height: number;
  id: number;
  images: string[];
  length: number;
  mainImage: string;
  profit: number;
  profitRate: number;
  quotePrice: number;
  secondQuote: number;
  sizeImage: string;
  sku: string;
  title: string;
  width: number;
}

interface ColumnSetting {
  field: string;
  label: string;
  visible: boolean;
  width: number;
}

const EDITABLE_FIELDS = new Set(['height', 'length', 'secondQuote', 'width']);

const IMAGE_FILES = [
  '四姑娘山双桥沟1.jpg',
  '来了茂县一定不要错过的免费景观五星✨_3_Kerwin_来自小红书网页版.jpg',
  '来了茂县一定不要错过的免费景观五星✨_8_Kerwin_来自小红书网页版.jpg',
  '毕棚沟拍照1.jpg',
].map((file) => encodeURI(`/images/${file}`));

const PRODUCT_TITLES = [
  '户外防水冲锋衣',
  '轻量登山背包',
  '便携露营帐篷',
  '保暖抓绒外套',
  '速干运动T恤',
  '防滑徒步登山鞋',
  '多功能运动水壶',
  '折叠露营椅',
  '高亮头灯手电',
  '户外野餐垫',
];

const DEFAULT_COLUMN_SETTINGS: Omit<ColumnSetting, 'visible'>[] = [
  { field: 'sku', label: 'SKU', width: 130 },
  { field: 'title', label: '标题', width: 200 },
  { field: 'mainImage', label: '主图', width: 96 },
  { field: 'sizeImage', label: '尺寸图', width: 96 },
  { field: 'images', label: '商品图', width: 110 },
  { field: 'quotePrice', label: '报价', width: 110 },
  { field: 'counterPrice', label: '还价', width: 110 },
  { field: 'floorPrice', label: '底价', width: 110 },
  { field: 'profit', label: '利润', width: 110 },
  { field: 'profitRate', label: '利润率', width: 110 },
  { field: 'secondQuote', label: '二次报价', width: 120 },
  { field: 'length', label: '长', width: 100 },
  { field: 'width', label: '宽', width: 100 },
  { field: 'height', label: '高', width: 100 },
];

const message = useMessage();

const columnSettings = ref<ColumnSetting[]>(
  DEFAULT_COLUMN_SETTINGS.map((item) => ({ ...item, visible: true })),
);
const tableData = ref<SkuRow[]>(createMockData(100));

const pushing = ref(false);
const pushProgress = ref(0);
let pushTimer: null | ReturnType<typeof setInterval> = null;

const dragIndex = ref<null | number>(null);
const dragOverIndex = ref<null | number>(null);

const changedCellClassName = ({
  row,
  column,
}: {
  column: { field: string };
  row: SkuRow;
}) => (row.changed?.[column.field] ? 'sku-cell-changed' : '');

const columns = computed<VxeTableGridColumns<SkuRow>>(() => {
  const result: VxeTableGridColumns<SkuRow> = [
    { title: '选中', type: 'checkbox', width: 60, fixed: 'left' },
  ];

  for (const setting of columnSettings.value) {
    if (!setting.visible) continue;

    const { field, label, width } = setting;
    const base = {
      cellClassName: changedCellClassName,
      field,
      title: label,
    };

    if (field === 'sku' || field === 'title') {
      result.push({
        ...base,
        minWidth: width,
        showOverflow: true,
        sortable: true,
      });
    } else if (field === 'mainImage' || field === 'sizeImage') {
      result.push({
        ...base,
        cellRender: {
          name: 'CellImage',
          props: { height: 52, objectFit: 'cover', width: 52 },
        },
        width,
      });
    } else if (field === 'images') {
      result.push({
        ...base,
        slots: { default: 'gallery' },
        width,
      });
    } else if (EDITABLE_FIELDS.has(field)) {
      result.push({
        ...base,
        slots: { default: 'editable' },
        sortable: true,
        width,
      });
    } else {
      result.push({
        ...base,
        formatter:
          field === 'profitRate'
            ? ({ cellValue }: { cellValue: number }) => `${cellValue}%`
            : undefined,
        sortable: true,
        width,
      });
    }
  }

  return result;
});

const gridOptions = computed(() => ({
  checkboxConfig: {
    highlight: true,
  },
  columns: columns.value,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    pageSize: 20,
  },
  rowConfig: {
    keyField: 'id',
  },
}));

const [Grid, gridApi] = useVbenVxeGrid<SkuRow>({
  gridOptions: gridOptions.value,
});

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function randomBetween(min: number, max: number) {
  return round2(Math.random() * (max - min) + min);
}

function imageAt(index: number): string {
  return IMAGE_FILES[index % IMAGE_FILES.length] as string;
}

function pickImages(index: number): string[] {
  const count = 2 + (index % 3);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(imageAt(index + i * 2));
  }
  return result;
}

function createMockData(count: number): SkuRow[] {
  const rows: SkuRow[] = [];
  for (let i = 0; i < count; i++) {
    const floorPrice = randomBetween(30, 300);
    const quotePrice = randomBetween(floorPrice * 1.5, floorPrice * 2.5);
    const counterPrice = randomBetween(floorPrice * 1.15, floorPrice * 1.6);
    const secondQuote = randomBetween(floorPrice * 1.05, floorPrice * 1.4);
    const profit = round2(secondQuote - floorPrice);
    const profitRate = Math.round((profit / floorPrice) * 1000) / 10;

    rows.push({
      id: i + 1,
      sku: `SKU-${String(1000 + i)}`,
      title: `${PRODUCT_TITLES[i % PRODUCT_TITLES.length]} ${i + 1}`,
      mainImage: imageAt(i),
      sizeImage: imageAt(i + 1),
      images: pickImages(i),
      quotePrice,
      counterPrice,
      floorPrice,
      profit,
      profitRate,
      secondQuote,
      length: randomInt(50, 200),
      width: randomInt(30, 150),
      height: randomInt(10, 100),
      changed: {},
    });
  }
  return rows;
}

function markChanged(row: SkuRow, field: string) {
  row.changed = { ...row.changed, [field]: true };
}

function getSelectedRows(): SkuRow[] {
  return gridApi.grid.getCheckboxRecords() as SkuRow[];
}

function onCellEdit(row: SkuRow, field: string, value: number) {
  row[field] = value;
  markChanged(row, field);
}

function getEditableValue(row: SkuRow, field?: string): number {
  return field ? ((row[field] as number) ?? 0) : 0;
}

function onEditableChange(
  row: SkuRow,
  field: string | undefined,
  value: number,
) {
  if (field) {
    onCellEdit(row, field, value);
  }
}

/**
 * 改参：随机修改选中行的 长/宽/高
 */
function randomizeParams() {
  if (pushing.value) return;
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先勾选需要修改的行');
    return;
  }
  for (const row of rows) {
    row.length = randomInt(50, 200);
    row.width = randomInt(30, 150);
    row.height = randomInt(10, 100);
    markChanged(row, 'length');
    markChanged(row, 'width');
    markChanged(row, 'height');
  }
  message.success(`已随机修改 ${rows.length} 行的长/宽/高`);
}

/**
 * 改价：随机修改选中行的二次报价，前端限制不能低于底价
 */
function randomizePrice() {
  if (pushing.value) return;
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先勾选需要修改的行');
    return;
  }
  for (const row of rows) {
    const floorPrice = row.floorPrice;
    // 在底价之上随机浮动 0 ~ 25%，并做兜底限制
    const nextPrice = Math.max(
      floorPrice,
      round2(floorPrice * (1 + Math.random() * 0.25)),
    );
    row.secondQuote = nextPrice;
    markChanged(row, 'secondQuote');
  }
  message.success(`已随机修改 ${rows.length} 行的二次报价`);
}

/**
 * 保存：取消所有勾选并清除标黄提示
 */
async function save() {
  if (pushing.value) return;
  await gridApi.grid.clearCheckboxRow();
  for (const row of tableData.value) {
    row.changed = {};
  }
  message.success('保存成功');
}

/**
 * 提交：展示 5 秒 loading 页面并显示进度
 */
function submit() {
  if (pushing.value) return;
  pushing.value = true;
  pushProgress.value = 0;
  pushTimer = setInterval(() => {
    pushProgress.value = Math.min(100, pushProgress.value + 2);
    if (pushProgress.value >= 100) {
      if (pushTimer) {
        clearInterval(pushTimer);
        pushTimer = null;
      }
      pushing.value = false;
      message.success('提交成功');
    }
  }, 100);
}

function toggleColumn(field: string, visible: boolean) {
  const item = columnSettings.value.find((setting) => setting.field === field);
  if (item) {
    item.visible = visible;
  }
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  dragOverIndex.value = index;
}

function onDrop(index: number) {
  const from = dragIndex.value;
  dragIndex.value = null;
  dragOverIndex.value = null;
  if (from === null || from === index) return;
  const settings = [...columnSettings.value];
  const [moved] = settings.splice(from, 1);
  if (!moved) return;
  settings.splice(index, 0, moved);
  columnSettings.value = settings;
}

function onDragEnd() {
  dragIndex.value = null;
  dragOverIndex.value = null;
}

onBeforeUnmount(() => {
  if (pushTimer) {
    clearInterval(pushTimer);
    pushTimer = null;
  }
});
</script>

<template>
  <Page auto-content-height title="核价SKU">
    <Grid
      :grid-options="gridOptions"
      :table-data="tableData"
      table-title="核价SKU"
    >
      <template #toolbar-tools>
        <NPopover
          display-directive="show"
          placement="bottom-end"
          trigger="click"
        >
          <template #trigger>
            <NButton class="mr-2" quaternary>
              <template #icon>
                <Settings class="size-4" />
              </template>
              设置
            </NButton>
          </template>
          <div class="w-60">
            <div class="mb-2 text-sm font-medium">列设置</div>
            <div class="space-y-1">
              <div
                v-for="(item, index) in columnSettings"
                :key="item.field"
                :data-field="item.field"
                class="bg-accent flex items-center gap-1 rounded-md pl-1"
                :class="[dragOverIndex === index ? 'ring-2 ring-blue-300' : '']"
                draggable="true"
                @dragend="onDragEnd"
                @dragover="onDragOver(index, $event)"
                @dragstart="onDragStart(index, $event)"
                @drop="onDrop(index)"
              >
                <GripVertical
                  class="drag-handle size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                />
                <NCheckbox
                  :checked="item.visible"
                  class="min-w-0 flex-1"
                  @update:checked="(v: boolean) => toggleColumn(item.field, v)"
                >
                  {{ item.label }}
                </NCheckbox>
              </div>
            </div>
          </div>
        </NPopover>
        <NButton class="mr-2" :disabled="pushing" @click="randomizeParams">
          改参
        </NButton>
        <NButton class="mr-2" :disabled="pushing" @click="randomizePrice">
          改价
        </NButton>
        <NButton class="mr-2" :disabled="pushing" @click="save"> 保存 </NButton>
        <NButton type="primary" :disabled="pushing" @click="submit">
          提交
        </NButton>
      </template>

      <template #gallery="{ row }">
        <GalleryImage :images="row.images" />
      </template>

      <template #editable="{ row, column }">
        <EditableNumber
          :min="column.field === 'secondQuote' ? row.floorPrice : 1"
          :model-value="getEditableValue(row, column.field)"
          :precision="column.field === 'secondQuote' ? 2 : 0"
          @change="
            (value: number) => onEditableChange(row, column.field, value)
          "
        />
      </template>
    </Grid>

    <div
      v-if="pushing"
      class="fixed inset-0 flex items-center justify-center"
      style="z-index: 9999; background: rgb(0 0 0 / 45%)"
    >
      <div class="w-80 rounded-lg bg-white p-6 shadow-xl">
        <div class="flex items-center justify-center gap-2">
          <NSpin size="small" />
          <span class="text-base font-medium">正在提交，请稍候...</span>
        </div>
        <NProgress
          class="mt-4"
          :percentage="pushProgress"
          color="#1677ff"
          type="line"
        />
        <div class="mt-2 text-center text-sm text-gray-500">
          {{ pushProgress }}%
        </div>
      </div>
    </div>
  </Page>
</template>

<style>
.sku-cell-changed {
  background-color: #fde68a !important;
}
</style>
