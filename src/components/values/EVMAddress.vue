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
  <div v-if="evmAddress">
    <div :class="{'is-flex': isSmallScreen, 'h-is-text-size-3': !hasCustomFont, 'is-family-monospace': !hasCustomFont}"
         class="is-inline-block" style="line-height: 20px">
      <Copyable :content-to-copy="evmAddress ?? ''" :enable-copy="enableCopy">
        <template v-slot:content>
          <span class="has-text-grey">{{ nonSignificantPart }}</span>
          <span>{{ significantPart }}</span>
        </template>
      </Copyable>
      <span v-if="entityId && showId">
        <span class="ml-1">(</span>
        <router-link v-if="entityLinkType === CONTRACT"
                     :to="{name: 'ContractDetails', params: {contractId: entityId}}">{{ entityId }}</router-link>
        <router-link v-else-if="entityLinkType === ACCOUNT"
                     :to="{name: 'AccountDetails', params: {accountId: entityId}}">{{ entityId }}</router-link>
        <router-link v-else-if="entityLinkType === TOKEN"
                     :to="{name: 'TokenDetails', params: {tokenId: entityId}}">{{ entityId }}</router-link>
        <span v-else>{{ entityId }}</span>
        <span>)</span>
      </span>
    </div>
    <div v-if="showType" class="h-is-extra-text h-is-text-size-2">{{ entityType }}</div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else-if="showNone" class="has-text-grey">None</div>
  <div v-else></div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, PropType, ref, watch} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {EthereumAddress} from "@/utils/EthereumAddress";
import Copyable from "@/components/Copyable.vue";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";

export enum ExtendedEntityType { UNDEFINED, ACCOUNT, CONTRACT, TOKEN }

export default defineComponent({
  name: "EVMAddress",
  components: {Copyable},
  props: {
    address: {
      type: String as PropType<string|null>,
      default: null
    },
    id: {
      type: String as PropType<string|null>,
      default: null
    },
    entityType: {
      type: String as PropType<string|null>,
      default: null
    },
    showId: {
      type: Boolean,
      default: true
    },
    showType: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    },
    bytesKept: {
      type: Number,
      default: 6
    },
    hasCustomFont: {
      type: Boolean,
      default: false
    },
    enableCopy: {
      type: Boolean,
      default: true
    },
    showNone: {
      type: Boolean,
      default: true
    },
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))
    const isSmallScreen = inject('isSmallScreen', ref(false))

    const entityLinkType = ref<ExtendedEntityType>(ExtendedEntityType.UNDEFINED)
    const evmAddress = ref<string|null>(null)
    const entityId = ref<string|null>(null)
    const ethereumAddress = computed( () => EthereumAddress.parse(evmAddress.value ?? ''))
    const derivedEntityId = computed( () => ethereumAddress.value?.toEntityID()?.toString() ?? null)

    onMounted(() => updateIdAndAddress())
    watch([() => props.address, () => props.id, () => props.entityType], () => updateIdAndAddress())

    const updateIdAndAddress = async () => {
      entityLinkType.value = ExtendedEntityType.UNDEFINED
      evmAddress.value = props.address ?? null
      entityId.value = props.id ?? derivedEntityId.value

      if (props.entityType === "ACCOUNT") {
        if (ethereumAddress.value?.isLongZeroForm() || entityId.value === null) {
          await updateFromAccount()
        }
      } else if (props.entityType === "CONTRACT") {
        if (! await updateFromSystemContract()) {
          if (! await updateFromContract()) {
            entityLinkType.value = ExtendedEntityType.TOKEN
          }
        }
      } else { // props.entityType undefined
        if (!await updateFromSystemContract()) {
          if (!await updateFromContract()) {
            if (!await updateFromAccount()) {
              entityLinkType.value = ExtendedEntityType.TOKEN
            }
          }
        }
      }
    }

    const updateFromSystemContract = async (): Promise<boolean> => {
      const systemContract = systemContractRegistry.lookup(derivedEntityId.value ?? "")
      if (systemContract !== null) {
        entityId.value = systemContract.description
      }
      return Promise.resolve(systemContract !== null)
    }

    const updateFromAccount = async (): Promise<boolean> => {
      const account = await AccountByAddressCache.instance.lookup(props.address ?? "")
      if (account !== null) {
        entityLinkType.value = ExtendedEntityType.ACCOUNT
        evmAddress.value = account.evm_address
        entityId.value = account.account
      }
      return Promise.resolve(account !== null)
    }

    const updateFromContract = async (): Promise<boolean> => {
      const contract = await ContractByAddressCache.instance.lookup(props.address ?? "")
      if (contract !== null) {
        entityLinkType.value = ExtendedEntityType.CONTRACT
        evmAddress.value = contract.evm_address
        entityId.value = contract.contract_id
      }
      return Promise.resolve(contract !== null)
    }

    const displayAddress = computed(
        () => props.compact
            ? ethereumAddress.value?.toCompactString(props.bytesKept)  ?? ""
            : ethereumAddress.value?.toString() ?? "")

    const nonSignificantSize = computed(() => {
      let i: number
      for (i = 0; i < displayAddress.value.length; i++) {
        const c = displayAddress.value[i]
        if (c !== '0' && c !== 'x' && c !== '…') {
          break
        }
      }
      return i
    })

    const nonSignificantPart = computed(
        () => displayAddress.value?.slice(0, nonSignificantSize.value))

    const significantPart = computed(
        () => displayAddress.value?.slice(nonSignificantSize.value))

    const copyToClipboard = (): void => {
      if (evmAddress.value) {
        navigator.clipboard.writeText(evmAddress.value.toString())
      }
    }

    return {
      isSmallScreen,
      ACCOUNT: ExtendedEntityType.ACCOUNT,
      CONTRACT: ExtendedEntityType.CONTRACT,
      TOKEN: ExtendedEntityType.TOKEN,
      entityLinkType,
      initialLoading,
      nonSignificantPart,
      significantPart,
      entityId,
      evmAddress,
      copyToClipboard
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
