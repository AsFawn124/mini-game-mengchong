#!/usr/bin/env python3
"""
UI素材生成脚本
使用PIL生成游戏所需的UI组件
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

# 配置
OUTPUT_DIR = "/home/appops/workspace/game-design-mengchong/assets/ui_components"
COLORS = {
    'primary': (255, 154, 158),      # 温暖粉
    'secondary': (168, 230, 207),    # 天空蓝
    'accent': (255, 217, 61),        # 阳光黄
    'bg': (255, 249, 240),           # 米白
    'text': (74, 74, 74),            # 深灰
    'white': (255, 255, 255),
    'black': (0, 0, 0),
    'rarity_n': (158, 158, 158),     # 普通灰
    'rarity_r': (76, 175, 80),       # 稀有绿
    'rarity_sr': (156, 39, 176),     # 史诗紫
    'rarity_ssr': (255, 152, 0),     # 传说橙
    'fire': (255, 87, 34),           # 火
    'water': (33, 150, 243),         # 水
    'grass': (76, 175, 80),          # 草
    'light': (255, 235, 59),         # 光
    'dark': (103, 58, 183),          # 暗
}

def create_rounded_rect(size, color, radius=20):
    """创建圆角矩形"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, size[0]-1, size[1]-1], radius=radius, fill=color)
    return img

def create_gradient(size, color1, color2, direction='vertical'):
    """创建渐变背景"""
    img = Image.new('RGBA', size)
    draw = ImageDraw.Draw(img)
    
    if direction == 'vertical':
        for y in range(size[1]):
            ratio = y / size[1]
            r = int(color1[0] + (color2[0] - color1[0]) * ratio)
            g = int(color1[1] + (color2[1] - color1[1]) * ratio)
            b = int(color1[2] + (color2[2] - color1[2]) * ratio)
            draw.line([(0, y), (size[0], y)], fill=(r, g, b, 255))
    else:
        for x in range(size[0]):
            ratio = x / size[0]
            r = int(color1[0] + (color2[0] - color1[0]) * ratio)
            g = int(color1[1] + (color2[1] - color1[1]) * ratio)
            b = int(color1[2] + (color2[2] - color1[2]) * ratio)
            draw.line([(x, 0), (x, size[1])], fill=(r, g, b, 255))
    
    return img

def create_button(name, size, color, text=None):
    """创建按钮"""
    img = create_rounded_rect(size, color, radius=25)
    draw = ImageDraw.Draw(img)
    
    # 添加高光效果
    highlight = create_rounded_rect((size[0]-4, size[1]//2), 
                                     (255, 255, 255, 30), radius=20)
    img.paste(highlight, (2, 2), highlight)
    
    # 添加阴影
    shadow = Image.new('RGBA', (size[0]+4, size[1]+4), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle([2, 2, size[0]+1, size[1]+1], 
                                   radius=25, fill=(0, 0, 0, 50))
    shadow.paste(img, (0, 0), img)
    
    shadow.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_panel(name, size, color, border_color=None):
    """创建面板"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 阴影
    shadow_offset = 4
    draw.rounded_rectangle(
        [shadow_offset, shadow_offset, size[0]-1, size[1]-1],
        radius=20, fill=(0, 0, 0, 40)
    )
    
    # 主体
    draw.rounded_rectangle(
        [0, 0, size[0]-shadow_offset-1, size[1]-shadow_offset-1],
        radius=20, fill=color
    )
    
    # 边框
    if border_color:
        draw.rounded_rectangle(
            [0, 0, size[0]-shadow_offset-1, size[1]-shadow_offset-1],
            radius=20, outline=border_color, width=3
        )
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_rarity_frame(name, size, color, rarity_text):
    """创建稀有度边框"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 外发光效果
    for i in range(5, 0, -1):
        alpha = int(50 - i * 8)
        glow_color = (*color[:3], alpha)
        draw.rounded_rectangle(
            [i, i, size[0]-i, size[1]-i],
            radius=15, outline=glow_color, width=2
        )
    
    # 主边框
    draw.rounded_rectangle(
        [5, 5, size[0]-5, size[1]-5],
        radius=15, outline=color, width=4
    )
    
    # 内边框
    inner_color = (255, 255, 255, 200)
    draw.rounded_rectangle(
        [10, 10, size[0]-10, size[1]-10],
        radius=12, outline=inner_color, width=2
    )
    
    # 角落装饰
    corner_size = 20
    # 左上
    draw.line([(5, 25), (5, 5), (25, 5)], fill=color, width=4)
    # 右上
    draw.line([(size[0]-25, 5), (size[0]-5, 5), (size[0]-5, 25)], fill=color, width=4)
    # 左下
    draw.line([(5, size[1]-25), (5, size[1]-5), (25, size[1]-5)], fill=color, width=4)
    # 右下
    draw.line([(size[0]-25, size[1]-5), (size[0]-5, size[1]-5), (size[0]-5, size[1]-25)], fill=color, width=4)
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_icon(name, size, color, shape='circle'):
    """创建图标"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if shape == 'circle':
        # 圆形背景
        draw.ellipse([2, 2, size[0]-2, size[1]-2], fill=color)
        # 高光
        draw.ellipse([5, 5, size[0]//2, size[1]//2], fill=(255, 255, 255, 80))
    elif shape == 'square':
        draw.rounded_rectangle([2, 2, size[0]-2, size[1]-2], 
                               radius=10, fill=color)
    elif shape == 'diamond':
        # 菱形
        cx, cy = size[0]//2, size[1]//2
        draw.polygon([
            (cx, 2), (size[0]-2, cy), (cx, size[1]-2), (2, cy)
        ], fill=color)
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_health_bar(name, width, height):
    """创建血条"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 背景
    draw.rounded_rectangle([0, 0, width-1, height-1], 
                           radius=height//2, fill=(60, 60, 60, 200))
    
    # 血条渐变
    for x in range(4, width-4):
        ratio = x / (width-8)
        if ratio < 0.3:
            color = (244, 67, 54)  # 红色
        elif ratio < 0.6:
            color = (255, 152, 0)  # 橙色
        else:
            color = (76, 175, 80)  # 绿色
        draw.line([(x, 3), (x, height-4)], fill=color)
    
    # 边框
    draw.rounded_rectangle([0, 0, width-1, height-1], 
                           radius=height//2, outline=(255, 255, 255, 150), width=2)
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_progress_bar(name, width, height, color):
    """创建进度条"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 背景
    draw.rounded_rectangle([0, 0, width-1, height-1], 
                           radius=height//2, fill=(200, 200, 200, 150))
    
    # 进度
    progress_width = int((width - 8) * 0.7)  # 70%进度
    draw.rounded_rectangle([4, 3, 4+progress_width, height-4], 
                           radius=(height-6)//2, fill=color)
    
    # 边框
    draw.rounded_rectangle([0, 0, width-1, height-1], 
                           radius=height//2, outline=(255, 255, 255, 200), width=2)
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_element_icon(name, size, color, element_name):
    """创建元素图标"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size[0]//2, size[1]//2
    
    # 背景圆形
    draw.ellipse([5, 5, size[0]-5, size[1]-5], fill=color)
    draw.ellipse([5, 5, size[0]-5, size[1]-5], outline=(255, 255, 255, 200), width=3)
    
    # 元素符号
    if element_name == 'fire':
        # 火焰形状
        draw.polygon([
            (cx, 15), (cx+15, 35), (cx+8, 45), (cx, 50), 
            (cx-8, 45), (cx-15, 35)
        ], fill=(255, 255, 255, 230))
    elif element_name == 'water':
        # 水滴形状
        draw.polygon([
            (cx, 12), (cx+18, 30), (cx, 50), (cx-18, 30)
        ], fill=(255, 255, 255, 230))
    elif element_name == 'grass':
        # 叶子形状
        draw.ellipse([cx-8, 10, cx+8, 45], fill=(255, 255, 255, 230))
        draw.line([(cx, 45), (cx, 15)], fill=color, width=2)
    elif element_name == 'light':
        # 光芒
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            x1 = cx + int(12 * math.cos(rad))
            y1 = cy + int(12 * math.sin(rad))
            x2 = cx + int(22 * math.cos(rad))
            y2 = cy + int(22 * math.sin(rad))
            draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 230), width=3)
        draw.ellipse([cx-10, cy-10, cx+10, cy+10], fill=(255, 255, 255, 230))
    elif element_name == 'dark':
        # 月亮形状
        draw.ellipse([cx-5, cy-15, cx+15, cy+15], fill=(255, 255, 255, 230))
        draw.ellipse([cx-2, cy-15, cx+12, cy+15], fill=color)
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def create_star(name, size, filled=True):
    """创建星星图标"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size[0]//2, size[1]//2
    outer_r = min(cx, cy) - 2
    inner_r = outer_r // 2
    
    points = []
    for i in range(10):
        angle = math.radians(i * 36 - 90)
        r = outer_r if i % 2 == 0 else inner_r
        x = cx + int(r * math.cos(angle))
        y = cy + int(r * math.sin(angle))
        points.append((x, y))
    
    color = (255, 193, 7) if filled else (200, 200, 200, 150)
    draw.polygon(points, fill=color, outline=(255, 160, 0) if filled else None, width=2)
    
    img.save(os.path.join(OUTPUT_DIR, f"{name}.png"))
    print(f"Created: {name}.png")

def main():
    """主函数：生成所有UI组件"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 50)
    print("开始生成UI组件...")
    print("=" * 50)
    
    # 1. 按钮
    print("\n[1/7] 生成按钮...")
    create_button('btn_primary', (280, 90), COLORS['primary'])
    create_button('btn_secondary', (240, 80), COLORS['secondary'])
    create_button('btn_accent', (200, 70), COLORS['accent'])
    create_button('btn_danger', (200, 70), (244, 67, 54))
    create_button('btn_close', (60, 60), (158, 158, 158))
    
    # 2. 面板
    print("\n[2/7] 生成面板...")
    create_panel('panel_main', (700, 500), COLORS['white'], COLORS['primary'])
    create_panel('panel_dialog', (600, 400), COLORS['white'], COLORS['secondary'])
    create_panel('panel_tooltip', (300, 150), (50, 50, 50, 230))
    create_panel('panel_card', (220, 280), COLORS['white'])
    
    # 3. 稀有度边框
    print("\n[3/7] 生成稀有度边框...")
    create_rarity_frame('frame_n', (200, 260), COLORS['rarity_n'], 'N')
    create_rarity_frame('frame_r', (200, 260), COLORS['rarity_r'], 'R')
    create_rarity_frame('frame_sr', (200, 260), COLORS['rarity_sr'], 'SR')
    create_rarity_frame('frame_ssr', (200, 260), COLORS['rarity_ssr'], 'SSR')
    
    # 4. 图标
    print("\n[4/7] 生成图标...")
    icons = [
        ('icon_coin', COLORS['accent']),
        ('icon_gem', (33, 150, 243)),
        ('icon_heart', (244, 67, 54)),
        ('icon_energy', (255, 193, 7)),
        ('icon_exp', (156, 39, 176)),
        ('icon_attack', (244, 67, 54)),
        ('icon_defense', (33, 150, 243)),
        ('icon_speed', (76, 175, 80)),
        ('icon_crit', (255, 152, 0)),
        ('icon_skill', (156, 39, 176)),
        ('icon_back', (100, 100, 100)),
        ('icon_menu', (100, 100, 100)),
        ('icon_settings', (100, 100, 100)),
        ('icon_share', (76, 175, 80)),
        ('icon_sound_on', (33, 150, 243)),
        ('icon_sound_off', (158, 158, 158)),
        ('icon_music_on', (156, 39, 176)),
        ('icon_music_off', (158, 158, 158)),
        ('icon_check', (76, 175, 80)),
        ('icon_cross', (244, 67, 54)),
        ('icon_plus', (76, 175, 80)),
        ('icon_minus', (244, 67, 54)),
        ('icon_lock', (158, 158, 158)),
        ('icon_unlock', (76, 175, 80)),
        ('icon_info', (33, 150, 243)),
        ('icon_warning', (255, 152, 0)),
        ('icon_quest', (156, 39, 176)),
        ('icon_gift', (244, 67, 54)),
        ('icon_mail', (33, 150, 243)),
        ('icon_friend', (76, 175, 80)),
    ]
    for name, color in icons:
        create_icon(name, (64, 64), color, 'circle')
    
    # 5. 血条和进度条
    print("\n[5/7] 生成血条和进度条...")
    create_health_bar('health_bar', 300, 24)
    create_health_bar('health_bar_small', 150, 16)
    create_progress_bar('exp_bar', 250, 16, COLORS['accent'])
    create_progress_bar('energy_bar', 200, 20, COLORS['secondary'])
    create_progress_bar('wave_progress', 400, 12, COLORS['primary'])
    
    # 6. 元素图标
    print("\n[6/7] 生成元素图标...")
    create_element_icon('element_fire', (64, 64), COLORS['fire'], 'fire')
    create_element_icon('element_water', (64, 64), COLORS['water'], 'water')
    create_element_icon('element_grass', (64, 64), COLORS['grass'], 'grass')
    create_element_icon('element_light', (64, 64), COLORS['light'], 'light')
    create_element_icon('element_dark', (64, 64), COLORS['dark'], 'dark')
    
    # 7. 星星
    print("\n[7/7] 生成星星...")
    create_star('star_filled', (48, 48), True)
    create_star('star_empty', (48, 48), False)
    create_star('star_small_filled', (32, 32), True)
    create_star('star_small_empty', (32, 32), False)
    
    print("\n" + "=" * 50)
    print("UI组件生成完成！")
    print(f"输出目录: {OUTPUT_DIR}")
    print("=" * 50)

if __name__ == '__main__':
    main()
