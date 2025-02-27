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

  <div v-if="contractResult">

    <DashboardCard class="h-card">
      <template v-slot:title>
        <span v-if="topLevel"  class="h-is-primary-title">
          Contract Result for {{ contractResult?.contract_id }} at {{ contractResult?.timestamp }}
        </span>
        <span v-else class="h-is-secondary-title">Contract Result</span>
      </template>

      <template v-slot:leftContent>
        <Property id="result">
          <template v-slot:name>Result</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.result"/>
          </template>
        </Property>
        <Property id="evm-hash">
          <template v-slot:name>EVM Transaction Hash</template>
          <template v-slot:value>
              <HexaValue v-bind:byteString="contractResult?.hash" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="from">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.from" :id="fromId ?? undefined" :compact="isSmallScreen && !isMediumScreen"/>
          </template>
        </Property>
        <Property id="to">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.to ?? undefined" :id="toId ?? undefined" :compact="isSmallScreen && !isMediumScreen"/>
          </template>
        </Property>

        <FunctionInput :analyzer="analyzer"/>
        <FunctionResult :analyzer="analyzer"/>
        <FunctionError :analyzer="analyzer"/>
      </template>

      <template v-slot:rightContent>
        <Property id="type">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="contractType"/>
          </template>
        </Property>
        <Property id="gasLimit">
          <template v-slot:name>Gas Limit</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_limit" none-label="None"/>
          </template>
        </Property>
        <Property id="gasUsed">
          <template v-slot:name>Gas Used</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_used" none-label="None"/>
          </template>
        </Property>
        <Property id="maxFeePerGas">
          <template v-slot:name>Max Fee Per Gas</template>
          <template v-slot:value>
            <PlainAmount :amount="maxFeePerGas" none-label="None"/>
          </template>
        </Property>
        <Property id="maxPriorityFeePerGas">
          <template v-slot:name>Max Priority Fee Per Gas</template>
          <template v-slot:value>
            <PlainAmount :amount="maxPriorityFeePerGas" none-label="None"/>
          </template>
        </Property>
        <Property id="gasPrice">
          <template v-slot:name>Gas Price</template>
          <template v-slot:value>
            <HbarAmount :amount="gasPrice" :timestamp="contractResult?.timestamp" :show-extra="true"/>
          </template>
        </Property>
        <Property id="ethereumNonce">
          <template v-slot:name>Ethereum Nonce</template>
          <template v-slot:value>
            <PlainAmount :amount="ethereumNonce" none-label="None"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <ContractResultTrace v-if="isParent" :transaction-id-or-hash="contractResult?.hash ?? undefined" :analyzer="analyzer"/>

    <ContractResultStates :state-changes="contractResult?.state_changes" :time-stamp="contractResult?.timestamp"/>

    <ContractResultLogs :logs="contractResult?.logs" :block-number="blockNumber" :transaction-hash="transactionHash"/>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import ContractResultTrace from "@/components/contract/ContractResultTrace.vue";
import ContractResultStates from "@/components/contract/ContractResultStates.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractResultLogs from "@/components/contract/ContractResultLogs.vue";
import {ContractResultAnalyzer} from "@/utils/analyzer/ContractResultAnalyzer";
import FunctionInput from "@/components/values/FunctionInput.vue";
import FunctionResult from "@/components/values/FunctionResult.vue";
import FunctionError from "@/components/values/FunctionError.vue";
import HexaValue from "@/components/values/HexaValue.vue";

export default defineComponent({

  name: 'ContractResult',

  components: {
    HexaValue,
    FunctionError,
    FunctionResult,
    FunctionInput,
    ContractResultLogs,
    EVMAddress,
    ContractResultStates,
    ContractResultTrace,
    PlainAmount,
    Property,
    HbarAmount,
    DashboardCard,
    StringValue
  },

  props: {
    timestamp: {
        type: String,
    },
    topLevel: {
      type: Boolean,
      default: false
    },
    isParent: {
      type: Boolean,
      default: false
    },
    blockNumber: {
      type:  Number
    },
    transactionHash: {
      type: String
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const contractResultAnalyzer = new ContractResultAnalyzer(computed(() => props.timestamp ?? null))
    onMounted(() => contractResultAnalyzer.mount())
    onBeforeUnmount(() => contractResultAnalyzer.unmount())


    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      fromId: contractResultAnalyzer.fromId,
      toId: contractResultAnalyzer.toId,
      gasPrice: contractResultAnalyzer.gasPrice,
      maxFeePerGas: contractResultAnalyzer.maxFeePerGas,
      maxPriorityFeePerGas: contractResultAnalyzer.maxPriorityFeePerGas,
      contractResult: contractResultAnalyzer.contractResult,
      errorMessage: contractResultAnalyzer.errorMessage,
      analyzer: contractResultAnalyzer.functionCallAnalyzer,
      functionHash: contractResultAnalyzer.functionCallAnalyzer.functionHash,
      signature: contractResultAnalyzer.functionCallAnalyzer.signature,
      contractType: contractResultAnalyzer.contractType,
      ethereumNonce: contractResultAnalyzer.ethereumNonce,
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>