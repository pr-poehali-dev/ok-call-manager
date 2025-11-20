-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    is_group BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS chat_members (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    user_id INTEGER REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
