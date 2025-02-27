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
      :data="contracts"
      :loading="loading"
      paginated
      backend-pagination
      :total="total"
      v-model:current-page="currentPage"
      :per-page="perPage"
      @page-change="onPageChange"
      @cell-click="handleClick"

      :hoverable="true"
      :narrowed="narrowed"
      :striped="true"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
      customRowKey="contract_id"
  >
    <o-table-column field="contract_id" label="Contract" v-slot="props">
      <div class="is-numeric">
        {{ props.row.contract_id }}
      </div>
    </o-table-column>

    <o-table-column v-slot="props" field="created" label="Created">
      <TimestampValue v-bind:timestamp="props.row.created_timestamp"/>
    </o-table-column>

    <o-table-column field="memo" label="Memo" v-slot="props">
      <div class="should-wrap">
        <BlobValue v-bind:blob-value="props.row.memo" v-bind:base64="true" v-bind:show-none="true"/>
      </div>
    </o-table-column>

  </o-table>

  <EmptyTable v-if="!contracts.length"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {ComputedRef, defineComponent, inject, PropType, Ref} from 'vue';
import {Contract} from "@/schemas/HederaSchemas";
import {routeManager} from "@/router";
import BlobValue from "@/components/values/BlobValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import {ORUGA_MOBILE_BREAKPOINT} from '@/App.vue';
import EmptyTable from "@/components/EmptyTable.vue";
import {ContractTableController} from "@/components/contract/ContractTableController";


//
// defineComponent
//

export default defineComponent({
  name: 'ContractTable',

  components: {EmptyTable, BlobValue, TimestampValue},

  props: {
    controller: {
      type: Object as PropType<ContractTableController>,
      required: true
    },
    narrowed:{
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const handleClick = (contract: Contract, c: unknown, i: number, ci: number, event: MouseEvent) => {
      if (contract.contract_id) {
        routeManager.routeToContract(contract.contract_id, event.ctrlKey || event.metaKey)
      }
    }

    return {
      isTouchDevice,
      isMediumScreen,
      contracts: props.controller.rows as ComputedRef<Contract[]>,
      loading: props.controller.loading as ComputedRef<boolean>,
      total: props.controller.totalRowCount as ComputedRef<number>,
      currentPage: props.controller.currentPage as Ref<number>,
      onPageChange: props.controller.onPageChange,
      perPage: props.controller.pageSize as Ref<number>,
      handleClick,
      ORUGA_MOBILE_BREAKPOINT,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
