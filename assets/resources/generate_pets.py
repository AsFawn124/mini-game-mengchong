#!/usr/bin/env python3
"""
萌宠图片生成脚本
使用AI工具批量生成萌宠原画
"""

import subprocess
import json
import os
import time

# 萌宠配置
PETS_CONFIG = {
    # N级萌宠 - 基础款
    'n': [
        {'id': 'n001', 'name': '小火苗', 'element': 'fire', 'animal': 'small flame spirit', 'color': 'orange'},
        {'id': 'n002', 'name': '水滴仔', 'element': 'water', 'animal': 'cute water droplet', 'color': 'blue'},
        {'id': 'n003', 'name': '绿叶怪', 'element': 'grass', 'animal': 'small leaf creature', 'color': 'green'},
        {'id': 'n004', 'name': '闪电鼠', 'element': 'fire', 'animal': 'cute mouse with lightning', 'color': 'yellow'},
        {'id': 'n005', 'name': '泡泡鱼', 'element': 'water', 'animal': 'cute bubble fish', 'color': 'cyan'},
        {'id': 'n006', 'name': '岩石怪', 'element': 'grass', 'animal': 'small rock creature', 'color': 'brown'},
        {'id': 'n007', 'name': '风精灵', 'element': 'grass', 'animal': 'tiny wind fairy', 'color': 'lightblue'},
        {'id': 'n008', 'name': '火苗兔', 'element': 'fire', 'animal': 'cute rabbit with flame ears', 'color': 'orange'},
        {'id': 'n009', 'name': '水滴蛙', 'element': 'water', 'animal': 'cute frog with water drops', 'color': 'blue'},
        {'id': 'n010', 'name': '种子怪', 'element': 'grass', 'animal': 'tiny seed creature', 'color': 'green'},
        {'id': 'n011', 'name': '火花猫', 'element': 'fire', 'animal': 'small cat with spark', 'color': 'red'},
        {'id': 'n012', 'name': '冰晶虫', 'element': 'water', 'animal': 'cute ice crystal bug', 'color': 'lightblue'},
        {'id': 'n013', 'name': '藤蔓蛇', 'element': 'grass', 'animal': 'cute vine snake', 'color': 'green'},
        {'id': 'n014', 'name': '煤炭球', 'element': 'fire', 'animal': 'round coal creature', 'color': 'black'},
        {'id': 'n015', 'name': '露珠蝶', 'element': 'water', 'animal': 'cute butterfly with dew', 'color': 'blue'},
        {'id': 'n016', 'name': '蘑菇仔', 'element': 'grass', 'animal': 'small mushroom creature', 'color': 'red'},
        {'id': 'n017', 'name': '火苗鸟', 'element': 'fire', 'animal': 'tiny bird with flame wings', 'color': 'orange'},
        {'id': 'n018', 'name': '水母仔', 'element': 'water', 'animal': 'cute baby jellyfish', 'color': 'pink'},
        {'id': 'n019', 'name': '花瓣精', 'element': 'grass', 'animal': 'tiny flower petal fairy', 'color': 'pink'},
        {'id': 'n020', 'name': '火星虫', 'element': 'fire', 'animal': 'cute firefly', 'color': 'orange'},
    ],
    
    # R级萌宠 - 进阶款
    'r': [
        {'id': 'r001', 'name': '火焰喵', 'element': 'fire', 'animal': 'cute fire cat', 'color': 'red'},
        {'id': 'r002', 'name': '冰霜兔', 'element': 'water', 'animal': 'cute ice rabbit', 'color': 'cyan'},
        {'id': 'r003', 'name': '雷霆熊', 'element': 'fire', 'animal': 'cute thunder bear', 'color': 'purple'},
        {'id': 'r004', 'name': '治愈狐', 'element': 'light', 'animal': 'cute healing fox', 'color': 'white'},
        {'id': 'r005', 'name': '暗影狼', 'element': 'dark', 'animal': 'cute shadow wolf', 'color': 'darkpurple'},
        {'id': 'r006', 'name': '烈焰狮', 'element': 'fire', 'animal': 'cute flame lion', 'color': 'orange'},
        {'id': 'r007', 'name': '寒冰鹿', 'element': 'water', 'animal': 'cute ice deer', 'color': 'lightblue'},
        {'id': 'r008', 'name': '疾风鹰', 'element': 'grass', 'animal': 'cute wind eagle', 'color': 'green'},
        {'id': 'r009', 'name': '圣光犬', 'element': 'light', 'animal': 'cute holy dog', 'color': 'gold'},
        {'id': 'r010', 'name': '暗夜豹', 'element': 'dark', 'animal': 'cute night leopard', 'color': 'black'},
        {'id': 'r011', 'name': '熔岩龟', 'element': 'fire', 'animal': 'cute lava turtle', 'color': 'red'},
        {'id': 'r012', 'name': '海啸鲸', 'element': 'water', 'animal': 'cute tsunami whale', 'color': 'blue'},
        {'id': 'r013', 'name': '森林鹿', 'element': 'grass', 'animal': 'cute forest deer', 'color': 'green'},
        {'id': 'r014', 'name': '光明马', 'element': 'light', 'animal': 'cute light horse', 'color': 'white'},
        {'id': 'r015', 'name': '黑暗鸦', 'element': 'dark', 'animal': 'cute dark raven', 'color': 'black'},
    ],
    
    # SR级萌宠 - 稀有款
    'sr': [
        {'id': 'sr001', 'name': '凤凰', 'element': 'fire', 'animal': 'majestic phoenix', 'color': 'red'},
        {'id': 'sr002', 'name': '冰龙', 'element': 'water', 'animal': 'cute ice dragon', 'color': 'cyan'},
        {'id': 'sr003', 'name': '雷麒麟', 'element': 'fire', 'animal': 'cute thunder qilin', 'color': 'purple'},
        {'id': 'sr004', 'name': '光独角兽', 'element': 'light', 'animal': 'cute light unicorn', 'color': 'white'},
        {'id': 'sr005', 'name': '暗影龙', 'element': 'dark', 'animal': 'cute shadow dragon', 'color': 'black'},
        {'id': 'sr006', 'name': '朱雀', 'element': 'fire', 'animal': 'cute vermilion bird', 'color': 'red'},
        {'id': 'sr007', 'name': '玄武', 'element': 'water', 'animal': 'cute black tortoise', 'color': 'blue'},
        {'id': 'sr008', 'name': '青龙', 'element': 'grass', 'animal': 'cute azure dragon', 'color': 'green'},
        {'id': 'sr009', 'name': '白虎', 'element': 'light', 'animal': 'cute white tiger', 'color': 'white'},
        {'id': 'sr010', 'name': '九尾狐', 'element': 'dark', 'animal': 'cute nine-tailed fox', 'color': 'purple'},
    ],
    
    # SSR级萌宠 - 传说款
    'ssr': [
        {'id': 'ssr001', 'name': '圣光天使', 'element': 'light', 'animal': 'beautiful holy angel', 'color': 'gold'},
        {'id': 'ssr002', 'name': '暗黑魔王', 'element': 'dark', 'animal': 'cool dark demon king', 'color': 'black'},
        {'id': 'ssr003', 'name': '元素神龙', 'element': 'fire', 'animal': 'epic elemental dragon', 'color': 'rainbow'},
        {'id': 'ssr004', 'name': '时空女神', 'element': 'light', 'animal': 'beautiful time goddess', 'color': 'silver'},
        {'id': 'ssr005', 'name': '混沌之主', 'element': 'dark', 'animal': 'mysterious chaos lord', 'color': 'purple'},
    ]
}

def generate_prompt(pet, rarity):
    """生成AI绘画提示词"""
    
    # 根据稀有度调整风格
    style_modifiers = {
        'n': 'simple, basic, common quality',
        'r': 'detailed, rare quality, glowing effects',
        'sr': 'highly detailed, epic quality, magical aura, particle effects',
        'ssr': 'masterpiece, legendary quality, divine aura, spectacular effects, intricate details'
    }
    
    base_prompt = f"""A cute {pet['element']} element pet, {pet['animal']}, 
chibi style, big sparkling eyes, fluffy, {pet['color']} color theme,
{style_modifiers[rarity]}, game character design, white background,
2D game art, high quality, 4k, digital art, kawaii style"""
    
    return base_prompt.replace('\n', ' ').strip()

def generate_pet_image(pet, rarity, output_dir):
    """生成单个萌宠图片"""
    
    prompt = generate_prompt(pet, rarity)
    output_file = f"{output_dir}/{pet['id']}_{pet['name']}.png"
    
    print(f"\n生成 {pet['id']} - {pet['name']}...")
    print(f"提示词: {prompt[:100]}...")
    
    try:
        # 使用ai-image-cli生成图片
        result = subprocess.run(
            ['ai-image', 'text2img', prompt, '--size', '1920x1920'],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            # 解析结果获取URL
            try:
                data = json.loads(result.stdout)
                if data.get('success') and data.get('data', {}).get('data'):
                    image_url = data['data']['data'][0]['url']
                    print(f"✅ 生成成功: {image_url}")
                    return {'success': True, 'url': image_url, 'pet': pet}
                else:
                    print(f"❌ 生成失败: {data.get('error', '未知错误')}")
                    return {'success': False, 'error': data.get('error')}
            except json.JSONDecodeError:
                print(f"❌ 解析失败: {result.stdout[:200]}")
                return {'success': False, 'error': 'JSON解析失败'}
        else:
            print(f"❌ 命令失败: {result.stderr[:200]}")
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
    print("萌宠图片批量生成工具")
    print("=" * 60)
    
    # 创建输出目录
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    results = {
        'success': [],
        'failed': []
    }
    
    # 生成各等级萌宠
    for rarity in ['n', 'r', 'sr', 'ssr']:
        pets = PETS_CONFIG[rarity]
        output_dir = f"{base_dir}/pets/{rarity}"
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n{'='*60}")
        print(f"生成 {rarity.upper()} 级萌宠 ({len(pets)}只)")
        print(f"{'='*60}")
        
        for pet in pets:
            result = generate_pet_image(pet, rarity, output_dir)
            
            if result['success']:
                results['success'].append({
                    'id': pet['id'],
                    'name': pet['name'],
                    'url': result['url']
                })
            else:
                results['failed'].append({
                    'id': pet['id'],
                    'name': pet['name'],
                    'error': result.get('error', '未知错误')
                })
            
            # 避免请求过快
            time.sleep(2)
    
    # 输出统计
    print(f"\n{'='*60}")
    print("生成统计")
    print(f"{'='*60}")
    print(f"成功: {len(results['success'])} 只")
    print(f"失败: {len(results['failed'])} 只")
    
    if results['failed']:
        print(f"\n失败的萌宠:")
        for item in results['failed']:
            print(f"  - {item['id']} {item['name']}: {item['error']}")
    
    # 保存结果
    result_file = f"{base_dir}/generation_result.json"
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n结果已保存到: {result_file}")

if __name__ == '__main__':
    main()
