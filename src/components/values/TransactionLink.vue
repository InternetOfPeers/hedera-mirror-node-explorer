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

  <div v-if="formattedId && routeToTransaction">
    <router-link :to="routeToTransaction">
      <span class="is-numeric should-wrap">{{ formattedId }}</span>
    </router-link>
  </div>

  <span v-else-if="showNone" class="has-text-grey">None</span>

  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import {TransactionID} from "@/utils/TransactionID";
import {routeManager} from "@/router";
import {Transaction} from "@/schemas/HederaSchemas";
import {PathParam} from "@/utils/PathParam";
import {Timestamp} from "@/utils/Timestamp";
import {TransactionHash} from "@/utils/TransactionHash";
import {TransactionByHashCache} from "@/utils/cache/TransactionByHashCache";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";

export default defineComponent({
  name: "TransactionLink",

  props: {
    transactionLoc: String as PropType<string|undefined>,
    showNone: {
      type: Boolean,
      default: true
    },
  },

  setup(props) {

    const normalizedId = ref<string|null>(null)
    const updateNormalizedId = () => {
      if (props.transactionLoc) {
        const tloc = PathParam.parseTransactionLoc(props.transactionLoc)
        if (tloc instanceof Timestamp) {
          TransactionByTsCache.instance.lookup(props.transactionLoc)
              .then((t: Transaction|null) => {
                normalizedId.value = t?.transaction_id ?? null
              })
              .catch(() => {
                normalizedId.value = null
              })
        } else if (tloc instanceof TransactionHash) {
          TransactionByHashCache.instance.lookup(props.transactionLoc)
              .then((t: Transaction|null) => {
                normalizedId.value = t?.transaction_id ?? null
              })
              .catch(() => {
                normalizedId.value = null
              })
        } else {
          normalizedId.value = null
        }
      } else {
        normalizedId.value = null
      }
    }
    watch(computed(() => props.transactionLoc), () => updateNormalizedId())
    onMounted(() => updateNormalizedId())

    const formattedId = computed(() => {
      return normalizedId.value !== null ? TransactionID.normalize(normalizedId.value) : null
    })

    const routeToTransaction = computed(() => {
      return props.transactionLoc ? routeManager.makeRouteToTransaction(props.transactionLoc) : null
    })

    return { formattedId, routeToTransaction }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

