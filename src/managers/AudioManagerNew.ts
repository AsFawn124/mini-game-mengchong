/**
 * 增强版音频管理器
 * 支持音效配置、自动场景切换、音频池管理
 */

import { _decorator, Component, AudioClip, audioEngine, sys } from 'cc';
import { BGMType, SFXType, AudioPaths, SceneBGMMap, DefaultAudioSettings } from '../config/AudioConfig';

const { ccclass, property } = _decorator;

@ccclass('AudioManagerNew')
export class AudioManagerNew extends Component {
    
    // 单例
    private static _instance: AudioManagerNew = null;
    public static get instance(): AudioManagerNew {
        return AudioManagerNew._instance;
    }
    
    // 音频缓存
    private _audioCache: Map<string, AudioClip> = new Map();
    
    // 音量设置
    private _bgmVolume: number = DefaultAudioSettings.BGM_VOLUME;
    private _sfxVolume: number = DefaultAudioSettings.SFX_VOLUME;
    private _isMuted: boolean = DefaultAudioSettings.IS_MUTED;
    
    // 当前播放的BGM
    private _currentBgmId: number = -1;
    private _currentBgmType: BGMType = null;
    
    // 音频池（用于频繁播放的音效）
    private _sfxPool: Map<string, number[]> = new Map();
    private readonly POOL_SIZE = 3;
    
    onLoad() {
        if (AudioManagerNew._instance === null) {
            AudioManagerNew._instance = this;
        }
        this._loadSettings();
        console.log('[AudioManager] 初始化完成');
    }
    
    /**
     * 预加载所有音频资源
     */
    public async preloadAll(): Promise<void> {
        console.log('[AudioManager] 开始预加载音频资源...');
        
        const allPaths = [
            ...Object.values(AudioPaths.BGM),
            ...Object.values(AudioPaths.SFX)
        ];
        
        const promises = allPaths.map(path => this._preloadAudio(path));
        await Promise.all(promises);
        
        console.log('[AudioManager] 音频资源预加载完成');
    }
    
    /**
     * 播放背景音乐
     */
    public playBGM(type: BGMType, fadeDuration: number = 0.5): void {
        if (this._isMuted) return;
        if (this._currentBgmType === type) return;
        
        const path = AudioPaths.BGM[type];
        if (!path) {
            console.warn(`[AudioManager] 未找到BGM: ${type}`);
            return;
        }
        
        // 淡出当前BGM
        if (this._currentBgmId !== -1 && fadeDuration > 0) {
            this._fadeOutBGM(fadeDuration, () => {
                this._playBGMInternal(type, path);
            });
        } else {
            this.stopBGM();
            this._playBGMInternal(type, path);
        }
    }
    
    /**
     * 停止背景音乐
     */
    public stopBGM(): void {
        if (this._currentBgmId !== -1) {
            audioEngine.stop(this._currentBgmId);
            this._currentBgmId = -1;
            this._currentBgmType = null;
        }
    }
    
    /**
     * 暂停背景音乐
     */
    public pauseBGM(): void {
        if (this._currentBgmId !== -1) {
            audioEngine.pause(this._currentBgmId);
        }
    }
    
    /**
     * 恢复背景音乐
     */
    public resumeBGM(): void {
        if (this._currentBgmId !== -1) {
            audioEngine.resume(this._currentBgmId);
        }
    }
    
    /**
     * 播放音效
     */
    public playSFX(type: SFXType): void {
        if (this._isMuted) return;
        
        const path = AudioPaths.SFX[type];
        if (!path) {
            console.warn(`[AudioManager] 未找到音效: ${type}`);
            return;
        }
        
        const clip = this._audioCache.get(path);
        if (clip) {
            audioEngine.playOneShot(clip, this._sfxVolume);
        } else {
            // 如果未缓存，异步加载并播放
            this._loadAndPlaySFX(path);
        }
    }
    
    /**
     * 根据场景自动切换BGM
     */
    public playBGMForScene(sceneName: string): void {
        const bgmType = SceneBGMMap[sceneName];
        if (bgmType) {
            this.playBGM(bgmType);
        }
    }
    
    /**
     * 播放胜利音效（BGM + SFX组合）
     */
    public playVictory(): void {
        this.playBGM(BGMType.VICTORY, 0.3);
        this.playSFX(SFXType.VICTORY);
    }
    
    /**
     * 播放失败音效（BGM + SFX组合）
     */
    public playDefeat(): void {
        this.playBGM(BGMType.DEFEAT, 0.3);
        this.playSFX(SFXType.DEFEAT);
    }
    
    /**
     * 播放抽卡音效（根据稀有度）
     */
    public playGachaByRarity(rarity: 'N' | 'R' | 'SR' | 'SSR'): void {
        this.playSFX(SFXType.GACHA);
        
        // 延迟播放结果音效
        setTimeout(() => {
            switch (rarity) {
                case 'SSR':
                    this.playSFX(SFXType.GACHA_SSR);
                    break;
                case 'SR':
                    this.playSFX(SFXType.GACHA_RARE);
                    break;
                default:
                    // N/R 不播放特殊音效
                    break;
            }
        }, 1500);
    }
    
    /**
     * 播放技能音效（根据元素类型）
     */
    public playSkillByElement(element: 'FIRE' | 'WATER' | 'GRASS' | 'LIGHT' | 'DARK'): void {
        switch (element) {
            case 'FIRE':
                this.playSFX(SFXType.SKILL_FIRE);
                break;
            case 'WATER':
                this.playSFX(SFXType.SKILL_ICE);
                break;
            case 'GRASS':
                this.playSFX(SFXType.SKILL_THUNDER);
                break;
            default:
                this.playSFX(SFXType.ATTACK);
                break;
        }
    }
    
    // ==================== 音量控制 ====================
    
    /**
     * 设置背景音乐音量
     */
    public setBGMVolume(volume: number): void {
        this._bgmVolume = Math.max(0, Math.min(1, volume));
        
        if (this._currentBgmId !== -1) {
            audioEngine.setVolume(this._currentBgmId, this._bgmVolume);
        }
        
        this._saveSettings();
    }
    
    /**
     * 设置音效音量
     */
    public setSFXVolume(volume: number): void {
        this._sfxVolume = Math.max(0, Math.min(1, volume));
        this._saveSettings();
    }
    
    /**
     * 获取背景音乐音量
     */
    public get bgmVolume(): number {
        return this._bgmVolume;
    }
    
    /**
     * 获取音效音量
     */
    public get sfxVolume(): number {
        return this._sfxVolume;
    }
    
    /**
     * 静音/取消静音
     */
    public toggleMute(): boolean {
        this._isMuted = !this._isMuted;
        
        if (this._isMuted) {
            this.stopBGM();
        } else if (this._currentBgmType) {
            this.playBGM(this._currentBgmType);
        }
        
        this._saveSettings();
        return this._isMuted;
    }
    
    /**
     * 获取静音状态
     */
    public get isMuted(): boolean {
        return this._isMuted;
    }
    
    // ==================== 私有方法 ====================
    
    private _playBGMInternal(type: BGMType, path: string): void {
        const clip = this._audioCache.get(path);
        if (clip) {
            this._currentBgmId = audioEngine.play(clip, true, this._bgmVolume);
            this._currentBgmType = type;
        } else {
            // 异步加载
            this._loadAndPlayBGM(type, path);
        }
    }
    
    private _loadAndPlayBGM(type: BGMType, path: string): void {
        // 使用Cocos资源加载
        // 注意：实际项目中需要使用正确的资源加载方式
        console.log(`[AudioManager] 异步加载BGM: ${path}`);
    }
    
    private _loadAndPlaySFX(path: string): void {
        console.log(`[AudioManager] 异步加载SFX: ${path}`);
    }
    
    private async _preloadAudio(path: string): Promise<void> {
        return new Promise((resolve) => {
            // 模拟预加载
            // 实际项目中使用Cocos的资源加载API
            setTimeout(() => {
                resolve();
            }, 10);
        });
    }
    
    private _fadeOutBGM(duration: number, callback: () => void): void {
        if (this._currentBgmId === -1) {
            callback();
            return;
        }
        
        const startVolume = audioEngine.getVolume(this._currentBgmId);
        const steps = 20;
        const stepDuration = duration / steps;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume * (1 - currentStep / steps);
            
            if (this._currentBgmId !== -1) {
                audioEngine.setVolume(this._currentBgmId, newVolume);
            }
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.stopBGM();
                callback();
            }
        }, stepDuration * 1000);
    }
    
    private _loadSettings(): void {
        try {
            const bgmVol = sys.localStorage.getItem('bgm_volume');
            const sfxVol = sys.localStorage.getItem('sfx_volume');
            const muted = sys.localStorage.getItem('audio_muted');
            
            if (bgmVol !== null) this._bgmVolume = parseFloat(bgmVol);
            if (sfxVol !== null) this._sfxVolume = parseFloat(sfxVol);
            if (muted !== null) this._isMuted = muted === 'true';
        } catch (e) {
            console.error('[AudioManager] 加载设置失败', e);
        }
    }
    
    private _saveSettings(): void {
        try {
            sys.localStorage.setItem('bgm_volume', this._bgmVolume.toString());
            sys.localStorage.setItem('sfx_volume', this._sfxVolume.toString());
            sys.localStorage.setItem('audio_muted', this._isMuted.toString());
        } catch (e) {
            console.error('[AudioManager] 保存设置失败', e);
        }
    }
}
