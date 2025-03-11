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
          
          // Create a system message instructing the model to summarize
          const messages: ChatMessage[] = [
            {
              role: 'system',
              content: `你是一个专业的内容总结助手。请对以下网页内容进行简洁的总结，提取关键信息，保持客观。页面标题: ${pageTitle}`
            },
            {
              role: 'user',
              content: `请总结以下网页内容（不超过300字）:\n\n${pageContent}`
            }
          ];
          
          // Process based on the model
          let response;
          switch (model) {
            case "DeepSeek":
              response = await callDeepSeekAPI(apiKey, messages);
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
