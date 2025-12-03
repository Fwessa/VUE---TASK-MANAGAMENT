<script setup>
import Header from "./components/common/Header.vue";
import Footer from "./components/common/Footer.vue";
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="grid-layout">
    <!--HEADER  -->
    <Header />
    <!-- ROUTED MAIN CONTENT -->
    <main>
      <RouterView />
    </main>
    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<style lang="scss">
@use "@/assets/App/style.scss";
</style>

