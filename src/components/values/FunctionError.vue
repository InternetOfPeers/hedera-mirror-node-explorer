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

    <template v-if="errorSignature">

        <div v-if="error">

            <div class="h-is-tertiary-text my-2">Error</div>

            <Property :custom-nb-col-class="customNbColClass" id="errorFunction">
                <template v-slot:name>Signature</template>
                <template v-slot:value>
                    <HexaValue :byte-string="errorHash" :show-none="true"/>
                    <div class="h-is-extra-text h-is-text-size-3 should-wrap">{{ errorSignature }}</div>
                </template>
            </Property>

        </div><template v-else>

            <Property :custom-nb-col-class="customNbColClass" id="functionInput">
                <template v-slot:name>Error Message</template>
                <template v-slot:value>
                    <HexaValue :show-none="true"/>
                </template>
            </Property>

        </template>

    </template><template v-else>

        <Property :custom-nb-col-class="customNbColClass" id="errorMessage">
            <template v-slot:name>Error Message</template>
            <template v-slot:value>
                <StringValue v-if="decodedError" :string-value="decodedError"/>
                <template v-else>
                    <HexaValue :byte-string="error" :show-none="true"/>
                    <div v-if="errorDecodingStatus" class="h-is-extra-text h-is-text-size-3">
                        <span class="icon fas fa-exclamation-circle has-text-grey is-small mt-1 mr-1"/>
                        <span>{{ errorDecodingStatus }}</span>
                    </div>
                </template>
            </template>
        </Property>

    </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";
import {FunctionCallAnalyzer} from "@/utils/analyzer/FunctionCallAnalyzer";
import Property from "@/components/Property.vue";
import {decodeSolidityErrorMessage} from "@/schemas/HederaUtils";
import StringValue from "@/components/values/StringValue.vue";

export default defineComponent({
    name: 'FunctionError',
    components: {StringValue, Property, HexaValue},
    props: {
        analyzer: {
            type: Object as PropType<FunctionCallAnalyzer>,
            required: true
        },
        customNbColClass: String,
        showNone: {
            type: Boolean,
            default: false
        }
    },

    setup(props) {

        const initialLoading = inject(initialLoadingKey, ref(false))
        const decodedError = computed( () =>
            props.analyzer.normalizedError.value != null ? decodeSolidityErrorMessage(props.analyzer.normalizedError.value) : null)

        return {
            error: props.analyzer.normalizedError,
            errorSignature: props.analyzer.errorSignature,
            errorHash: props.analyzer.errorHash,
            errorInputs: props.analyzer.errorInputs,
            errorDecodingStatus: props.analyzer.errorDecodingStatus,
            decodedError,
            initialLoading
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
