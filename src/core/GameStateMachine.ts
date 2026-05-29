/**
 * GameStateMachine - 游戏状态机 (TypeScript)
 * Splash → Login → MainMenu ↔ (Battle/Gacha/Bag/Shop/Arena/Guild/World/Event)
 */
import { EventBus } from './EventBus';

export enum GameState {
    None = 'none', Splash = 'splash', Login = 'login',
    MainMenu = 'main_menu', Loading = 'loading',
    Battle = 'battle', BattleResult = 'battle_result',
    Gacha = 'gacha', Bag = 'bag', PetDetail = 'pet_detail',
    Shop = 'shop', Arena = 'arena', ArenaBattle = 'arena_battle',
    Guild = 'guild', WorldMap = 'world_map', Event = 'event', Cutscene = 'cutscene'
}

interface StateHandler {
    onEnter: (context?: any) => void | Promise<void>;
    onExit: () => void;
    onUpdate?: (dt: number) => void;
}

export class GameStateMachine {
    private static instance: GameStateMachine;
    private states: Map<GameState, StateHandler> = new Map();
    private currentState: GameState = GameState.None;
    private previousState: GameState = GameState.None;
    private stateHistory: GameState[] = [];
    private eventBus: EventBus;
    private updateInterval: number | null = null;

    private constructor() {
        this.eventBus = EventBus.getInstance();
        this.startUpdateLoop();
    }

    public static getInstance(): GameStateMachine {
        if (!this.instance) this.instance = new GameStateMachine();
        return this.instance;
    }

    public register(state: GameState, handlers: StateHandler): void {
        this.states.set(state, handlers);
    }

    public async goTo(target: GameState, context?: any): Promise<void> {
        if (!this.states.has(target)) {
            console.error(`[StateMachine] 未注册的状态: ${target}`);
            return;
        }
        if (this.currentState === target) return;

        const oldState = this.currentState;
        if (this.currentState !== GameState.None) {
            this.states.get(this.currentState)?.onExit();
            this.stateHistory.push(this.currentState);
            if (this.stateHistory.length > 20) this.stateHistory.shift();
        }

        this.previousState = this.currentState;
        this.currentState = target;
        console.log(`[StateMachine] ${oldState} → ${target}`);
        this.eventBus.emit('stateChanged', { from: oldState, to: target });
        await this.states.get(target)!.onEnter(context);
    }

    public goBack(context?: any): boolean {
        if (this.stateHistory.length === 0) return false;
        let prev = this.stateHistory.pop()!;
        while (this.stateHistory.length > 0 &&
               (prev === GameState.Loading || prev === GameState.None))
            prev = this.stateHistory.pop()!;
        this.goTo(prev, context);
        return true;
    }

    public async goToMainMenu(): Promise<void> { return this.goTo(GameState.MainMenu); }
    public async goToBattle(config?: any): Promise<void> { return this.goTo(GameState.Battle, config); }
    public async goToBattleResult(result?: any): Promise<void> { return this.goTo(GameState.BattleResult, result); }

    private startUpdateLoop(): void {
        let lastTime = Date.now();
        this.updateInterval = window.setInterval(() => {
            const now = Date.now(), dt = (now - lastTime) / 1000;
            lastTime = now;
            this.states.get(this.currentState)?.onUpdate?.(dt);
        }, 16);
    }

    public stopUpdateLoop(): void {
        if (this.updateInterval !== null) { clearInterval(this.updateInterval); this.updateInterval = null; }
    }

    public getCurrent(): GameState { return this.currentState; }
    public getPrevious(): GameState { return this.previousState; }
    public is(state: GameState): boolean { return this.currentState === state; }
    public isInBattle(): boolean { return this.currentState === GameState.Battle || this.currentState === GameState.ArenaBattle; }
}
