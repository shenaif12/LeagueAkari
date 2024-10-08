import { useTabs } from '@renderer-shared/compositions/useTabs'
import { SavedPlayerInfo } from '@renderer-shared/modules/core-functionality/store'
import { Game } from '@shared/types/lcu/match-history'
import { RankedStats } from '@shared/types/lcu/ranked'
import { SummonerInfo } from '@shared/types/lcu/summoner'
import { GameRelationship, MatchHistoryGamesAnalysisAll } from '@shared/utils/analysis'
import { defineStore } from 'pinia'
import { markRaw } from 'vue'

/**
 * 通用带状态的战绩数据
 */

/**
 * 仅用于适合标签页中带有展开属性的卡片
 */
export interface MatchHistoryGameTabCard {
  isLoading: boolean

  /** 是否是加载后的详细对局信息 */
  isDetailed: boolean

  /**
   * 是否加载出错
   */
  hasError?: boolean

  /** 游戏对局信息本体 */
  game: Game

  /** 是否已经展开 */
  isExpanded: boolean
}

export interface SummonerTabMatchHistory {
  games: MatchHistoryGameTabCard[]

  /** 用于按照 ID 快速查找 */
  _gamesMap: Record<number, MatchHistoryGameTabCard>

  /** 上次拉取战绩的时间 */
  lastUpdate?: number

  /** 第几页，from 1 to Infinity */
  page: number

  /** 每页战绩的数量 */
  pageSize: number

  queueFilter: number | string
}

export interface TabState {
  /** 页面的 puuid */
  puuid: string

  /** 该玩家数据来源自哪个大区或 RSO */
  sgpServerId: string

  /** 召唤师信息需要加载 */
  summoner?: SummonerInfo

  /** 召唤师段位信息 */
  rankedStats?: RankedStats

  savedInfo?: SavedPlayerInfo

  /** 战绩列表细节 */
  matchHistory: SummonerTabMatchHistory

  detailedGamesCache: Map<number, Game>

  /** 加载中状态 */
  loading: {
    isLoadingSummoner: boolean
    isLoadingMatchHistory: boolean
    isLoadingRankedStats: boolean
  }
}
/** 和战绩相关的一切基础功能 store */
export const useMatchHistoryTabsStore = defineStore('module:match-history-tabs', () => {
  const {
    add,
    canCloseAllTemporary,
    canCloseCurrent,
    canCloseOther,
    closeAllTemporary,
    closeAll,
    closeOther,
    current,
    del,
    get,
    move,
    setCurrent,
    setPinned,
    setTemporary,
    tabs
  } = useTabs<TabState>()

  /** 创建一个新的 Tab 并自动进行初始化操作 */
  const createTab = (unionId: string, options: { setCurrent?: boolean; pin?: boolean } = {}) => {
    const tab = get(unionId)
    if (tab) {
      if (options.setCurrent) {
        setCurrent(unionId)
      }
      return
    }

    // TODO 合并此文件内容到 Module, 重构之
    const [sgpServerId, puuid] = unionId.split('/')

    const newTab: TabState = {
      puuid,
      sgpServerId,
      matchHistory: {
        games: [],
        _gamesMap: {},
        page: 1,
        pageSize: 20,
        lastUpdate: Date.now(),
        queueFilter: -1
      },
      detailedGamesCache: markRaw(new Map()),
      loading: {
        isLoadingSummoner: false,
        isLoadingMatchHistory: false,
        isLoadingRankedStats: false
      }
    }

    add(unionId, newTab, options)

    if (options.setCurrent) {
      setCurrent(unionId)
    }
  }

  const setMatchHistoryExpand = (unionId: string, gameId: number, expand: boolean) => {
    const tab = get(unionId)

    if (tab) {
      const match = tab.data.matchHistory._gamesMap[gameId]
      if (match) {
        match.isExpanded = expand
      }
    }
  }

  const setQueueFilter = (puuid: string, queue: number) => {
    const tab = get(puuid)
    if (tab) {
      tab.data.matchHistory.queueFilter = queue
    }
  }

  return {
    tabs,
    currentTab: current,
    createTab,
    getTab: get,
    closeTab: del,
    moveTab: move,
    setTabPinned: setPinned,
    setTabTemporary: setTemporary,
    setCurrentTab: setCurrent,
    canCloseAllTemporaryTab: canCloseAllTemporary,
    canCloseOtherTabs: canCloseOther,
    canCloseCurrentTab: canCloseCurrent,
    closeOtherTabs: closeOther,
    closeAllTemporaryTabs: closeAllTemporary,
    closeAllTabs: closeAll,
    setQueueFilter,
    setMatchHistoryExpand
  }
})
