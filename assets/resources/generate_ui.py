#!/usr/bin/env python3
"""
UI素材生成脚本
使用AI工具生成游戏UI素材
"""

import subprocess
import json
import os
import time

# UI素材配置
UI_CONFIG = {
    'buttons': [
        {
            'id': 'button_normal',
            'name': '普通按钮',
            'prompt': 'A cute game button, rounded rectangle, pink gradient, soft shadow, 2D game UI asset, white background, high quality, clean design'
        },
        {
            'id': 'button_pressed',
            'name': '按下按钮',
            'prompt': 'A cute game button pressed state, rounded rectangle, darker pink, inset shadow, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'button_disabled',
            'name': '禁用按钮',
            'prompt': 'A cute game button disabled state, rounded rectangle, gray color, flat design, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'button_close',
            'name': '关闭按钮',
            'prompt': 'A cute game close button, X icon, circular, red color, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'button_back',
            'name': '返回按钮',
            'prompt': 'A cute game back button, arrow icon, circular, blue color, 2D game UI asset, white background, high quality'
        }
    ],
    
    'panels': [
        {
            'id': 'panel_main',
            'name': '主面板',
            'prompt': 'A cute game main panel, rounded rectangle, pink and white gradient, decorative border, soft shadow, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'panel_popup',
            'name': '弹窗面板',
            'prompt': 'A cute game popup panel, rounded rectangle, cream color, golden border, soft shadow, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'panel_card',
            'name': '卡片面板',
            'prompt': 'A cute game card panel, rounded rectangle, white background, subtle shadow, 2D game UI asset, white background, high quality'
        }
    ],
    
    'icons': [
        {
            'id': 'icon_gold',
            'name': '金币图标',
            'prompt': 'A cute gold coin icon, shiny, 3D effect, game currency, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'icon_diamond',
            'name': '钻石图标',
            'prompt': 'A cute diamond gem icon, blue crystal, sparkling, game premium currency, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'icon_exp',
            'name': '经验图标',
            'prompt': 'A cute experience star icon, golden star, glowing, game XP, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'icon_energy',
            'name': '体力图标',
            'prompt': 'A cute energy heart icon, red heart, glowing, game energy, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'element_fire',
            'name': '火属性图标',
            'prompt': 'A cute fire element icon, flame symbol, orange and red, game element, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'element_water',
            'name': '水属性图标',
            'prompt': 'A cute water element icon, water drop symbol, blue, game element, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'element_grass',
            'name': '草属性图标',
            'prompt': 'A cute grass element icon, leaf symbol, green, game element, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'element_light',
            'name': '光属性图标',
            'prompt': 'A cute light element icon, sun symbol, golden yellow, game element, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'element_dark',
            'name': '暗属性图标',
            'prompt': 'A cute dark element icon, moon symbol, purple, game element, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'rarity_n',
            'name': 'N级边框',
            'prompt': 'A cute game card frame, N rarity, gray border, simple design, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'rarity_r',
            'name': 'R级边框',
            'prompt': 'A cute game card frame, R rarity, green border, glowing effect, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'rarity_sr',
            'name': 'SR级边框',
            'prompt': 'A cute game card frame, SR rarity, purple border, magical glow, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'rarity_ssr',
            'name': 'SSR级边框',
            'prompt': 'A cute game card frame, SSR rarity, golden border, divine glow, spectacular effect, 2D game UI asset, white background, high quality'
        }
    ],
    
    'hpbar': [
        {
            'id': 'hpbar_bg',
            'name': '血条背景',
            'prompt': 'A game health bar background, rounded rectangle, dark gray, 2D game UI asset, white background, high quality'
        },
        {
            'id': 'hpbar_fill',
            'name': '血条填充',
            'prompt': 'A game health bar fill, rounded rectangle, red to green gradient, glossy effect, 2D game UI asset, white background, high quality'
        }
    ]
}

def generate_ui_image(item, category, output_dir):
    """生成UI图片"""
    
    prompt = item['prompt']
    output_file = f"{output_dir}/{item['id']}.png"
    
    print(f"\n生成 {item['id']} - {item['name']}...")
    
    try:
        result = subprocess.run(
            ['ai-image', 'text2img', prompt, '--size', '1920x1920'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                if data.get('success') and data.get('data', {}).get('data'):
                    image_url = data['data']['data'][0]['url']
                    print(f"✅ 生成成功: {image_url}")
                    return {'success': True, 'url': image_url, 'item': item}
                else:
                    print(f"❌ 生成失败: {data.get('error', '未知错误')}")
                    return {'success': False, 'error': data.get('error')}
            except json.JSONDecodeError:
                print(f"❌ 解析失败")
                return {'success': False, 'error': 'JSON解析失败'}
        else:
            print(f"❌ 命令失败")
            return {'success': False, 'error': result.stderr}
            
    except subprocess.TimeoutExpired:
        print(f"❌ 生成超时")
        return {'success': False, 'error': 'timeout'}
    except Exception as e:
        print(f"❌ 异常: {str(e)}")
        return {'success': False, 'error': str(e)}

def main():
    """主函数"""
    
    print("=" * 60)
    print("UI素材批量生成工具")
    print("=" * 60)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    results = {
        'success': [],
        'failed': []
    }
    
    # 生成各类UI素材
    for category, items in UI_CONFIG.items():
        output_dir = f"{base_dir}/ui/{category}"
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n{'='*60}")
        print(f"生成 {category} ({len(items)}个)")
        print(f"{'='*60}")
        
        for item in items:
            result = generate_ui_image(item, category, output_dir)
            
            if result['success']:
                results['success'].append({
                    'id': item['id'],
                    'name': item['name'],
                    'url': result['url']
                })
            else:
                results['failed'].append({
                    'id': item['id'],
                    'name': item['name'],
                    'error': result.get('error', '未知错误')
                })
            
            time.sleep(2)
    
    # 输出统计
    print(f"\n{'='*60}")
    print("生成统计")
    print(f"{'='*60}")
    print(f"成功: {len(results['success'])} 个")
    print(f"失败: {len(results['failed'])} 个")
    
    # 保存结果
    result_file = f"{base_dir}/ui_generation_result.json"
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存到: {result_file}")

if __name__ == '__main__':
    main()
