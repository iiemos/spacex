<script setup>
import { ref, onMounted } from "vue";
import { useStorage } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { useI18n } from "vue-i18n";
import { RouterLink, RouterView } from "vue-router";
import IconLogo from "./icons/IconLogo.vue";
import IconEarth from "./icons/IconEarth.vue";
const { locale } = useI18n();
const isActive = ref(false);
const langArr = ref([
  {
    text: 'English',
    key: 'en'
  },
  {
    text: '日本語',
    key: 'ja'
  },
  {
    text: '한국인',
    key: 'ko'
  },
  {
    text: 'Français',
    key: 'fr'
  },
  {
    text: '简体中文',
    key: 'zh-cn'
  },
])

onMounted(() => {
})
const invites = useRouteQuery('invs')
console.log('invites',invites.value);
// if(!invites.value) 
// if(invites.value){
//   useStorage('invites', invites)
// }else{
//   useStorage('invites', '0xDA02d522d8cd60de0a2F9773f80b16Fc9ED99bdd')
// }
const navToggle = () => {
  isActive.value = !isActive.value;
};
const changeLang = (val) => {
  locale.value = val
  localStorage.setItem('language', val)
};
</script>
<template>
  <div class="header">
    <div id="overlay" :class="{ overlayShow: isActive }"></div>
    <div
      id="mobile-menu"
      class="mobile-main-menu"
      :class="{ showMenu: isActive }"
    >
      <ul>
        <li class="mobile-only">
          <RouterLink :to="`/?invs=${invites}`">{{ $t("home") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`liquidity?invs=${invites}`">{{ $t("liquidity") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`income?invs=${invites}`">{{ $t("income") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`team?invs=${invites}`">{{ $t("team") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`burn?invs=${invites}`">{{ $t("burn") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`ecology?invs=${invites}`">{{ $t("Ecology") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`introduction?invs=${invites}`">{{ $t("Introduction") }}</RouterLink>
        </li>
        <li class="mobile-only">
          <RouterLink :to="`/?invs=${invites}`">{{ $t("whitePaper") }}</RouterLink>
        </li>
      </ul>
    </div>
    <header class="main-header">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <IconEarth style="z-index: 999; width: 24px; height: 24px;"/>
        </span>
        
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="litem in langArr" :key="litem.key" @click="changeLang(litem.key)">{{ litem.text }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="logo">
        <RouterLink :to="`/?invs=${invites}`">
          <IconLogo />
        </RouterLink>
      </div>
      <nav class="desktop-main-menu">
        <ul>
          <li>
            <RouterLink :to="`/?invs=${invites}`">{{ $t("home") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`income?invs=${invites}`">{{ $t("income") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`liquidity?invs=${invites}`">{{ $t("liquidity") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`team?invs=${invites}`">{{ $t("team") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`burn?invs=${invites}`">{{ $t("burn") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`ecology?invs=${invites}`">{{ $t("Ecology") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`introduction?invs=${invites}`">{{ $t("Introduction") }}</RouterLink>
          </li>
          <li>
            <RouterLink :to="`/?invs=${invites}`">{{ $t("whitePaper") }}</RouterLink>
          </li>
        </ul>
      </nav>

    </header>
    <!-- Hamburger Menu -->
    <button
      id="menu-btn"
      class="hamburger"
      :class="{ open: isActive }"
      type="button"
      @click="navToggle"
    >
      <span class="hamburger-top"></span>
      <span class="hamburger-middle"></span>
      <span class="hamburger-bottom"></span>
    </button>

  </div>
</template>

<style></style>
