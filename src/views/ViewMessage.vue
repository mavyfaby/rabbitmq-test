<template>
  <div class="h-screen">
    <div class="w-full h-full flex justify-center items-center" v-if="isLoading">
      <md-circular-progress indeterminate />
      <span class="ml-2 font-medium">Connecting...</span>
    </div>

    <div class="flex flex-col w-full h-full relative" v-else>
      <div class="py-5">Topic: {{ route.params.topic }}</div>


      <div class="flex-grow" v-if="messages.length === 0">
        <div class="body-medium text-center text-outline">No messages yet</div>
      </div>

      <div v-else class="flex flex-col justify-end gap-2 p-2 overflow-y-scroll w-full flex-grow">
        <ComposableMessage v-for="message in messages" :key="message.id" :is-me="message.username === 'me'" :message="message" />
      </div>

      <div class="flex items-center py-5">
        <md-filled-text-field placeholder="Send a message" v-model.trim="message" @keydown.enter="send" class="w-full" />
        <md-filled-button class="ml-2" @click="send" :disabled="message.length === 0">Send</md-filled-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import "@material/web/progress/circular-progress"
import "@material/web/textfield/filled-text-field"
import "@material/web/button/filled-button"

import Paho from "paho-mqtt";
import ComposableMessage from "@composables/ComposableMessage.vue";

const route = useRoute();
const isLoading = ref(true);
const messages = ref([] as ChatMessage[]);
const message = ref("");
let username = "";

let client: Paho.Client;

onMounted(() => {
  const { topic } = route.params;
  username = localStorage.getItem("username") || "anonymous";

  client = new Paho.Client("localhost", 15675, "/ws", username);

  client.onConnectionLost = (error: Paho.MQTTError) => {
    console.log("Connection lost", error);
  }; 

  client.onMessageArrived = (message: Paho.Message) => {
    console.log("Message arrived", message);

    const [topic, user] = message.destinationName.split("/");

    if (user !== username) {
      messages.value.push({
        id: message.destinationName,
        username: user,
        text: message.payloadString,
        createdAt: new Date(),
      });
    }
  };

  client.onMessageDelivered = (message: Paho.Message) => {
    console.log("Message Sent!");
  };

  console.info("Connecting...");

  client.connect({
    onSuccess: () => {
      console.log("Connected");
      isLoading.value = false;

      client.subscribe(`${topic}/#`, {
        onSuccess: () => {
          console.log(`Subscribed to ${topic}!`);
        },
        onFailure: (error: Paho.MQTTError) => {
          console.log("Subscription failed", error);
        },
      });
      
    },
    onFailure: (error: Paho.MQTTError) => {
      console.log("Connection failed", error);
      isLoading.value = false;
    },
  });

});

function send() {
  if (!client) {
    alert("Not connected");
  }

  client.send(`${route.params.topic}/${username}`, message.value);

  messages.value.push({
    id: "9",
    username: "me",
    text: message.value,
    createdAt: new Date(),
  });

  message.value = "";
}
</script>

<style scoped>

</style>
