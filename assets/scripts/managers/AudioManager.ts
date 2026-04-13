import { _decorator, Component, Node, AudioSource, AudioClip, resources } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 音频管理器
 * 统一管理游戏音效和背景音乐
 */
@ccclass('AudioManager')
export class AudioManager extends Component {
    
    // 单例
    private static _instance: AudioManager = null;
    public static get instance(): AudioManager {
        return AudioManager._instance;
    }
    
    @property(AudioSource)
    bgmSource: AudioSource = null;         // 背景音乐源
    
    @property(AudioSource)
    sfxSource: AudioSource = null;         // 音效源
    
    // 音量设置
    private bgmVolume: number = 0.5;
    private sfxVolume: number = 0.8;
    private isMuted: boolean = false;
    
    // 音频缓存
    private audioCache: Map<string, AudioClip> = new Map();
    
    onLoad() {
        if (AudioManager._instance === null) {
            AudioManager._instance = this;
        }
        
        // 加载设置
        this.loadSettings();
    }
    
    /**
     * 加载音频资源
     */
    preloadAudio(name: string, path: string): void {
        resources.load(path, AudioClip, (err, clip) => {
            if (err) {
                console.error(`加载音频失败: ${path}`, err);
                return;
            }
            this.audioCache.set(name, clip);
        });
    }
    
    /**
     * 播放背景音乐
     */
    playBGM(name: string, loop: boolean = true): void {
        const clip = this.audioCache.get(name);
        if (!clip || !this.bgmSource) return;
        
        this.bgmSource.clip = clip;
        this.bgmSource.loop = loop;
        this.bgmSource.volume = this.isMuted ? 0 : this.bgmVolume;
        this.bgmSource.play();
    }
    
    /**
     * 停止背景音乐
     */
    stopBGM(): void {
        if (this.bgmSource) {
            this.bgmSource.stop();
        }
    }
    
    /**
     * 暂停背景音乐
     */
    pauseBGM(): void {
        if (this.bgmSource) {
            this.bgmSource.pause();
        }
    }
    
    /**
     * 恢复背景音乐
     */
    resumeBGM(): void {
        if (this.bgmSource) {
            this.bgmSource.play();
        }
    }
    
    /**
     * 播放音效
     */
    playSFX(name: string): void {
        if (this.isMuted) return;
        
        const clip = this.audioCache.get(name);
        if (!clip || !this.sfxSource) return;
        
        this.sfxSource.playOneShot(clip, this.sfxVolume);
    }
    
    /**
     * 设置背景音乐音量
     */
    setBGMVolume(volume: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmSource) {
            this.bgmSource.volume = this.isMuted ? 0 : this.bgmVolume;
        }
        this.saveSettings();
    }
    
    /**
     * 设置音效音量
     */
    setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    /**
     * 静音/取消静音
     */
    toggleMute(): void {
        this.isMuted = !this.isMuted;
        
        if (this.bgmSource) {
            this.bgmSource.volume = this.isMuted ? 0 : this.bgmVolume;
        }
        
        this.saveSettings();
    }
    
    /**
     * 保存设置
     */
    private saveSettings(): void {
        const settings = {
            bgmVolume: this.bgmVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted
        };
        localStorage.setItem('audioSettings', JSON.stringify(settings));
    }
    
    /**
     * 加载设置
     */
    private loadSettings(): void {
        const saved = localStorage.getItem('audioSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.bgmVolume = settings.bgmVolume ?? 0.5;
            this.sfxVolume = settings.sfxVolume ?? 0.8;
            this.isMuted = settings.isMuted ?? false;
        }
    }
    
    // 预定义音效名称
    static readonly SFX = {
        BUTTON_CLICK: 'sfx_button_click',
        MERGE_SUCCESS: 'sfx_merge_success',
        GOLD_GET: 'sfx_gold_get',
        LEVEL_UP: 'sfx_level_up',
        BATTLE_START: 'sfx_battle_start',
        BATTLE_WIN: 'sfx_battle_win',
        GACHA_RESULT: 'sfx_gacha_result',
        PET_GET: 'sfx_pet_get'
    };
    
    // 预定义背景音乐名称
    static readonly BGM = {
        MAIN: 'bgm_main',
        BATTLE: 'bgm_battle',
        GACHA: 'bgm_gacha'
    };
}