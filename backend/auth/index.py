'''
Business: User authentication - register, login with email/password
Args: event with httpMethod, body; context with request_id
Returns: HTTP response with user data or error
'''

import json
import os
import hashlib
import secrets
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return pwd_hash.hex(), salt

def verify_password(password: str, pwd_hash: str, salt: str) -> bool:
    computed_hash, _ = hash_password(password, salt)
    return computed_hash == pwd_hash

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            if action == 'register':
                email = body_data.get('email', '').lower().strip()
                password = body_data.get('password', '')
                name = body_data.get('name', '')
                
                if not email or not password or not name:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Все поля обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email уже используется'}),
                        'isBase64Encoded': False
                    }
                
                pwd_hash, salt = hash_password(password)
                
                cur.execute(
                    "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, email, name, avatar_url",
                    (email, f"{pwd_hash}:{salt}", name)
                )
                user = dict(cur.fetchone())
                conn.commit()
                
                token = secrets.token_urlsafe(32)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'user': user, 'token': token}),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                email = body_data.get('email', '').lower().strip()
                password = body_data.get('password', '')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("SELECT id, email, name, avatar_url, password_hash FROM users WHERE email = %s", (email,))
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
                
                user = dict(user)
                stored_hash = user.pop('password_hash')
                pwd_hash, salt = stored_hash.split(':')
                
                if not verify_password(password, pwd_hash, salt):
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("UPDATE users SET is_online = true, last_seen = CURRENT_TIMESTAMP WHERE id = %s", (user['id'],))
                conn.commit()
                
                token = secrets.token_urlsafe(32)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'user': user, 'token': token}),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'}),
                    'isBase64Encoded': False
                }
        
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }