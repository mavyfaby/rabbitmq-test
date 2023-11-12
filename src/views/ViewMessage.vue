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
        <md-filled-button class="ml-2" @click="send" :disabled="message.length === 0">
          {{ isConnected ? "Send" : "Reconnect" }}
        </md-filled-button>
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
const isConnected = ref(false);
const messages = ref([] as ChatMessage[]);
const message = ref("");
let username = "";

let client: Paho.Client;

onMounted(() => {
  // Get username from localstorage
  username = localStorage.getItem("username") || "anonymous";
  // Initialize client
  client = new Paho.Client("localhost", 15675, "/ws", username);

  // Set callbacks for connection lost
  client.onConnectionLost = (error: Paho.MQTTError) => {
    console.log("Connection lost", error);
    isConnected.value = false;
  }; 

  // Set callbacks for message arrived
  client.onMessageArrived = (message: Paho.Message) => {
    console.log("Message arrived", message);

    // Get username from clientId
    const [_, user] = message.destinationName.split("/");

    // If the message is not from me, add it to the messages array
    if (user !== username) {
      messages.value.push({
        id: message.destinationName,
        username: user,
        text: message.payloadString,
        createdAt: new Date(),
      });
    }
  };

  // Set callbacks for message delivered
  client.onMessageDelivered = (_: Paho.Message) => {
    console.log("Message Sent!");
  };

  // Connect to the topic
  connect(route.params.topic as string);
});

/**
 * Connects to a topic nameserver 
 * @param topic name of the topic to connect to
 */
function connect(topic: string) {
  console.info("Connecting...");

  // Connect to RabbitMQ Web MQTT server
  client.connect({
    onSuccess: () => {
      console.log("Connected");
      isLoading.value = false;
      isConnected.value = true;

      // Subscribe to the topic with the username as the clientId (topic/username)
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
}

/**
 * Sends a message to the topic
 */
function send() {
  // If the client is not initialized or not connected
  if (!client || !client.isConnected()) {
    // connect to the topic
    if (client) {
      connect(route.params.topic as string);
      return;
    }

    // If the client is not initialized, alert the user
    alert("Client not initialized!");
    return;
  }

  // Send the message to the topic
  client.send(`${route.params.topic}/${username}`, message.value);

  // Add the message to the messages array
  messages.value.push({
    id: "9",
    username: "me",
    text: message.value,
    createdAt: new Date(),
  });

  message.value = "";
}
</script>

<style lang="scss" scoped>
md-filled-text-field {
  --md-filled-text-field-container-shape: 9999px;
  --md-filled-field-active-indicator-height: 0px;
  --md-filled-field-hover-active-indicator-height: 0px;
  --md-filled-field-focus-active-indicator-height: 0px;
}
</style>

