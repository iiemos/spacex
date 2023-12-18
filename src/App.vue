<script setup>
  import { onMounted, ref } from 'vue';
  import { RouterLink, RouterView } from 'vue-router'
  // import sampleAudio from '@/assets/media/bgm.c8c31aa7.mp3'; // 导入音频资源

  // const audio = ref(null);

  // const playAudio = () => {
  //   audio.value.play(); // 播放音频
  // }

  // onMounted(() => {
  //   audio.value = new Audio(sampleAudio); // 创建音频实例
  //   audio.value.addEventListener('ended', playAudio); // 监听播放完成事件
  //   playAudio(); // 开始音频播放
  // });
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
