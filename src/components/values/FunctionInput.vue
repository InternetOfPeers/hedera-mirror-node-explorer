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

  <div v-if="signature">

    <div class="h-is-tertiary-text my-2">Input</div>

    <Property :custom-nb-col-class="customNbColClass" id="function">
      <template v-slot:name>Signature</template>
        <template v-slot:value>
          <SignatureValue :analyzer="analyzer"/>
        </template>
    </Property>

    <template v-for="arg in inputs" :key="arg.name">
      <Property :custom-nb-col-class="customNbColClass">
        <template v-slot:name>{{ arg.name }}</template>
        <template v-slot:value>
          <FunctionValue :ntv="arg"/>
        </template>
      </Property>
    </template>

  </div>
  <template v-else>
    <Property :custom-nb-col-class="customNbColClass" id="functionInput">
      <template v-slot:name>Input - Function & Args</template>
      <template v-slot:value>
        <HexaValue :byte-string="input" :show-none="true"/>
        <div v-if="inputDecodingStatus" class="h-is-extra-text h-is-text-size-3">
            <span class="icon fas fa-exclamation-circle has-text-grey is-small mt-1 mr-1"/>
            <span>{{ inputDecodingStatus }}</span>
        </div>
      </template>
    </Property>
  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import Property from "@/components/Property.vue";
import FunctionValue from "@/components/values/FunctionValue.vue";
import SignatureValue from "@/components/values/SignatureValue.vue";

export default defineComponent({
  name: 'FunctionInput',
  components: {SignatureValue, FunctionValue, Property, HexaValue},
  props: {
    analyzer: {
      type: Object as PropType<FunctionCallAnalyzer>,
      required: true
    },
    customNbColClass: String
  },

  setup(props) {

    const initialLoading = inject(initialLoadingKey, ref(false))
    return {
      input: props.analyzer.normalizedInput,
      signature: props.analyzer.signature,
      functionHash: props.analyzer.functionHash,
      inputs: props.analyzer.inputs,
      inputDecodingStatus: props.analyzer.inputDecodingStatus,
      initialLoading
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>