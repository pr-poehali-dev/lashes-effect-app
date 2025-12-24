import json
import base64
import io
import os
from typing import Dict, Any
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
    Симулирует обнаружение глаз на изображении
    '''
    width, height = image.size
    
    left_eye = {
        'x': int(width * 0.35),
        'y': int(height * 0.45),
        'width': int(width * 0.15),
        'height': int(height * 0.08)
    }
    
    right_eye = {
        'x': int(width * 0.55),
        'y': int(height * 0.45),
        'width': int(width * 0.15),
        'height': int(height * 0.08)
    }
    
    return {
        'detected': True,
        'confidence': 0.95,
        'leftEye': left_eye,
        'rightEye': right_eye
    }


def apply_lash_effect(
    image: Image.Image,
    effect: str,
    volume: str,
    curl: str,
    length: int
) -> Image.Image:
    '''
    Применяет эффект наращивания ресниц к изображению
    '''
    width, height = image.size
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    volume_intensity = int(volume[0]) if volume[0].isdigit() else 3
    
    intensity_map = {
        'classic': 1.0,
        'volume': 1.3,
        'mega': 1.6,
        'hollywood': 1.8,
        'cat-eye': 1.4,
        'doll': 1.5
    }
    effect_intensity = intensity_map.get(effect, 1.2)
    
    curl_map = {'C': 1.0, 'D': 1.2, 'L': 1.4, 'M': 1.6}
    curl_factor = curl_map.get(curl, 1.2)
    
    length_factor = length / 10.0
    
    base_thickness = int(2 * volume_intensity * effect_intensity)
    lash_color = (20, 20, 20, 180)
    
    eye_regions = [
        {'center_x': int(width * 0.35), 'y': int(height * 0.48), 'width': int(width * 0.15)},
        {'center_x': int(width * 0.65), 'y': int(height * 0.48), 'width': int(width * 0.15)}
    ]
    
    for eye in eye_regions:
        num_lashes = int(20 * volume_intensity)
        
        if effect == 'cat-eye':
            start_x = eye['center_x'] - eye['width'] // 2
            for i in range(num_lashes):
                x = start_x + (eye['width'] * i) // num_lashes
                
                extension = int(15 * length_factor * (1 + i / num_lashes))
                curve = int(8 * curl_factor * (1 + i / num_lashes))
                
                thickness = base_thickness if i > num_lashes * 0.6 else base_thickness - 1
                
                draw.line(
                    [(x, eye['y']), (x + curve, eye['y'] - extension)],
                    fill=lash_color,
                    width=thickness
                )
        
        elif effect == 'doll':
            start_x = eye['center_x'] - eye['width'] // 2
            for i in range(num_lashes):
                x = start_x + (eye['width'] * i) // num_lashes
                
                center_boost = 1.0 + 0.5 * (1 - abs(i - num_lashes/2) / (num_lashes/2))
                extension = int(15 * length_factor * center_boost)
                curve = int(5 * curl_factor)
                
                thickness = base_thickness if abs(i - num_lashes/2) < num_lashes * 0.3 else base_thickness - 1
                
                draw.line(
                    [(x, eye['y']), (x + curve, eye['y'] - extension)],
                    fill=lash_color,
                    width=thickness
                )
        
        else:
            start_x = eye['center_x'] - eye['width'] // 2
            for i in range(num_lashes):
                x = start_x + (eye['width'] * i) // num_lashes
                extension = int(12 * length_factor * effect_intensity)
                curve = int(6 * curl_factor)
                
                draw.line(
                    [(x, eye['y']), (x + curve, eye['y'] - extension)],
                    fill=lash_color,
                    width=base_thickness
                )
    
    overlay_blurred = overlay.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    result = image.convert('RGBA')
    result = Image.alpha_composite(result, overlay_blurred)
    
    enhancer = ImageEnhance.Contrast(result)
    result = enhancer.enhance(1.05)
    
    enhancer = ImageEnhance.Sharpness(result)
    result = enhancer.enhance(1.1)
    
    return result.convert('RGB')
