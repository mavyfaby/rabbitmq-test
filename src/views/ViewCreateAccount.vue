<template>
  <div class="flex items-center justify-center h-screen">
    <div class="space-y-5 w-[300px]">
      <h3 class="title-large">Create Account</h3>
      <md-filled-text-field class="w-full" @keydown.enter="next" v-model="username" label="Your Username" />
      <md-filled-text-field class="w-full" @keydown.enter="next" v-model="topic" label="Select a Topic" />
      <md-filled-button class="w-full" :disabled="topic.length === 0 || username.length === 0" @click="next">Create</md-filled-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import "@material/web/textfield/filled-text-field";
import "@material/web/button/filled-button";

import { ref } from "vue";
import router from "@/router";

const topic = ref("");
const username = ref("");

function next() {
  if (topic.value.length > 0 && username.value.length > 0) {
    // Save username to localstorage
    localStorage.setItem("username", username.value);
    // Navigate to message view
    router.push({
      name: "Message",
      params: {
        topic: topic.value,
      },
    });

    return;
  }

  alert("Please fill in all fields");
}
</script>

<style scoped>

</style>
