<template>
  <div class="flex" :class="{ 'justify-end': isMe }">

    <!-- <div v-if="!isMe" class="avatar">
      {{ message.username.charAt(0).toUpperCase()  }}
    </div> -->

    <div>
      <div v-if="!isMe" class="body-small pl-3 text-outline">{{ message.username }}</div>
      <div class="body-medium message" :class="isMe ? 'me' : 'recepient'">
        {{ message.text }}
      </div>  
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isMe: boolean,
  message: ChatMessage
}>();
</script>

<style lang="scss" scoped>
.message {
  @apply w-min whitespace-nowrap px-3 py-2 rounded-full;
}

.me {
  @apply bg-primary text-on-primary;
}

.recepient {
  @apply bg-surface-container-high text-on-surface-text;
}

// .avatar {
//   @apply flex justify-center items-center rounded-full w-10 h-10 mr-3;
//   @extend .recepient;
// }
</style>