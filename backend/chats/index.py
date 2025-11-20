'''
Business: Chat operations - get user chats, send messages, get chat history
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with chats or messages data
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

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
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            chat_id = params.get('chat_id')
            
            if chat_id:
                cur.execute("""
                    SELECT m.id, m.text, m.created_at, m.user_id,
                           u.name as user_name, u.avatar_url as user_avatar
                    FROM messages m
                    JOIN users u ON m.user_id = u.id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at ASC
                """, (chat_id,))
                messages = [dict(row) for row in cur.fetchall()]
                
                for msg in messages:
                    msg['created_at'] = msg['created_at'].isoformat() if msg['created_at'] else None
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'messages': messages}),
                    'isBase64Encoded': False
                }
            else:
                cur.execute("""
                    SELECT c.id, c.name, c.is_group, c.avatar_url,
                           (SELECT m.text FROM messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                           (SELECT m.created_at FROM messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time,
                           (SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id AND m.user_id != %s 
                            AND m.created_at > COALESCE((SELECT last_seen FROM users WHERE id = %s), '1970-01-01')) as unread_count
                    FROM chats c
                    JOIN chat_members cm ON c.id = cm.chat_id
                    WHERE cm.user_id = %s
                    ORDER BY last_message_time DESC NULLS LAST
                """, (user_id, user_id, user_id))
                chats = [dict(row) for row in cur.fetchall()]
                
                for chat in chats:
                    if chat['last_message_time']:
                        chat['last_message_time'] = chat['last_message_time'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'chats': chats}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'send_message':
                chat_id = body_data.get('chat_id')
                text = body_data.get('text', '').strip()
                
                if not chat_id or not text:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'chat_id и text обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "INSERT INTO messages (chat_id, user_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                    (chat_id, user_id, text)
                )
                message = dict(cur.fetchone())
                conn.commit()
                
                message['created_at'] = message['created_at'].isoformat()
                message['user_id'] = int(user_id)
                message['text'] = text
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': message}),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_chat':
                other_user_id = body_data.get('other_user_id')
                
                if not other_user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'other_user_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("INSERT INTO chats (is_group) VALUES (false) RETURNING id")
                chat = dict(cur.fetchone())
                chat_id = chat['id']
                
                cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)",
                           (chat_id, user_id, chat_id, other_user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'chat_id': chat_id}),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неизвестное действие'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
