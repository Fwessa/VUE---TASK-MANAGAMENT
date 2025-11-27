<script setup>
import Header from "./components/body/Header.vue";
import Footer from "./components/body/Footer.vue";
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

