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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Topics</span>
      </template>
      <template v-slot:content>
        <TopicTable v-bind:controller="transactionTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';
import TopicTable from "@/components/topic/TopicTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import {TransactionResult, TransactionType} from "@/schemas/HederaSchemas";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Topics',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    TopicTable
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)


    const router = useRouter()
    const pageSize = computed(() => isMediumScreen ? 15 : 5)
    const transactionTableController = new TransactionTableController(
        router, pageSize, TransactionType.CONSENSUSCREATETOPIC,  TransactionResult.SUCCESS)
    onMounted(() => transactionTableController.mount())
    onBeforeUnmount(() => transactionTableController.unmount())

    watch(() => props.network, () => {
      transactionTableController.reset()
    })

    return {
      transactionTableController,
      isSmallScreen,
      isTouchDevice,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>