// store.js
import { computed, ref } from 'vue'
import { createGlobalState, useStorage } from '@vueuse/core'

export const useGlobalState = createGlobalState(
  () => {
    // state
    const count = ref(0)
    const myAddress = ref(0)
    const infoData = ref({
        usdtCoin: '0', // usdt地址
        spaceCoin: '0', // space地址
        inivet: '0', // 我的上级地址 ✅
        allStakeCp: '0', // 全网算力 ✅
        userCp: '0', // 个人算力 ✅
        teamCp: '0', // 直推团队算力 ✅
        teamCp2: '0', // 15代团队算力 ✅
        userAward: '0', // 个人可领取收益 ✅
        teamAward: '0', // 直推团队可领取收益  ✅
        team2Award: '0', // 15代团队可领取收益 ✅
        teamLength: '0', // 直推人数 ✅
        team2Length: '0', // 15代人数 ✅
        overAward: '0', // 已经领取了多少收益 ✅
        overTeam: '0', // 直推已经领取了多少收益  ✅
        overTeam2: '0', // 15代已经领取了多少收益  ✅
        deadNum: '0' // 销毁总量
    })
    const inviteLink = ref('0xDA02d522d8cd60de0a2F9773f80b16Fc9ED99bdd')
    const userLevel = ref('0')
    const contractAddress=ref('0xac5ef0151FEa4b5b9704f202273f594BDDaF9b12') // difi合约地址

    // getters
    const doubleCount = computed(() => count.value * 2)

    // actions
    function increment() {
      count.value++
    }
    function updateInfoData(val) {
      infoData.value = val
    }
    function updateInviteLink(val) {
      if(val) inviteLink.value = val
    }

    return { 
        count,
        doubleCount,
        myAddress,
        infoData,
        userLevel,
        contractAddress,
        inviteLink,
        increment,
        updateInfoData,
        updateInviteLink,
     }
  }
)