import { useState, useEffect, useCallback } from 'react'
import { Aluno, Video } from '../types'

// Tipo para o objeto de permissões: { [alunoId: number]: number[] }
type VideosLiberados = Record<number, number[]>

export function useDataSync() {
  // ALUNOS STATE
  const [alunos, setAlunos] = useState<Aluno[]>(() => {
    const data = localStorage.getItem('alunos')
    return data ? JSON.parse(data) : []
  })

  // VÍDEOS STATE
  const [videos, setVideos] = useState<Video[]>(() => {
    const data = localStorage.getItem('videos')
    return data ? JSON.parse(data) : []
  })

  // PERMISSÕES DE VÍDEOS LIBERADOS POR ALUNO
  // { [alunoId (number)]: [array de ids de videos liberados para esse aluno (number[])] }
  const [videosLiberados, setVideosLiberados] = useState<VideosLiberados>(() => {
    const data = localStorage.getItem('videosLiberados')
    return data ? JSON.parse(data) : {}
  })

  // Dummy updater só para forçar re-render em storage externo
  const [lastSync, setLastSync] = useState<number>(Date.now())

  // === SINCRONIZAÇÃO LOCALSTORAGE<->STATE ===
  // Utilitário para salvar um dado no localStorage e atualizar lastSync
  const saveData = useCallback((key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value))
    setLastSync(Date.now())
  }, [])

  // Carrega os dados ao montar/inicializar
  useEffect(() => {
    setAlunos(JSON.parse(localStorage.getItem('alunos') || '[]'))
    setVideos(JSON.parse(localStorage.getItem('videos') || '[]'))
    setVideosLiberados(JSON.parse(localStorage.getItem('videosLiberados') || '{}'))
  }, [lastSync])

  // Sincroniza quando alunos alteram
  useEffect(() => {
    saveData('alunos', alunos)
  }, [alunos, saveData])

  // Sincroniza quando vídeos alteram
  useEffect(() => {
    saveData('videos', videos)
  }, [videos, saveData])

  // Sincroniza quando permissões mudam
  useEffect(() => {
    saveData('videosLiberados', videosLiberados)
  }, [videosLiberados, saveData])

  // ========== CRUD DE ALUNOS ==========

  const adicionarAluno = useCallback((aluno: Aluno) => {
    setAlunos((prev: Aluno[]) => [...prev, aluno])
  }, [])

  const atualizarAluno = useCallback((alunoAtualizado: Aluno) => {
    setAlunos((prev: Aluno[]) =>
      prev.map((a: Aluno) =>
        a.id === alunoAtualizado.id ? { ...a, ...alunoAtualizado } : a
      )
    )
  }, [])

  const removerAluno = useCallback((alunoId: number) => {
    setAlunos((prev: Aluno[]) => prev.filter((a: Aluno) => a.id !== alunoId))
    setVideosLiberados((prev: VideosLiberados) => {
      const novo = { ...prev }
      delete novo[alunoId]
      return novo
    })
  }, [])

  // ========== CRUD DE VÍDEOS ==========

  const adicionarVideo = useCallback((video: Video) => {
    setVideos((prev: Video[]) => [...prev, video])
  }, [])

  const atualizarVideo = useCallback((videoAtualizado: Video) => {
    setVideos((prev: Video[]) =>
      prev.map((v: Video) =>
        v.id === videoAtualizado.id ? { ...v, ...videoAtualizado } : v
      )
    )
  }, [])

  const removerVideo = useCallback((videoId: number) => {
    setVideos((prev: Video[]) => prev.filter((v: Video) => v.id !== videoId))
    setVideosLiberados((prev: VideosLiberados) => {
      // Remove o videoId das permissões de todos os alunos
      const novo: VideosLiberados = {}
      for (const aluno in prev) {
        const id = Number(aluno)
        novo[id] = prev[id].filter(vid => vid !== videoId)
      }
      return novo
    })
  }, [])

  // ========== PERMISSÕES (LIBERAÇÃO DE VÍDEOS POR ALUNO) ==========

  // Retorna array de videoIds liberados para o aluno
  const getVideosLiberadosDoAluno = useCallback((alunoId: number): number[] => {
    return videosLiberados[alunoId] || []
  }, [videosLiberados])

  // Marca array de vídeos liberados para esse aluno (overwrite)
  const setPermissoesVideosAluno = useCallback((alunoId: number, videoIds: number[]) => {
    setVideosLiberados((prev: VideosLiberados) => ({
      ...prev,
      [alunoId]: videoIds
    }))
  }, [])

  // Libera UM vídeo para UM aluno
  const liberarVideoParaAluno = useCallback((alunoId: number, videoId: number) => {
    setVideosLiberados((prev: VideosLiberados) => {
      const jaTem = prev[alunoId]?.includes(videoId)
      if (jaTem) return prev
      return {
        ...prev,
        [alunoId]: [...(prev[alunoId] || []), videoId]
      }
    })
  }, [])

  // Revoga UM vídeo de UM aluno
  const revogarVideoParaAluno = useCallback((alunoId: number, videoId: number) => {
    setVideosLiberados((prev: VideosLiberados) => ({
      ...prev,
      [alunoId]: (prev[alunoId] || []).filter(id => id !== videoId)
    }))
  }, [])

  // =========================
  // === RETORNOS DO HOOK ====
  // =========================
  return {
    alunos,
    setAlunos,
    adicionarAluno,
    atualizarAluno,
    removerAluno,
    videos,
    setVideos,
    adicionarVideo,
    atualizarVideo,
    removerVideo,
    videosLiberados,
    setPermissoesVideosAluno,
    liberarVideoParaAluno,
    revogarVideoParaAluno,
    getVideosLiberadosDoAluno
  }
}
