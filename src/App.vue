<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<template>

  <section class="section is-top-section" :class="{'is-medium-screen': isMediumScreen}">
    <TopNavBar/>
  </section>

  <hr v-if="!onMainDashboardPage" class="h-has-background-color" style="margin: 0; height: 4px"/>

  <router-view/>

  <CookiesDialog v-model:show-dialog="showCookiesDialog"
                 @onChooseReject="handleChooseRejectCookies"
                 @onChooseAccept="handleChooseAcceptCookies">
  </CookiesDialog>

</template>

<script lang="ts">

import {computed, defineComponent, onBeforeMount, onBeforeUnmount, onMounted, provide, ref, watch} from 'vue';
import TopNavBar from "@/components/TopNavBar.vue";
import {errorKey, explanationKey, initialLoadingKey, loadingKey, suggestionKey} from "@/AppKeys"
import {AxiosMonitor} from "@/utils/AxiosMonitor"
import {useRoute} from "vue-router";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import CookiesDialog from "@/components/CookiesDialog.vue";
import {AppStorage} from "@/AppStorage";

export const XLARGE_BREAKPOINT = 1450
export const LARGE_BREAKPOINT = 1280
export const MEDIUM_BREAKPOINT = 1080
export const SMALL_BREAKPOINT = 768
export const FINAL_BREAKPOINT = 640

export const ORUGA_MOBILE_BREAKPOINT = "1080px"

export default defineComponent({
  name: 'App',
  components: {CookiesDialog, TopNavBar},

  setup() {
    const route = useRoute()
    const onMainDashboardPage = computed( () => { return route.name == "MainDashboard" })

    const buildRelease = import.meta.env.VITE_BUILD_RELEASE ?? "not available"
    provide('buildRelease', buildRelease)

    const buildShortCommitHash = import.meta.env.VITE_BUILD_SHORTCOMMITHASH ?? "not available"
    provide('buildShortCommitHash', buildShortCommitHash)

    const buildTime = import.meta.env.VITE_BUILD_TIME_UTC ?? "not available"
    provide('buildTime', buildTime)

    const isTouchDevice = ('ontouchstart' in window)
    provide('isTouchDevice', isTouchDevice)

    const windowWidth = ref(window.screen.width)
    provide('windowWidth', windowWidth)

    const isSmallScreen = computed(() => {
      return windowWidth.value > SMALL_BREAKPOINT
    })
    provide('isSmallScreen', isSmallScreen)

    const isMediumScreen = computed(() => {
      return windowWidth.value >= MEDIUM_BREAKPOINT
    })
    provide('isMediumScreen', isMediumScreen)

    const isLargeScreen = computed(() => {
      return windowWidth.value >= LARGE_BREAKPOINT
    })
    provide('isLargeScreen', isLargeScreen)

    const  onResizeHandler = () => {
      windowWidth.value = window.innerWidth
    }

    const showCookiesDialog = ref(false)

    const acceptCookies = ref<boolean|null>(null)
    watch(acceptCookies, (value) => {
      if (value != null && value) {
        insertGoogleTag(import.meta.env.VITE_APP_GOOGLE_TAG_ID)
      }
    })

    provide(loadingKey,         AxiosMonitor.instance.loading)
    provide(initialLoadingKey,  AxiosMonitor.instance.initialLoading)
    provide(errorKey,           AxiosMonitor.instance.error)
    provide(explanationKey,     AxiosMonitor.instance.explanation)
    provide(suggestionKey,      AxiosMonitor.instance.suggestion)

    onBeforeMount(() => {
      const tagId = import.meta.env.VITE_APP_GOOGLE_TAG_ID
      if (tagId != undefined && tagId.length > 0) {
        acceptCookies.value = AppStorage.getAcceptCookiePolicy()
        showCookiesDialog.value = (acceptCookies.value == null)
      } else {
        acceptCookies.value = null
        showCookiesDialog.value = false
      }
      networkRegistry.readCustomConfig()
    })

    onMounted(() => {
      windowWidth.value = window.innerWidth
      window.addEventListener('resize', onResizeHandler);
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResizeHandler);
    })

    const handleChooseRejectCookies = () => {
      acceptCookies.value = false
      AppStorage.setAcceptCookiePolicy(false)
    }

    const handleChooseAcceptCookies = () => {
      acceptCookies.value = true
      AppStorage.setAcceptCookiePolicy(true)
    }

    return {
      isMediumScreen,
      onMainDashboardPage,
      showCookiesDialog,
      handleChooseRejectCookies,
      handleChooseAcceptCookies,
    }
  },
});

function insertGoogleTag(tagId: string) {
  const src1 = `https://www.googletagmanager.com/gtag/js?id=${tagId}`
  let s1 = document.createElement( 'script' );
  s1.setAttribute( 'async', '' );
  s1.setAttribute( 'src', src1 );
  document.head.appendChild( s1 );

  const src2 = `window.dataLayer = window.dataLayer || [];
    function gtag() {dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${import.meta.env.VITE_APP_GOOGLE_TAG_ID}');`
  let s2 = document.createElement( 'script' );
  s2.innerHTML = src2;
  document.head.appendChild( s2 );
}

</script>

<style scoped>

section.section.is-top-section {
  padding-top: 0;
  padding-bottom: 0;
  background-image: url("assets/block-chain-bg.png");
  background-repeat: no-repeat;
  background-size: 104px
}
section.section.is-top-section.is-medium-screen {
  padding-bottom: 30px;
  background-size: 112px
}

</style>
