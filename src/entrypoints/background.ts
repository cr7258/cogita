import { browser } from "wxt/browser";
import { getApiKey } from "@/lib/storage";

// Define message types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  action: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface SummaryRequest {
  action: string;
  model: string;
  pageContent: string;
  pageTitle: string;
}

interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default defineBackground(() => {
  // @ts-ignore
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: any) => console.error(error));
  
  // Set up content script messaging
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only run once the tab is completely loaded
    if (changeInfo.status === 'complete' && tab.url) {
      // Update the sidepanel with the new page title and favicon
      if (tab.title) {
        // Get favicon URL
        const faviconUrl = tab.favIconUrl || '';
        
        browser.runtime.sendMessage({
          action: 'pageUpdated',
          title: tab.title,
          url: tab.url,
          faviconUrl: faviconUrl
        }).catch(error => console.error('Error sending page update message:', error));
      }
    }
  });

  // Listen for messages from the sidepanel
  browser.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    // Type guard for message
    if (!message || typeof message !== 'object' || !('action' in message)) {
      return true; // Return true even for messages we don't handle
    }
    
    const action = (message as {action: string}).action;
    
    // Handle different action types
    if (action === "chat") {
      // Cast message to our expected type
      const chatRequest = message as ChatRequest;
    
      // Create a promise to handle the async operations
      const handleChatRequest = async () => {
        try {
          const { model, messages } = chatRequest;
          const apiKey = await getApiKey(model);
          
          if (!apiKey) {
            return {
              success: false,
              error: `No API key found for ${model}`,
            };
          }

          // Process based on the model
          let response;
          switch (model) {
            case "DeepSeek":
              response = await callDeepSeekAPI(apiKey, messages);
              break;
            case "Tongyi":
              response = await callTongyiAPI(apiKey, messages);
              break;
            // Add cases for other models as needed
            default:
              return {
                success: false,
                error: `Model ${model} not supported yet`,
              };
          }

          return {
            success: true,
            data: response,
          };
        } catch (error) {
          console.error("Error processing chat request:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      };
      
      // Execute the async function and send response
      handleChatRequest().then(sendResponse);
      
      // Return true to indicate we will send a response asynchronously
      return true;
    } else if (action === "summarize") {
      // Handle summarize request
      const summaryRequest = message as SummaryRequest;
      
      const handleSummaryRequest = async () => {
        try {
          const { model, pageContent, pageTitle } = summaryRequest;
          const apiKey = await getApiKey(model);
          
          if (!apiKey) {
            return {
              success: false,
              error: `No API key found for ${model}`,
            };
          }
          
          // Create a system message instructing the model to summarize with the specified format
          const messages: ChatMessage[] = [
            {
              role: 'system',
              content: `你是一个专业的内容总结助手。请对以下网页内容进行总结，按照指定格式输出，提取关键信息，保持客观。页面标题: ${pageTitle}`
            },
            {
              role: 'user',
              content: `请总结以下网页内容，并按照以下格式输出：

Abstract (摘要)
简洁概括内容的主要观点和结论（不超过200字）。请使用段落格式，保持适当的换行以提高可读性。

Key Points (关键点)
以无序列表形式列出内容中的关键信息点（5-7个要点），每个要点前使用 Markdown 的 "-" 符号：
- 第一个要点
- 第二个要点
（示例格式）

Related Questions (相关问题)
列出3个与内容相关的问题，这些问题应该是读者可能感兴趣的延伸话题，同样使用 Markdown 的 "-" 符号：
- 第一个问题？
- 第二个问题？
（示例格式）

请确保格式严格按照上述三个部分输出，每个部分都要有明确的标题。相关问题部分的问题应该是完整的问句，便于用户点击后直接提问。

网页内容：
${pageContent}`
            }
          ];
          
          // Process based on the model
          let response;
          switch (model) {
            case "DeepSeek":
              response = await callDeepSeekAPI(apiKey, messages);
              break;
            case "Tongyi":
              response = await callTongyiAPI(apiKey, messages);
              break;
            // Add cases for other models as needed
            default:
              return {
                success: false,
                error: `Model ${model} not supported yet`,
              };
          }
          
          return {
            success: true,
            data: response,
          };
        } catch (error) {
          console.error("Error processing summary request:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      };
      
      // Execute the async function and send response
      handleSummaryRequest().then(sendResponse);
      
      // Return true to indicate we will send a response asynchronously
      return true;
    }
    
    // Return true for unhandled message types
    return true;
  });
});

// Function to call DeepSeek API
async function callDeepSeekAPI(apiKey: string, messages: ChatMessage[]): Promise<any> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Use appropriate model ID
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("DeepSeek API error:", error);
    throw error;
  }
}

async function callTongyiAPI(apiKey: string, messages: ChatMessage[]): Promise<any> {
  try {
    const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-turbo", // Using Qwen-Max model
        input: {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Tongyi API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the response to match the expected format
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: data.output?.text || ''
        }
      }]
    };
  } catch (error) {
    console.error("Tongyi API error:", error);
    throw error;
  }
}
