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
  <div class="is-flex-direction-column stake-range-column">
    <div class="miniBar" :style="{'width': progressSize+'px'}">
      <div class="miniBarProgress" :class="stakeRewardedColorClass"
           :style="{'left': 0, 'width': stakeRewardedProgress+'%'}"></div>
      <div class="miniBarProgress has-background-info"
           :style="{'left': stakeRewardedProgress+'%', 'width': stakeNotRewardedProgress+'%'}"></div>
      <div class="miniBarProgress"
           :style="{'left': stakeProgress+'%', 'width': (100-stakeProgress)+'%'}"></div>
    </div>

    <div class="is-flex">
        <img alt="Minimum staking mark" src="@/assets/min-mark.png"
           class="image" style="max-height: 8px" :style="{'margin-left': minStakePix}">
      <img alt="Maximum staking mark" src="@/assets/max-mark.png"
           class="image" style="max-height: 8px" :style="{'margin-left': maxStakePix}">
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">


//
// defineComponent
//

import {computed, defineComponent, PropType} from "vue";
import {NetworkNode} from "@/schemas/HederaSchemas";
import {NetworkAnalyzer} from "@/utils/analyzer/NetworkAnalyzer";

const progressSize = 250 // size (width) of progress in pixels

export default defineComponent({
  name: 'StakeRange',

  components: {},

  props: {
    node: Object as PropType<NetworkNode | undefined>,
    networkAnalyzer: {
        type: Object as PropType<NetworkAnalyzer>,
        required: true
    }
  },

  setup(props) {

    const minStake = computed(
        () => props.node?.min_stake ?? null)
    const maxStake = computed(
        () => props.node?.max_stake ?? null)

    const unclampedStake = computed(
        () => (props.node?.stake_rewarded ?? 0) + (props.node?.stake_not_rewarded ?? 0))

    // Alternative implementation for absolute stake range
    const progressScale = computed(
        () => props.networkAnalyzer.stakeScaleEnd.value)

    // Alternative implementation for relative stake range
    // const progressScale = computed(
    //     () => maxStake.value ? maxStake.value * 1.2 : 0)

    const stakeRewardedProgress = computed(() => {
      let result
      if (progressScale.value) {
        if ((props.node?.stake_rewarded ?? 0) < progressScale.value) {
          result = (props.node?.stake_rewarded ?? 0) / progressScale.value * 100
        } else {
          result = 100
        }
      } else {
        result = 0
      }
      return result
    })

    const stakeNotRewardedProgress = computed(() => {
      let result
      if (progressScale.value) {
        if (unclampedStake.value < progressScale.value) {
          result = (props.node?.stake_not_rewarded ?? 0) / progressScale.value * 100
        } else {
          result = 100 - stakeRewardedProgress.value
        }
      } else {
        result = 0
      }
      return result
    })

    const stakeProgress = computed(() => stakeRewardedProgress.value + stakeNotRewardedProgress.value)

    const stakeRewardedColorClass = computed(
        () => unclampedStake.value && minStake.value && unclampedStake.value < minStake.value
            ? 'has-background-success'
            : props.node?.stake_rewarded && maxStake.value && props.node.stake_rewarded <= maxStake.value
                ? 'has-background-success'
                : 'has-background-success'
    )

    const minStakePercent = computed(() =>
        minStake.value && progressScale.value ? minStake.value / progressScale.value * 100 : 0)
    const minStakePix = computed(() => {
      const pixels = Math.round(minStakePercent.value / 100 * progressSize)
      return pixels.toString() + 'px'
    })

    const maxStakePercent = computed(() =>
        maxStake.value && progressScale.value ? maxStake.value / progressScale.value * 100 : 0)
    const maxStakePix = computed(() => {
      const pixels = Math.round((maxStakePercent.value - minStakePercent.value) / 100 * progressSize - 20)
      return pixels.toString() + 'px'
    })


    return {
      stakeRewardedProgress,
      stakeNotRewardedProgress,
      stakeProgress,
      stakeRewardedColorClass,
      progressSize,
      minStakePix,
      maxStakePix,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.stake-range-column {
  padding-bottom: 2px;
  padding-top: 12px;
}

.miniBarProgress {
  height: 100%;
  position: absolute;
  top: 0rem;
  left: 0rem;
}
.miniBar {
  height: 0.5rem;
  border: 1px solid grey;
  position: relative;
  margin-bottom: 1px;
}

</style>
