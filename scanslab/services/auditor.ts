import { auditCode } from '../server/services/deepseek';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  messages: ConversationMessage[];
  context?: {
    source?: string;
    businessName?: string;
    industry?: string;
    currentScore?: number;
    url?: string;
  };
  createdAt: Date;
  lastActivity: Date;
}

// In-memory conversation storage (for MVP - would use DB in production)
const conversations: Map<string, Conversation> = new Map();

export class AuditorService {
  static async chat(params: {
    conversationId?: string;
    message: string;
    context?: {
      source?: string;
      businessName?: string;
      industry?: string;
      currentScore?: number;
      url?: string;
    };
  }): Promise<{
    conversationId: string;
    response: string;
    tokensUsed: number;
    analysisData?: {
      issuesFound?: number;
      categories?: string[];
      recommendations?: string[];
    };
  }> {
    // Get or create conversation
    let conversation: Conversation;
    
    if (params.conversationId && conversations.has(params.conversationId)) {
      conversation = conversations.get(params.conversationId)!;
      // Update context if provided
      if (params.context) {
        conversation.context = { ...conversation.context, ...params.context };
      }
    } else {
      // Create new conversation
      const id = this.generateConversationId();
      conversation = {
        id,
        messages: [],
        context: params.context,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      conversations.set(id, conversation);
    }
    
    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: params.message,
      timestamp: new Date()
    });
    
    // Build context string for the AI
    const contextStr = this.buildContextString(conversation);
    
    // Build the full prompt with conversation history
    const fullPrompt = this.buildPrompt(conversation, params.message);
    
    console.log(`[AuditorService] Processing message for conversation: ${conversation.id}`);
    
    try {
      // Call DeepSeek via the existing auditCode function
      const result = await auditCode({
        code: contextStr,
        question: fullPrompt
      });
      
      // Extract structured data from the response
      const analysisData = this.extractAnalysisData(result);
      
      // Add assistant response to history
      conversation.messages.push({
        role: 'assistant',
        content: result.analysis,
        timestamp: new Date()
      });
      
      conversation.lastActivity = new Date();
      conversations.set(conversation.id, conversation);
      
      // Estimate tokens (rough approximation)
      const tokensUsed = Math.ceil(
        (fullPrompt.length + result.analysis.length) / 4
      );
      
      return {
        conversationId: conversation.id,
        response: result.analysis,
        tokensUsed,
        analysisData
      };
      
    } catch (error) {
      console.error('[AuditorService] Error:', error);
      throw error;
    }
  }
  
  private static buildContextString(conversation: Conversation): string {
    const ctx = conversation.context;
    if (!ctx) return '';
    
    const parts: string[] = [];
    
    if (ctx.businessName) {
      parts.push(`Business: ${ctx.businessName}`);
    }
    if (ctx.industry) {
      parts.push(`Industry: ${ctx.industry}`);
    }
    if (ctx.currentScore !== undefined) {
      parts.push(`Current Digital IQ Score: ${ctx.currentScore}/140`);
    }
    if (ctx.url) {
      parts.push(`Website: ${ctx.url}`);
    }
    if (ctx.source) {
      parts.push(`Source: ${ctx.source}`);
    }
    
    return parts.join('\n');
  }
  
  private static buildPrompt(conversation: Conversation, currentMessage: string): string {
    // Include recent conversation history for context
    const recentMessages = conversation.messages.slice(-6); // Last 3 exchanges
    
    let prompt = '';
    
    if (recentMessages.length > 1) {
      prompt += 'Previous conversation:\n';
      for (const msg of recentMessages.slice(0, -1)) { // Exclude current message
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n\n`;
      }
      prompt += '---\n\n';
    }
    
    prompt += `Current question: ${currentMessage}`;
    
    return prompt;
  }
  
  private static extractAnalysisData(result: {
    analysis: string;
    issues: string[];
    suggestions: string[];
  }): {
    issuesFound?: number;
    categories?: string[];
    recommendations?: string[];
  } {
    // Extract categories from the analysis
    const categories: string[] = [];
    const categoryKeywords = [
      'performance', 'security', 'seo', 'accessibility', 
      'mobile', 'content', 'design', 'usability'
    ];
    
    const lowerAnalysis = result.analysis.toLowerCase();
    for (const keyword of categoryKeywords) {
      if (lowerAnalysis.includes(keyword)) {
        categories.push(keyword);
      }
    }
    
    return {
      issuesFound: result.issues.length,
      categories: categories.length > 0 ? categories : undefined,
      recommendations: result.suggestions.length > 0 ? result.suggestions : undefined
    };
  }
  
  private static generateConversationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `conv_${timestamp}_${random}`;
  }
  
  // Cleanup old conversations (call periodically)
  static cleanupOldConversations(maxAgeHours: number = 24): void {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const [id, conv] of conversations.entries()) {
      if (conv.lastActivity.getTime() < cutoff) {
        conversations.delete(id);
        console.log(`[AuditorService] Cleaned up conversation: ${id}`);
      }
    }
  }
}
