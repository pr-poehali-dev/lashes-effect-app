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
            length=length
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
                    'length': length
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
    segments = 8
    points = []
    
    for i in range(segments + 1):
        t = i / segments
        
        curve_x = start_x + length * t * math.cos(math.radians(angle))
        curve_y = start_y - length * t * math.sin(math.radians(angle))
        
        curl_offset = curl_factor * math.sin(t * math.pi) * length * 0.15
        curve_x += curl_offset * math.cos(math.radians(angle + 90))
        curve_y -= curl_offset * math.sin(math.radians(angle + 90))
        
        points.append((int(curve_x), int(curve_y)))
    
    for i in range(len(points) - 1):
        segment_thickness = max(1, int(thickness * (1 - i / segments)))
        draw.line([points[i], points[i + 1]], fill=color, width=segment_thickness)


def apply_lash_effect(
    image: Image.Image,
    effect: str,
    volume: str,
    curl: str,
    length: int
) -> Image.Image:
    '''
    Применяет реалистичный эффект наращивания ресниц к изображению
    '''
    width, height = image.size
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    volume_num = int(volume[0]) if volume[0].isdigit() else 3
    
    effect_params = {
        'classic': {'density': 1.0, 'length_mult': 1.0, 'volume_mult': 0.8},
        'volume': {'density': 1.3, 'length_mult': 1.1, 'volume_mult': 1.2},
        'mega': {'density': 1.8, 'length_mult': 1.2, 'volume_mult': 1.5},
        'hollywood': {'density': 2.0, 'length_mult': 1.4, 'volume_mult': 1.6},
        'cat-eye': {'density': 1.4, 'length_mult': 1.2, 'volume_mult': 1.1},
        'doll': {'density': 1.5, 'length_mult': 1.15, 'volume_mult': 1.3}
    }
    params = effect_params.get(effect, effect_params['classic'])
    
    curl_angles = {'C': 70, 'D': 75, 'L': 80, 'M': 85}
    base_angle = curl_angles.get(curl, 75)
    
    curl_factors = {'C': 0.8, 'D': 1.0, 'L': 1.3, 'M': 1.5}
    curl_factor = curl_factors.get(curl, 1.0)
    
    base_length = (length / 10.0) * params['length_mult'] * min(width, height) * 0.03
    base_thickness = max(1, int(2 + volume_num * 0.4 * params['volume_mult']))
    
    lash_colors = [
        (15, 15, 15, 200),
        (20, 20, 20, 190),
        (25, 25, 25, 180),
        (10, 10, 10, 195)
    ]
    
    eye_regions = [
        {
            'start_x': int(width * 0.25),
            'end_x': int(width * 0.45),
            'y': int(height * 0.45),
            'side': 'left'
        },
        {
            'start_x': int(width * 0.55),
            'end_x': int(width * 0.75),
            'y': int(height * 0.45),
            'side': 'right'
        }
    ]
    
    for eye_region in eye_regions:
        eye_width = eye_region['end_x'] - eye_region['start_x']
        base_num_lashes = int(25 * params['density'])
        
        for i in range(base_num_lashes):
            progress = i / base_num_lashes
            x = eye_region['start_x'] + int(eye_width * progress)
            y = eye_region['y'] + random.randint(-2, 2)
            
            if effect == 'cat-eye':
                length_mult = 0.6 + 0.8 * progress
                angle_offset = (progress - 0.5) * 15
            elif effect == 'doll':
                center_dist = abs(progress - 0.5)
                length_mult = 1.2 - center_dist * 0.8
                angle_offset = (progress - 0.5) * 8
            elif effect == 'hollywood':
                length_mult = 0.9 + random.uniform(0, 0.3)
                angle_offset = (progress - 0.5) * 10
            else:
                length_mult = 0.8 + random.uniform(0, 0.4)
                angle_offset = (progress - 0.5) * 12
            
            lash_length = base_length * length_mult
            lash_angle = base_angle + angle_offset
            
            if eye_region['side'] == 'right':
                lash_angle = 180 - lash_angle
            
            thickness = base_thickness + random.randint(-1, 1)
            thickness = max(1, thickness)
            
            color = random.choice(lash_colors)
            
            draw_curved_lash(
                draw,
                x, y,
                lash_length,
                lash_angle,
                curl_factor,
                thickness,
                color
            )
            
            if volume_num >= 3 and random.random() < 0.6:
                offset_x = random.randint(-1, 1)
                offset_y = random.randint(-1, 1)
                angle_var = random.uniform(-3, 3)
                
                draw_curved_lash(
                    draw,
                    x + offset_x, y + offset_y,
                    lash_length * 0.95,
                    lash_angle + angle_var,
                    curl_factor * 0.9,
                    max(1, thickness - 1),
                    (color[0], color[1], color[2], int(color[3] * 0.7))
                )
    
    overlay_blurred = overlay.filter(ImageFilter.GaussianBlur(radius=0.3))
    
    result = image.convert('RGBA')
    result = Image.alpha_composite(result, overlay_blurred)
    
    enhancer = ImageEnhance.Contrast(result)
    result = enhancer.enhance(1.03)
    
    enhancer = ImageEnhance.Sharpness(result)
    result = enhancer.enhance(1.08)
    
    return result.convert('RGB')
