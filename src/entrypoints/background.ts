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

interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default defineBackground(() => {
  // @ts-ignore
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: any) => console.error(error));

  // Listen for messages from the sidepanel
  browser.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    // Type guard for message
    if (!message || typeof message !== 'object' || !('action' in message) || message.action !== "chat") {
      return true; // Return true even for messages we don't handle
    }
    
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
