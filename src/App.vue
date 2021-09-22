<script>
import { app } from "@electron/remote";
import { reactive, ref } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";

import { useOfflineFallback } from "./composables/useOfflineFallback";

export default {
  name: "App",
  setup() {
    const {
      createTempFolderIfNotPresent,
      addItemToTempData,
      grabJsonTempData,
    } = useOfflineFallback(app.getAppPath());

    const list = reactive([]);
    const online = reactive([]);

    onMounted(() => {
      createTempFolderIfNotPresent();
      list.push(...grabJsonTempData().inputs);
    });

    const input = ref("");

    function handleClick() {
      if (input.value) {
        const data = { input: input.value };

        if (!navigator.onLine) {
          addItemToTempData(data);
          list.push(data);
        } else {
          online.push(data);
        }

        input.value = "";
      }
    }

    return {
      input,
      handleClick,
      list,
      online,
    };
  },
};
</script>

<template>
  <h1>teste</h1>
  <h2>v0.1.0</h2>
  <div class="white">
    <p></p>
    <input type="text" v-model="input" />

    <button @click="handleClick">click</button>
    <p>offline</p>
    {{ list }}
    <p>online</p>
    {{ online }}
  </div>
</template>


<style>
.white {
  background: white;
  padding: 20px;
}

h2 {
  background-color: white;
}
</style>
