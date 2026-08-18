<script lang="ts" setup>
import { computed, ref } from 'vue';

import { NImage, NModal } from 'naive-ui';

const props = defineProps<{
  images: string[];
}>();

const currentIndex = ref(0);
const previewVisible = ref(false);
let clickTimer: null | ReturnType<typeof setTimeout> = null;

const currentImage = computed(
  () => props.images[currentIndex.value % props.images.length],
);

const currentIndexText = computed(() => currentIndex.value + 1);

function cancelClickTimer() {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
}

/**
 * 单击切换下一张图片；双击时取消切换并打开预览
 */
function onImageClick() {
  cancelClickTimer();
  clickTimer = setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length;
    clickTimer = null;
  }, 220);
}

function onImageDblClick() {
  cancelClickTimer();
  previewVisible.value = true;
}
</script>

<template>
  <div class="relative inline-block">
    <NImage
      :height="52"
      :src="currentImage"
      :width="52"
      class="cursor-pointer rounded"
      object-fit="cover"
      preview-disabled
      @click="onImageClick"
      @dblclick="onImageDblClick"
    />
    <span
      class="absolute right-0 top-0 rounded-bl bg-black/60 px-1 text-[10px] leading-4 text-white"
    >
      {{ currentIndexText }}/{{ images.length }}
    </span>

    <NModal v-model:show="previewVisible">
      <div
        class="w-fit rounded-lg bg-white p-4 shadow-xl"
        style="max-width: 80vw"
      >
        <NImage
          :src="currentImage"
          class="max-h-[75vh]"
          object-fit="contain"
          preview-disabled
        />
        <div class="mt-2 text-center text-sm text-gray-500">
          {{ currentIndexText }} / {{ images.length }}
        </div>
      </div>
    </NModal>
  </div>
</template>
