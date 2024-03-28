import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

import { SummonerInfo } from '@shared/types/lcu/summoner'

export const useSummonerStore = defineStore('summoner', () => {
  const currentSummoner = shallowRef<SummonerInfo | null>(null)
  const newIdSystemEnabled = ref(false)

  return {
    currentSummoner,
    newIdSystemEnabled
  }
})
