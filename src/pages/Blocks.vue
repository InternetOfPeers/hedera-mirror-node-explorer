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

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Blocks</span>
      </template>
      <template v-slot:control>
        <PlayPauseButton v-bind:controller="blockTableController"/>
      </template>
      <template v-slot:content>
        <BlockTable :controller="blockTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import BlockTable from "@/components/block/BlockTable.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {BlockTableController} from "@/components/block/BlockTableController";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Blocks',

  props: {
    network: String
  },

  components: {
    PlayPauseButton,
    BlockTable,
    Footer,
    DashboardCard
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    // BlockTableController
    const pageSize = computed(() => isMediumScreen ? 15 : 5)
    const blockTableController = new BlockTableController(useRouter(), pageSize)
    onMounted(() => blockTableController.mount())
    onBeforeUnmount(() => blockTableController.unmount())

    return {
      isSmallScreen,
      isTouchDevice,
      blockTableController
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>