// src/service/syncService.ts
export class SyncService {
    private static instance: SyncService;
    private listeners: Set<() => void> = new Set();
    private intervalId: NodeJS.Timeout | null = null;
    private lastDataVersion: string | null = null;
    private isPolling: boolean = false;
  
    static getInstance(): SyncService {
      if (!SyncService.instance) {
        SyncService.instance = new SyncService();
      }
      return SyncService.instance;
    }
  
    // Inicia o polling automático
    startPolling(intervalMs: number = 3000) {
      if (this.intervalId || this.isPolling) return;
  
      this.isPolling = true;
      this.intervalId = setInterval(() => {
        this.checkForUpdates();
      }, intervalMs);
  
      console.log('🔄 Sincronização automática iniciada');
    }
  
    // Para o polling
    stopPolling() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isPolling = false;
        console.log('⏹️ Sincronização automática parada');
      }
    }
  
    // Verifica se há atualizações
    private checkForUpdates() {
      try {
        const currentVersion = this.getCurrentDataVersion();
        
        if (this.lastDataVersion && this.lastDataVersion !== currentVersion) {
          console.log('🔄 Dados atualizados detectados, sincronizando...');
          this.notifyListeners();
        }
        
        this.lastDataVersion = currentVersion;
      } catch (error) {
        console.error('❌ Erro ao verificar atualizações:', error);
      }
    }
  
    // Gera uma versão dos dados baseada no conteúdo e timestamp
    private getCurrentDataVersion(): string {
      try {
        const alunos = localStorage.getItem('alunos') || '[]';
        const videos = localStorage.getItem('videos') || '[]';
        const videosLiberados = localStorage.getItem('videosLiberados') || '{}';
        const videoTitles = localStorage.getItem('videoTitles') || '{}';
        const videoUrls = localStorage.getItem('videoUrls') || '{}';
        const lastUpdate = localStorage.getItem('lastDataUpdate') || '0';
        
        const combinedData = alunos + videos + videosLiberados + videoTitles + videoUrls + lastUpdate;
        
        // Gera um hash mais robusto
        let hash = 0;
        for (let i = 0; i < combinedData.length; i++) {
          const char = combinedData.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        
        return hash.toString() + '_' + lastUpdate;
      } catch (error) {
        console.error('❌ Erro ao gerar versão dos dados:', error);
        return Date.now().toString();
      }
    }
  
    // Adiciona um listener para mudanças
    addListener(callback: () => void): void {
      this.listeners.add(callback);
      console.log(`📡 Listener adicionado (${this.listeners.size} total)`);
    }
  
    // Remove um listener
    removeListener(callback: () => void): void {
      this.listeners.delete(callback);
      console.log(`📡 Listener removido (${this.listeners.size} restantes)`);
    }
  
    // Notifica todos os listeners
    private notifyListeners(): void {
      console.log(`📢 Notificando ${this.listeners.size} listeners`);
      this.listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('❌ Erro ao executar listener:', error);
        }
      });
    }
  
    // Força uma atualização quando o admin faz mudanças
    forceUpdate(): void {
      const timestamp = Date.now().toString();
      localStorage.setItem('lastDataUpdate', timestamp);
      console.log('🚀 Forçando atualização:', timestamp);
      
      // Atualiza a versão local imediatamente
      this.lastDataVersion = this.getCurrentDataVersion();
      
      // Notifica imediatamente todos os listeners
      this.notifyListeners();
    }
  
    // Inicializa a versão atual
    initialize(): void {
      this.lastDataVersion = this.getCurrentDataVersion();
      console.log('🎯 SyncService inicializado');
    }
  
    // Verifica se está sincronizando
    isActive(): boolean {
      return this.isPolling && this.intervalId !== null;
    }
  
    // Obtém estatísticas do serviço
    getStats() {
      return {
        isActive: this.isActive(),
        listenersCount: this.listeners.size,
        lastVersion: this.lastDataVersion
      };
    }
  }
  
  // Hook personalizado para usar com React
  export const useSyncService = () => {
    const syncService = SyncService.getInstance();
    
    return {
      startPolling: (interval?: number) => syncService.startPolling(interval),
      stopPolling: () => syncService.stopPolling(),
      addListener: (callback: () => void) => syncService.addListener(callback),
      removeListener: (callback: () => void) => syncService.removeListener(callback),
      forceUpdate: () => syncService.forceUpdate(),
      initialize: () => syncService.initialize(),
      getStats: () => syncService.getStats()
    };
  };
  