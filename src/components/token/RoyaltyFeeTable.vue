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

  <o-table
      :data="fees"
      :hoverable="false"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      :narrowed="true"
      :striped="false"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
  >

    <o-table-column v-slot="props" field="amount" label="Percentage Fee">
      <StringValue :string-value="makeAmount(props.row.amount)"/>
    </o-table-column>

    <o-table-column v-slot="props" field="collector" label="Collector Account">
      <AccountLink :account-id="props.row.collector_account_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="fallbackAmount" label="Fallback Fee">
      <PlainAmount v-if="props.row.fallback_fee?.denominating_token_id"
                   :amount="props.row.fallback_fee?.amount" none-label="None"/>
      <HbarAmount v-else :amount="props.row.fallback_fee?.amount" :show-extra="true"/>
    </o-table-column>

    <o-table-column v-slot="props" field="fallbackToken" label="Fee Currency">
      <TokenLink v-if="props.row.fallback_fee?.denominating_token_id"
                 :token-id="props.row.fallback_fee?.denominating_token_id" :show-extra="true"/>
      <div v-else-if="props.row.fallback_fee?.amount">HBAR</div>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import AccountLink from "@/components/values/AccountLink.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import {FractionAmount} from "@/schemas/HederaSchemas";
import StringValue from "@/components/values/StringValue.vue";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import TokenLink from "@/components/values/TokenLink.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";

export default defineComponent({

  name: 'RoyaltyFeeTable',

  components: {
    HbarAmount,
    TokenLink,
    StringValue,
    PlainAmount,
    AccountLink,
  },

  props: {
    analyzer: {
      type: Object as PropType<TokenInfoAnalyzer>,
      required: true
    }
  },

  setup(props) {
    const makeAmount = (fraction: FractionAmount): string => {
      let result: string
      const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 2
      })
      if (fraction.numerator && fraction.denominator) {
        result = formatter.format(fraction.denominator ? fraction.numerator / fraction.denominator : 0)
      } else {
        result = ""
      }
      return result
    }

    return {
      fees: props.analyzer.royaltyFees,
      makeAmount,
      ORUGA_MOBILE_BREAKPOINT
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
