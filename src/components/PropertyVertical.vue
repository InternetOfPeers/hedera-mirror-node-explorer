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

  <div v-if="isHorizontal" class="columns" :id="id">
    <div class="column is-flex is-justify-content-space-between is-align-items-center">
      <div class="has-text-weight-light" :id="nameId">
        <slot name="name"/>
      </div>
      <div :id="valueId" class="ml-4 has-text-right">
        <slot name="value"/>
      </div>
    </div>
  </div>

  <div v-else :id="id" style="display: flex; flex-direction: column; gap: 0.25rem;">
    <div :class="nbColClass" class="has-text-weight-light" :id="nameId">
      <slot name="name"/>
    </div>
    <div class="" :id="valueId">
      <slot name="value"/>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject} from "vue";

export default defineComponent({
  name: "PropertyVertical",
  props: {
    id: String,
    fullWidth: {
      type: Boolean,
      default: false
    },
    customNbColClass: String,
    isHorizontal: {
      type: Boolean,
      default: false,
    }
  },
  setup(props){
    const nameId = props.id + 'Name'
    const valueId = props.id + 'Value'

    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const nbColClass = computed(() => props.customNbColClass ?? (props.fullWidth ? 'is-2' : 'is-one-third'))

    return {
      nameId,
      valueId,
      isSmallScreen,
      isTouchDevice,
      nbColClass
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>
