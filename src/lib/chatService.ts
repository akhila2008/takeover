import { supabase } from './supabaseClient';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  hasChart?: boolean; // UI specific, not usually saved in DB but we can keep it
}

export interface Conversation {
  id: string;
  user_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Fallback Local Storage keys
const LOCAL_CONV_KEY = 'takeover_local_conversations';
const LOCAL_MSG_KEY = 'takeover_local_messages';

const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';
};

export const getLocalConversations = (): Conversation[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_CONV_KEY) || '[]'); } catch { return []; }
};

const getLocalMessages = (): ChatMessage[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_MSG_KEY) || '[]'); } catch { return []; }
};

const saveLocalConversations = (convos: Conversation[]) => {
  localStorage.setItem(LOCAL_CONV_KEY, JSON.stringify(convos));
};

const saveLocalMessages = (msgs: ChatMessage[]) => {
  localStorage.setItem(LOCAL_MSG_KEY, JSON.stringify(msgs));
};

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, updated_at, created_at, user_id')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        return getLocalConversations();
      }
      return data || [];
    }
    return getLocalConversations().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async createConversation(title: string = 'New Conversation'): Promise<Conversation> {
    const newConvo: Conversation = {
      id: crypto.randomUUID(),
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        newConvo.user_id = userData.user.id;
      }
      
      const { data, error } = await supabase
        .from('conversations')
        .insert(newConvo)
        .select()
        .single();
        
      if (!error && data) return data;
      console.error('Error creating conversation in Supabase:', error);
    }
    
    const local = getLocalConversations();
    saveLocalConversations([newConvo, ...local]);
    return newConvo;
  },

  async updateConversationTitle(id: string, title: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) return;
    }
    
    const local = getLocalConversations();
    const updated = local.map(c => c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c);
    saveLocalConversations(updated);
  },

  async deleteConversation(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('conversations').delete().eq('id', id);
      if (!error) return;
    }
    
    saveLocalConversations(getLocalConversations().filter(c => c.id !== id));
    saveLocalMessages(getLocalMessages().filter(m => m.conversation_id !== id));
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (!error && data) return data;
    }
    
    return getLocalMessages()
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async saveMessage(message: Omit<ChatMessage, 'created_at' | 'id'>): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(newMsg)
        .select()
        .single();
        
      if (!error && data) {
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', message.conversation_id);
        return data;
      }
    }
    
    const localMsgs = getLocalMessages();
    saveLocalMessages([...localMsgs, newMsg]);
    
    const localConvos = getLocalConversations();
    saveLocalConversations(localConvos.map(c => c.id === message.conversation_id ? { ...c, updated_at: new Date().toISOString() } : c));
    
    return newMsg;
  }
};
