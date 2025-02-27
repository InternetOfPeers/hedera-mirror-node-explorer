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

  <template v-if="compact">
    <HbarTransferGraphC
        v-if="netAmount > 0"
        data-cy="hbarTransfers"
        v-bind:transaction="transaction"/>
  </template>
  <HbarTransferGraphF
      v-else
      data-cy="hbarTransfers"
      title="Hbar Transfers"
      v-bind:class="{'mb-4': displayRewardTransfers || displayNftTransfers || displayTokenTransfers}" v-bind:transaction="transaction"/>

  <NftTransferGraph
      data-cy="nftTransfers"
      v-bind:class="{'mb-4': !compact && (displayTokenTransfers || displayRewardTransfers)}"
      v-bind:transaction="transaction"
      v-bind:compact="compact"/>

  <TokenTransferGraphC
      v-if="compact"
      data-cy="tokenTransfers"
      v-bind:transaction="transaction"/>
  <TokenTransferGraphF
      v-else
      data-cy="tokenTransfers"
      v-bind:class="{'mb-4': displayRewardTransfers}"
      v-bind:transaction="transaction"/>

  <RewardTransferGraph
      v-if="!compact"
      data-cy="rewardTransfers"
      v-bind:transaction="transaction"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {TransactionDetail} from "@/schemas/HederaSchemas";
import HbarTransferGraphC from "@/components/transfer_graphs/HbarTransferGraphC.vue";
import HbarTransferGraphF from "@/components/transfer_graphs/HbarTransferGraphF.vue";
import NftTransferGraph from "@/components/transfer_graphs/NftTransferGraph.vue";
import TokenTransferGraphC from "@/components/transfer_graphs/TokenTransferGraphC.vue";
import TokenTransferGraphF from "@/components/transfer_graphs/TokenTransferGraphF.vue";
import {computeNetAmount} from "@/utils/TransactionTools";
import RewardTransferGraph from "@/components/transfer_graphs/RewardTransferGraph.vue";

export default defineComponent({
  name: "TransferGraphSection",
  components: {
    RewardTransferGraph,
    NftTransferGraph,
    TokenTransferGraphC,
    TokenTransferGraphF,
    HbarTransferGraphC,
    HbarTransferGraphF,
  },
  props: {
    transaction: Object as PropType<TransactionDetail>,
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {

    const netAmount = computed(() => {
      return props.transaction ? computeNetAmount(props.transaction.transfers, props.transaction.charged_tx_fee) : 0
    })

    const displayRewardTransfers = computed(() => props.transaction?.staking_reward_transfers && props.transaction?.staking_reward_transfers.length >= 1)
    const displayNftTransfers = computed(() => props.transaction?.nft_transfers && props.transaction?.nft_transfers.length >= 1)
    const displayTokenTransfers = computed(() => props.transaction?.token_transfers && props.transaction?.token_transfers.length >= 1)

    return {
      netAmount,
      displayRewardTransfers,
      displayNftTransfers,
      displayTokenTransfers
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
