<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { NInputNumber } from 'naive-ui';

const props = withDefaults(
  defineProps<{
    min?: number;
    modelValue: number;
    precision?: number;
  }>(),
  {
    min: 0,
    precision: 2,
  },
);

const emit = defineEmits<{
  change: [value: number];
}>();

const editing = ref(false);
const draft = ref<null | number>(null);
const inputRef = ref<InstanceType<typeof NInputNumber>>();

function startEdit() {
  draft.value = props.modelValue;
  editing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function commit() {
  if (!editing.value) return;
  editing.value = false;
  const value = draft.value ?? props.modelValue;
  if (value !== props.modelValue) {
    emit('change', value);
  }
}

function cancel() {
  editing.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    commit();
  } else if (event.key === 'Escape') {
    cancel();
  }
}
</script>

<template>
  <span
    v-if="!editing"
    class="block w-full cursor-pointer select-none px-2 py-1"
    title="双击编辑"
    @dblclick="startEdit"
  >
    {{ modelValue }}
  </span>
  <NInputNumber
    v-else
    ref="inputRef"
    v-model:value="draft"
    :min="min"
    :precision="precision"
    class="w-full"
    size="small"
    @blur="commit"
    @keydown="onKeydown"
  />
</template>
