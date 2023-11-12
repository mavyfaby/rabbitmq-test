<template>
  <div class="h-screen">
    <div class="w-full h-full flex justify-center items-center" v-if="isLoading">
      <md-circular-progress indeterminate />
      <span class="ml-2 font-medium">Connecting...</span>
    </div>

    <div class="flex flex-col w-full h-full relative" v-else>
      <div class="py-5">Room - <strong>{{ route.params.topic }}</strong></div>


      <div class="flex-grow" v-if="messages.length === 0">
        <div class="body-medium text-center text-outline">No messages yet</div>
      </div>

      <div v-else class="flex flex-col justify-end gap-2 p-2 overflow-y-scroll w-full flex-grow">
        <ComposableMessage
          v-for="(message, i) in messages"
          :key="i"
          :is-me="message.username === client.getUsername()"
          :message="message"
        />
      </div>

      <div class="flex items-center py-5">
        <md-filled-text-field placeholder="Send a message" v-model.trim="input" @keydown.enter="send" class="w-full" />
        <md-filled-button class="ml-2" @click="send" :disabled="input.length === 0">
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

import MQTT from "@utils/mqtt";
import Paho from "paho-mqtt";
import ComposableMessage from "@composables/ComposableMessage.vue";

const route = useRoute();
const isLoading = ref(true);
const isConnected = ref(false);
const messages = ref([] as ChatMessage[]);
const input = ref("");

const topic = route.params.topic as string;
let client: MQTT;

onMounted(() => {
  // Initialize client
  client = new MQTT({
    host: "localhost",
    port: 15675,
    username: localStorage.getItem("username") || "anonymous"
  });

  // Add connection lost listener
  client.onConnectionLost((error: Paho.MQTTError) => {
    console.log("Connection lost", error);
    isConnected.value = false;
  });

  // Add message delivered listener
  client.onMessageDelivered((message: Paho.Message) => {
    console.log("Message Sent!");
    
    // Add message to list
    messages.value.push({
      username: client.getUsername(),
      text: message.payloadString,
      createdAt: new Date(),
    });

    // Clear input
    input.value = "";
  });

  // Add message arrived listener
  client.onMessageArrived((username: string, message: Paho.Message) => {
    messages.value.push({
      text: message.payloadString,
      username: username,
      createdAt: new Date(),
    });
  });

  // Connect to server
  connect();  
});

/**
 * Connects to the RabbitMQ server
 */
function connect() {
  client.connect((error?: Paho.MQTTError) => {
    isLoading.value = false;

    if (error) {
      console.log("Connection failed", error);
      return;
    }
    
    console.log("Connected to RabbitMQ server!");

    // Subscribe to topic
    client.subscribe(topic, {
      onSuccess() {
        console.log(`Subscribed to topic [${route.params.topic}]`);
        isConnected.value = true;
      },
      onFailure(error: Paho.MQTTError) {
        console.log("Failed to subscribe to topic", error);
      }
    });
  });
}

/**
 * Sends a message to the topic
 */
function send() {
  // If the client is not initialized or not connected
  if (!client) {
    alert("Client not initialized! Please refresh the page!");
    return;
  }

  try {
    // Try Send message
    client.send(topic, input.value);
  } catch (error) {
    // If error, log it
    console.log("Error sending message", error);
    // Reconnect to server
    console.log("Reconnecting...");
    // Connect to server
    connect();
  }
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

