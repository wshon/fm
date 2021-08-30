<template>
  <div>
  </div>
</template>

<script>

import router from "@/router";

export default {
  name: 'Home',
  beforeCreate() {
    router.push({path: `/files`});
  },
}
</script>
