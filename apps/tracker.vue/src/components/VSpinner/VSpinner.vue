<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: '1em',
  },

  thickness: {
    type: Number,
    default: 5,
  },
})
</script>

<template>
  <svg
    class="v-spinner"
    fill="currentColor"
    :width="size"
    :height="size"
    viewBox="25 25 50 50"
    xmlns="http://www.w3.org/2000/svg"
    role="presentation"
  >
    <circle
      class="path"
      cx="50"
      cy="50"
      r="20"
      fill="none"
      stroke="currentColor"
      :stroke-width="thickness"
      stroke-miterlimit="10"
    />
  </svg>
</template>

<style>
.v-spinner {
  vertical-align: middle;

  transform-origin: center center;

  animation: v-spin 2s linear infinite;
}

.v-spinner .path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;

  animation: v-mat-dash 1.5s ease-in-out infinite;
}

@keyframes v-spin {
  0% {
    transform: rotate3d(0, 0, 1, 0);
  }

  25% {
    transform: rotate3d(0, 0, 1, 90deg);
  }

  50% {
    transform: rotate3d(0, 0, 1, 180deg);
  }

  75% {
    transform: rotate3d(0, 0, 1, 270deg);
  }

  100% {
    transform: rotate3d(0, 0, 1, 359deg);
  }
}

@keyframes v-mat-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }

  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
</style>
