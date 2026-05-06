/**
 * 音频管理器
 * 负责背景音乐和音效的播放管理
 */

const { ccclass } = cc._decorator;

@ccclass
export class AudioManager extends cc.Component {
    
    // 音频缓存
    private _audioCache: Map<string, cc.AudioClip> = new Map();
    
    // 音量设置
    private _bgmVolume: number = 0.5;
    private _sfxVolume: number = 0.7;
    private _isMuted: boolean = false;
    
    // 当前播放的BGM
    private _currentBgm: number = -1;
    
    onLoad() {
        console.log('[AudioManager] 初始化');
    }
    
    /**
     * 初始化音频管理器
     */
    public init(): void {
        // 加载音量设置
        this._loadVolumeSettings();
        console.log('[AudioManager] 音量设置加载完成');
    }
    
    /**
     * 播放背景音乐
     */
    public playBGM(audioClip: cc.AudioClip | string, loop: boolean = true): void {
        if (this._isMuted) return;
        
        // 停止当前BGM
        this.stopBGM();
        
        if (typeof audioClip === 'string') {
            // 从缓存或资源加载
            this._loadAndPlayBGM(audioClip, loop);
        } else {
            this._currentBgm = cc.audioEngine.play(audioClip, loop, this._bgmVolume);
        }
    }
    
    /**
     * 停止背景音乐
     */
    public stopBGM(): void {
        if (this._currentBgm !== -1) {
            cc.audioEngine.stop(this._currentBgm);
            this._currentBgm = -1;
        }
    }
    
    /**
     * 暂停背景音乐
     */
    public pauseBGM(): void {
        if (this._currentBgm !== -1) {
            cc.audioEngine.pause(this._currentBgm);
        }
    }
    
    /**
     * 恢复背景音乐
     */
    public resumeBGM(): void {
        if (this._currentBgm !== -1) {
            cc.audioEngine.resume(this._currentBgm);
        }
    }
    
    /**
     * 播放音效
     */
    public playSFX(audioClip: cc.AudioClip | string): void {
        if (this._isMuted) return;
        
        if (typeof audioClip === 'string') {
            this._loadAndPlaySFX(audioClip);
        } else {
            cc.audioEngine.play(audioClip, false, this._sfxVolume);
        }
    }
    
    /**
     * 预加载音频
     */
    public preloadAudio(audioPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._audioCache.has(audioPath)) {
                resolve();
                return;
            }
            
            cc.loader.loadRes(audioPath, cc.AudioClip, (err, clip) => {
                if (err) {
                    console.error(`[AudioManager] 加载音频失败: ${audioPath}`, err);
                    reject(err);
                    return;
                }
                
                this._audioCache.set(audioPath, clip);
                resolve();
            });
        });
    }
    
    /**
     * 设置背景音乐音量
     */
    public setBGMVolume(volume: number): void {
        this._bgmVolume = Math.max(0, Math.min(1, volume));
        
        if (this._currentBgm !== -1) {
            cc.audioEngine.setVolume(this._currentBgm, this._bgmVolume);
        }
        
        this._saveVolumeSettings();
    }
    
    /**
     * 设置音效音量
     */
    public setSFXVolume(volume: number): void {
        this._sfxVolume = Math.max(0, Math.min(1, volume));
        this._saveVolumeSettings();
    }
    
    /**
     * 静音/取消静音
     */
    public toggleMute(): boolean {
        this._isMuted = !this._isMuted;
        
        if (this._isMuted) {
            this.stopBGM();
        }
        
        return this._isMuted;
    }
    
    /**
     * 获取静音状态
     */
    public get isMuted(): boolean {
        return this._isMuted;
    }
    
    /**
     * 加载并播放BGM
     */
    private _loadAndPlayBGM(audioPath: string, loop: boolean): void {
        const cached = this._audioCache.get(audioPath);
        if (cached) {
            this._currentBgm = cc.audioEngine.play(cached, loop, this._bgmVolume);
            return;
        }
        
        cc.loader.loadRes(audioPath, cc.AudioClip, (err, clip) => {
            if (err) {
                console.error(`[AudioManager] 加载BGM失败: ${audioPath}`, err);
                return;
            }
            
            this._audioCache.set(audioPath, clip);
            this._currentBgm = cc.audioEngine.play(clip, loop, this._bgmVolume);
        });
    }
    
    /**
     * 加载并播放音效
     */
    private _loadAndPlaySFX(audioPath: string): void {
        const cached = this._audioCache.get(audioPath);
        if (cached) {
            cc.audioEngine.play(cached, false, this._sfxVolume);
            return;
        }
        
        cc.loader.loadRes(audioPath, cc.AudioClip, (err, clip) => {
            if (err) {
                console.error(`[AudioManager] 加载音效失败: ${audioPath}`, err);
                return;
            }
            
            this._audioCache.set(audioPath, clip);
            cc.audioEngine.play(clip, false, this._sfxVolume);
        });
    }
    
    /**
     * 加载音量设置
     */
    private _loadVolumeSettings(): void {
        try {
            const bgmVol = cc.sys.localStorage.getItem('bgm_volume');
            const sfxVol = cc.sys.localStorage.getItem('sfx_volume');
            const muted = cc.sys.localStorage.getItem('audio_muted');
            
            if (bgmVol !== null) this._bgmVolume = parseFloat(bgmVol);
            if (sfxVol !== null) this._sfxVolume = parseFloat(sfxVol);
            if (muted !== null) this._isMuted = muted === 'true';
        } catch (e) {
            console.error('[AudioManager] 加载音量设置失败', e);
        }
    }
    
    /**
     * 保存音量设置
     */
    private _saveVolumeSettings(): void {
        try {
            cc.sys.localStorage.setItem('bgm_volume', this._bgmVolume.toString());
            cc.sys.localStorage.setItem('sfx_volume', this._sfxVolume.toString());
            cc.sys.localStorage.setItem('audio_muted', this._isMuted.toString());
        } catch (e) {
            console.error('[AudioManager] 保存音量设置失败', e);
        }
    }
    
    /**
     * 常用音效快捷方法
     */
    public playButtonClick(): void {
        this.playSFX('audio/sfx/button_click');
    }
    
    public playGacha(): void {
        this.playSFX('audio/sfx/gacha');
    }
    
    public playBattleStart(): void {
        this.playSFX('audio/sfx/battle_start');
    }
    
    public playAttack(): void {
        this.playSFX('audio/sfx/attack');
    }
    
    public playVictory(): void {
        this.playSFX('audio/sfx/victory');
    }
    
    public playDefeat(): void {
        this.playSFX('audio/sfx/defeat');
    }
    
    public playLevelUp(): void {
        this.playSFX('audio/sfx/level_up');
    }
}
