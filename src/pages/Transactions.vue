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
        <span class="h-is-primary-title">Recent Transactions</span>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButton v-bind:controller="transactionTableController"/>
          <TransactionFilterSelect v-bind:controller="transactionTableController"/>
        </div>
      </template>
      <template v-slot:content>
        <TransactionTable v-bind:controller="transactionTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, Ref, ref} from 'vue';

import TransactionTable from "@/components/transaction/TransactionTable.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import {useRouter} from "vue-router";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";

export default defineComponent({
  name: 'Transactions',

  props: {
    network: String
  },

  components: {
    Footer,
    DashboardCard,
    TransactionFilterSelect,
    PlayPauseButton,
    TransactionTable,
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const router = useRouter()

    //
    // transactionTableController
    //

    const accountId: Ref<string|null> = ref(null)
    const pageSize = computed(() => 10)
    const transactionTableController = new TransactionTableControllerXL(router, accountId, pageSize, false)
    onMounted(() => transactionTableController.mount())
    onBeforeUnmount(() => transactionTableController.unmount())

    return {
      isSmallScreen,
      isTouchDevice,
      transactionTableController,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>