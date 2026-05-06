#!/usr/bin/env python3
"""
背景图生成脚本
使用AI工具生成游戏背景
"""

import subprocess
import json
import os
import time

# 背景配置
BACKGROUNDS = [
    {
        'id': 'bg_main',
        'name': '主场景背景',
        'prompt': 'A cute fantasy game main menu background, magical forest, pink and blue sky, fluffy clouds, rainbow, cute creatures in distance, dreamy atmosphere, 2D game art, high quality, 750x1334 vertical composition, no UI elements'
    },
    {
        'id': 'bg_battle',
        'name': '战斗场景背景',
        'prompt': 'A cute fantasy game battle background, magical arena, glowing crystals, elemental effects floating, pink and purple theme, epic but cute atmosphere, 2D game art, high quality, 750x1334 vertical composition, no UI elements'
    },
    {
        'id': 'bg_gacha',
        'name': '抽卡场景背景',
        'prompt': 'A cute fantasy game gacha summon background, magical portal, sparkles and stars, rainbow colors, mysterious but cute atmosphere, 2D game art, high quality, 750x1334 vertical composition, no UI elements'
    },
    {
        'id': 'bg_bag',
        'name': '背包场景背景',
        'prompt': 'A cute fantasy game inventory background, cozy room, shelves with cute items, warm lighting, pink and cream colors, 2D game art, high quality, 750x1334 vertical composition, no UI elements'
    },
    {
        'id': 'bg_friend',
        'name': '好友场景背景',
        'prompt': 'A cute fantasy game social background, magical garden, cute creatures playing together, friendship theme, pink and green colors, 2D game art, high quality, 750x1334 vertical composition, no UI elements'
    }
]

def generate_background(item, output_dir):
    """生成背景图"""
    
    prompt = item['prompt']
    
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
    print("背景图批量生成工具")
    print("=" * 60)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = f"{base_dir}/backgrounds"
    os.makedirs(output_dir, exist_ok=True)
    
    results = {
        'success': [],
        'failed': []
    }
    
    print(f"\n生成 {len(BACKGROUNDS)} 张背景图")
    
    for item in BACKGROUNDS:
        result = generate_background(item, output_dir)
        
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
    print(f"成功: {len(results['success'])} 张")
    print(f"失败: {len(results['failed'])} 张")
    
    # 保存结果
    result_file = f"{base_dir}/bg_generation_result.json"
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存到: {result_file}")

if __name__ == '__main__':
    main()
