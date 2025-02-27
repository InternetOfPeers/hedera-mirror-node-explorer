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
  <div/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onMounted} from 'vue';
import router, {routeManager} from "@/router";
import {PathParam} from "@/utils/PathParam";
import {RouteLocationRaw} from "vue-router";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";

export default defineComponent({

  name: 'AddressDetails',

  components: {},

  props: {
    accountAddress: String,
    network: String
  },

  setup(props) {

    const getContractId = async (evmAddress: string): Promise<string|null> => {
      const contract = await ContractByAddressCache.instance.lookup(evmAddress)
      return Promise.resolve(contract?.contract_id ?? null)
    }

    const getAccountId = async (evmAddress: string): Promise<string|null> => {
      const account = await AccountByAddressCache.instance.lookup(evmAddress)
      return Promise.resolve(account?.account ?? null)
    }

    const selectRoute = async () => {
      let result: RouteLocationRaw

      const evmAddress = PathParam.parseEvmAddress(props.accountAddress)
      if (evmAddress !== null) {

        const contractId = await getContractId(evmAddress)
        if (contractId !== null) {
          result = routeManager.makeRouteToContract(contractId)
        } else {
          const accountId = await getAccountId(evmAddress)
          if (accountId !== null) {
            result = routeManager.makeRouteToAccount(accountId)
          } else {
            result = routeManager.makeRouteToAccount(evmAddress)
          }
        }

      } else {
        result = routeManager.makeRouteToPageNotFound()
      }

      return Promise.resolve(result)
    }

    onMounted(() => {
      selectRoute().then((route: RouteLocationRaw) => router.replace(route))
    })
  }
})

</script>

<style/>