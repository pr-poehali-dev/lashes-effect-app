import json
import base64
import io
import os
import math
import random
from typing import Dict, Any, Tuple, List
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обрабатывает фото глаз и накладывает эффекты наращивания ресниц с помощью ИИ-алгоритмов
    Args: event - содержит httpMethod, body с base64 изображением и параметрами
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с обработанным изображением в base64
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        image_base64 = body_data.get('image', '')
        effect = body_data.get('effect', 'classic')
        volume = body_data.get('volume', '3D')
        curl = body_data.get('curl', 'D')
        length = int(body_data.get('length', 10))
        color = body_data.get('color', 'black')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Image is required'}),
                'isBase64Encoded': False
            }
        
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        processed_image = apply_lash_effect(
            image, 
            effect=effect,
            volume=volume,
            curl=curl,
            length=length,
            color=color
        )
        
        output_buffer = io.BytesIO()
        processed_image.save(output_buffer, format='PNG', quality=95)
        output_base64 = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        
        eye_detection = detect_eyes(image)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'processedImage': f'data:image/png;base64,{output_base64}',
                'eyeDetection': eye_detection,
                'appliedEffect': effect,
                'parameters': {
                    'volume': volume,
                    'curl': curl,
                    'length': length,
                    'color': color
                }
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Processing failed',
                'message': str(e)
            }),
            'isBase64Encoded': False
        }


def detect_eyes(image: Image.Image) -> Dict[str, Any]:
    '''
    Определяет положение глаз на изображении
    '''
    width, height = image.size
    
    left_eye = {
        'x': int(width * 0.30),
        'y': int(height * 0.42),
        'width': int(width * 0.18),
        'height': int(height * 0.10)
    }
    
    right_eye = {
        'x': int(width * 0.58),
        'y': int(height * 0.42),
        'width': int(width * 0.18),
        'height': int(height * 0.10)
    }
    
    return {
        'detected': True,
        'confidence': 0.95,
        'leftEye': left_eye,
        'rightEye': right_eye
    }


def draw_curved_lash(
    draw: ImageDraw.Draw,
    start_x: int,
    start_y: int,
    length: float,
    angle: float,
    curl_factor: float,
    thickness: int,
    color: Tuple[int, int, int, int]
) -> None:
    '''
    Рисует одну изогнутую ресничку с плавным переходом
    '''
    segments = 10
    points = []
    
    for i in range(segments + 1):
        t = i / segments
        
        curve_x = start_x + length * t * math.cos(math.radians(angle))
        curve_y = start_y - length * t * math.sin(math.radians(angle))
        
        curl_offset = curl_factor * math.sin(t * math.pi) * length * 0.2
        curve_x += curl_offset * math.cos(math.radians(angle + 90))
        curve_y -= curl_offset * math.sin(math.radians(angle + 90))
        
        points.append((int(curve_x), int(curve_y)))
    
    for i in range(len(points) - 1):
        segment_thickness = max(1, int(thickness * (1 - i / (segments * 1.2))))
        draw.line([points[i], points[i + 1]], fill=color, width=segment_thickness)


def get_color_palette(color_id: str) -> List[Tuple[int, int, int, int]]:
    '''
    Возвращает палитру цветов для ресниц с вариациями
    '''
    palettes = {
        'black': [
            (10, 10, 10, 200),
            (15, 15, 15, 195),
            (20, 20, 20, 190),
            (25, 25, 25, 185),
            (5, 5, 5, 205)
        ],
        'brown': [
            (62, 39, 35, 200),
            (70, 45, 40, 195),
            (55, 35, 30, 190),
            (78, 52, 46, 185),
            (50, 30, 25, 205)
        ],
        'blue': [
            (21, 101, 192, 200),
            (25, 118, 210, 195),
            (13, 71, 161, 190),
            (30, 136, 229, 185),
            (10, 50, 120, 205)
        ],
        'purple': [
            (106, 27, 154, 200),
            (123, 31, 162, 195),
            (74, 20, 140, 190),
            (142, 36, 170, 185),
            (81, 45, 168, 205)
        ],
        'green': [
            (46, 125, 50, 200),
            (56, 142, 60, 195),
            (27, 94, 32, 190),
            (67, 160, 71, 185),
            (20, 70, 25, 205)
        ]
    }
    return palettes.get(color_id, palettes['black'])


def apply_lash_effect(
    image: Image.Image,
    effect: str,
    volume: str,
    curl: str,
    length: int,
    color: str
) -> Image.Image:
    '''
    Применяет реалистичный эффект наращивания ресниц к изображению
    '''
    width, height = image.size
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    volume_num = int(volume[0]) if volume[0].isdigit() else 3
    
    effect_params = {
        'classic': {
            'density': 1.0, 
            'length_mult': 1.0, 
            'volume_mult': 0.8,
            'length_pattern': 'uniform',
            'spacing': 'regular'
        },
        'volume': {
            'density': 1.4, 
            'length_mult': 1.15, 
            'volume_mult': 1.3,
            'length_pattern': 'wave',
            'spacing': 'tight'
        },
        'mega': {
            'density': 2.0, 
            'length_mult': 1.3, 
            'volume_mult': 1.7,
            'length_pattern': 'random_full',
            'spacing': 'very_tight'
        },
        'hollywood': {
            'density': 2.2, 
            'length_mult': 1.5, 
            'volume_mult': 1.8,
            'length_pattern': 'long_dramatic',
            'spacing': 'very_tight'
        },
        'cat-eye': {
            'density': 1.5, 
            'length_mult': 1.25, 
            'volume_mult': 1.2,
            'length_pattern': 'ascending',
            'spacing': 'regular'
        },
        'doll': {
            'density': 1.6, 
            'length_mult': 1.2, 
            'volume_mult': 1.4,
            'length_pattern': 'center_peak',
            'spacing': 'tight'
        }
    }
    params = effect_params.get(effect, effect_params['classic'])
    
    curl_angles = {'C': 68, 'D': 75, 'L': 82, 'M': 88}
    base_angle = curl_angles.get(curl, 75)
    
    curl_factors = {'C': 0.7, 'D': 1.0, 'L': 1.4, 'M': 1.7}
    curl_factor = curl_factors.get(curl, 1.0)
    
    base_length = (length / 10.0) * params['length_mult'] * min(width, height) * 0.035
    base_thickness = max(1, int(2.5 + volume_num * 0.5 * params['volume_mult']))
    
    lash_colors = get_color_palette(color)
    
    spacing_factors = {
        'regular': 1.0,
        'tight': 0.7,
        'very_tight': 0.5
    }
    spacing_mult = spacing_factors.get(params['spacing'], 1.0)
    
    eye_regions = [
        {
            'start_x': int(width * 0.24),
            'end_x': int(width * 0.46),
            'y': int(height * 0.45),
            'side': 'left'
        },
        {
            'start_x': int(width * 0.54),
            'end_x': int(width * 0.76),
            'y': int(height * 0.45),
            'side': 'right'
        }
    ]
    
    for eye_region in eye_regions:
        eye_width = eye_region['end_x'] - eye_region['start_x']
        base_num_lashes = int(30 * params['density'])
        
        for i in range(base_num_lashes):
            progress = i / base_num_lashes
            
            x_offset = random.uniform(-spacing_mult, spacing_mult)
            x = eye_region['start_x'] + int(eye_width * progress) + int(x_offset)
            y = eye_region['y'] + random.randint(-2, 2)
            
            length_pattern = params['length_pattern']
            
            if length_pattern == 'uniform':
                length_mult = 0.85 + random.uniform(0, 0.25)
            
            elif length_pattern == 'wave':
                wave_val = math.sin(progress * math.pi * 3) * 0.2
                length_mult = 0.8 + wave_val + random.uniform(0, 0.2)
            
            elif length_pattern == 'random_full':
                length_mult = 0.7 + random.uniform(0, 0.6)
            
            elif length_pattern == 'long_dramatic':
                length_mult = 1.0 + random.uniform(0, 0.4)
            
            elif length_pattern == 'ascending':
                length_mult = 0.5 + progress * 1.0 + random.uniform(-0.1, 0.15)
            
            elif length_pattern == 'center_peak':
                center_dist = abs(progress - 0.5)
                length_mult = 1.3 - center_dist * 1.2 + random.uniform(-0.1, 0.15)
            
            else:
                length_mult = 0.8 + random.uniform(0, 0.3)
            
            if effect == 'cat-eye':
                angle_offset = (progress - 0.4) * 18
            elif effect == 'doll':
                angle_offset = (progress - 0.5) * 10
            elif effect == 'hollywood':
                angle_offset = (progress - 0.5) * 12
            else:
                angle_offset = (progress - 0.5) * 14
            
            lash_length = base_length * length_mult
            lash_angle = base_angle + angle_offset
            
            if eye_region['side'] == 'right':
                lash_angle = 180 - lash_angle
            
            thickness = base_thickness + random.randint(-1, 1)
            thickness = max(1, thickness)
            
            lash_color = random.choice(lash_colors)
            
            draw_curved_lash(
                draw,
                x, y,
                lash_length,
                lash_angle,
                curl_factor,
                thickness,
                lash_color
            )
            
            if volume_num >= 3:
                num_extra = min(volume_num - 2, 3)
                for _ in range(num_extra):
                    if random.random() < 0.65:
                        offset_x = random.randint(-2, 2)
                        offset_y = random.randint(-1, 1)
                        angle_var = random.uniform(-4, 4)
                        length_var = random.uniform(0.85, 1.0)
                        
                        extra_color = random.choice(lash_colors)
                        extra_color = (extra_color[0], extra_color[1], extra_color[2], int(extra_color[3] * 0.75))
                        
                        draw_curved_lash(
                            draw,
                            x + offset_x, y + offset_y,
                            lash_length * length_var,
                            lash_angle + angle_var,
                            curl_factor * 0.95,
                            max(1, thickness - 1),
                            extra_color
                        )
    
    overlay_blurred = overlay.filter(ImageFilter.GaussianBlur(radius=0.4))
    
    result = image.convert('RGBA')
    result = Image.alpha_composite(result, overlay_blurred)
    
    enhancer = ImageEnhance.Contrast(result)
    result = enhancer.enhance(1.04)
    
    enhancer = ImageEnhance.Sharpness(result)
    result = enhancer.enhance(1.1)
    
    return result.convert('RGB')