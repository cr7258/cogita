"use client"

import React, { useState, useEffect } from "react"
import {
  BookOpen,
  ChevronDown,
  Clock,
  Gift,
  HelpCircle,
  Mic,
  Paperclip,
  Scissors,
  Send,
  Settings,
  Sparkles,
  Plus,
  Heart,
  Mail,
  Bookmark,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { browser } from "wxt/browser"
import { getApiKey } from "@/lib/storage"

// Define response interface
interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function App() {
  const [inputValue, setInputValue] = useState("")
  const [selectedModel, setSelectedModel] = useState("DeepSeek")
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [currentPageTitle, setCurrentPageTitle] = useState("当前页面")
  const [currentPageUrl, setCurrentPageUrl] = useState("")
  const [faviconUrl, setFaviconUrl] = useState("")
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant' | 'system', content: string}>>([]) 
  const [isLoading, setIsLoading] = useState(false)
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const models = [
    {
      name: "OpenAI",
      color: "bg-[#10a37f]",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.051 6.051 0 0 0 6.0572-4.2218 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7378-7.0569zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5093-2.6067-1.4997z"
            fill="#fff"
          />
        </svg>
      ),
    },
    {
      name: "Claude",
      color: "bg-[#6f42c1]",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 2 12ZM12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4Z"
            fill="white"
          />
          <path
            d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12C18 8.686 15.314 6 12 6ZM12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8Z"
            fill="white"
          />
          <path
            d="M12 10C10.895 10 10 10.895 10 12C10 13.105 10.895 14 12 14C13.105 14 14 13.105 14 12C14 10.895 13.105 10 12 10Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      name: "DeepSeek",
      color: "bg-[#0284c7]",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
          <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="white" />
          <path d="M12 12V22M12 12L2 7M12 12L22 7" stroke="white" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      name: "Tongyi",
      color: "bg-[#FF6A00]",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
          <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="white" />
          <circle cx="12" cy="12" r="4" fill="white" />
        </svg>
      ),
    },
    {
      name: "Gemini",
      color: "bg-[#1e3a8a]",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 2H4C2.895 2 2 2.895 2 4V9C2 10.105 2.895 11 4 11H9C10.105 11 11 10.105 11 9V4C11 2.895 10.105 2 9 2Z"
            fill="#EA4335"
          />
          <path
            d="M20 2H15C13.895 2 13 2.895 13 4V9C13 10.105 13.895 11 15 11H20C21.105 11 22 10.105 22 9V4C22 2.895 21.105 2 20 2Z"
            fill="#4285F4"
          />
          <path
            d="M9 13H4C2.895 13 2 13.895 2 15V20C2 21.105 2.895 22 4 22H9C10.105 22 11 21.105 11 20V15C11 13.895 10.105 13 9 13Z"
            fill="#34A853"
          />
          <path
            d="M20 13H15C13.895 13 13 13.895 13 15V20C13 21.105 13.895 22 15 22H20C21.105 22 22 21.105 22 20V15C22 13.895 21.105 13 20 13Z"
            fill="#FBBC05"
          />
        </svg>
      ),
    },
  ]

  const toggleModelDropdown = () => {
    setIsModelDropdownOpen(!isModelDropdownOpen)
  }

  const selectModel = (model: string) => {
    setSelectedModel(model)
    setIsModelDropdownOpen(false)
  }

  // Function to extract content from the current page and generate a summary
  const handleGenerateSummary = async () => {
    if (isSummarizing || isApiKeyMissing) return;
    
    setIsSummarizing(true);
    setShowSummary(true);
    
    try {
      // Get the current active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) {
        throw new Error('No active tab found');
      }
      
      // Execute script to get page content
      const results = await browser.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // Extract text content from the page
          const getVisibleText = () => {
            // Get all text nodes in the body
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            let text = '';
            let node;
            while (node = walker.nextNode()) {
              // Skip hidden elements
              const element = node.parentElement;
              if (element && 
                  window.getComputedStyle(element).display !== 'none' && 
                  window.getComputedStyle(element).visibility !== 'hidden') {
                text += node.nodeValue + ' ';
              }
            }
            
            // Clean up text
            return text
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 10000); // Limit to 10000 characters
          };
          
          return getVisibleText();
        }
      });
      
      // Extract the page content from the results
      const pageContent = results[0]?.result || '';
      
      if (!pageContent) {
        throw new Error('Could not extract page content');
      }
      
      // Send the content to the background script for summarization
      const response = await browser.runtime.sendMessage({
        action: 'summarize',
        model: selectedModel,
        pageContent,
        pageTitle: currentPageTitle
      }) as ChatResponse;
      
      if (response && response.success) {
        // Extract the summary from the response
        const summaryText = response.data?.choices?.[0]?.message?.content || '无法生成摘要';
        setSummary(summaryText);
        
        // Add the summary as a message in the chat history
        const summaryMessage: {role: 'user' | 'assistant' | 'system', content: string} = {
          role: 'assistant',
          content: `好的，请看摘要如下：\n\n${summaryText}`
        };
        setMessages(prevMessages => [...prevMessages, summaryMessage]);
      } else {
        throw new Error(response?.error || '生成摘要时出错');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary(`错误: ${error instanceof Error ? error.message : '生成摘要时出错'}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Function to handle clicking on a related question
  const handleRelatedQuestionClick = (question: string) => {
    // Keep the summary visible (don't hide it)
    // setShowSummary(false); -- Removed this line to keep summary visible
    
    // Send the question directly to the LLM without showing in input
    const userMessage: {role: 'user' | 'assistant' | 'system', content: string} = { 
      role: 'user', 
      content: question 
    };
    
    // Add the message to the chat history
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    // Define the response type
    type ChatResponse = {
      success: boolean;
      data?: {
        choices?: Array<{
          message?: {role: 'user' | 'assistant' | 'system', content: string}
        }>
      };
      error?: string;
    };
    
    // Send the message to the background script
    browser.runtime.sendMessage({
      action: 'chat',
      model: selectedModel,
      messages: [...messages, userMessage],
    }).then((response: unknown) => {
      // Cast the response to our expected type
      const typedResponse = response as ChatResponse;
      if (typedResponse && typedResponse.success) {
        // Add the assistant's response to the chat
        const assistantMessage: {role: 'user' | 'assistant' | 'system', content: string} = 
          typedResponse.data?.choices?.[0]?.message || 
          { role: 'assistant', content: '无法获取回复' };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        // Handle error
        const errorMessage: {role: 'user' | 'assistant' | 'system', content: string} = { 
          role: 'assistant', 
          content: `错误: ${typedResponse?.error || '发送消息时出错'}` 
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
      // Reset loading state
      setIsLoading(false);
    }).catch(error => {
      console.error('Error sending message:', error);
      const errorMessage: {role: 'user' | 'assistant' | 'system', content: string} = { 
        role: 'assistant', 
        content: `错误: ${error instanceof Error ? error.message : '发送消息时出错'}` 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
    });
  };

  // Function to parse and render the structured summary
  const renderStructuredSummary = (summaryText: string) => {
    // Split the summary into sections
    const abstractMatch = summaryText.match(/Abstract \(摘要\)(.*?)(?=Key Points|$)/s);
    const keyPointsMatch = summaryText.match(/Key Points \(关键点\)(.*?)(?=Related Questions|$)/s);
    const relatedQuestionsMatch = summaryText.match(/Related Questions \(相关问题\)(.*?)$/s);
    
    return (
      <div className="space-y-6 px-1">
        {/* Abstract Section */}
        {abstractMatch && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Abstract (摘要)</h3>
            <div className="prose prose-sm max-w-none">
              {abstractMatch[1].trim().split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index} className="mb-2">{paragraph.trim()}</p> : null
              ))}
            </div>
          </div>
        )}
        
        {/* Key Points Section */}
        {keyPointsMatch && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Key Points (关键点)</h3>
            <ul className="list-disc pl-5 space-y-1">
              {keyPointsMatch[1].trim().split('\n')
                .filter(point => point.trim())
                .map((point, index) => (
                  <li key={index} className="mb-1">
                    {point.trim().replace(/^[-•]\s*/, '')}
                  </li>
                ))}
            </ul>
          </div>
        )}
        
        {/* Related Questions Section */}
        {relatedQuestionsMatch && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Related Questions (相关问题)</h3>
            <ul className="list-disc pl-5 space-y-2">
              {relatedQuestionsMatch[1].trim().split('\n')
                .filter(question => question.trim())
                .map((question, index) => {
                  const cleanedQuestion = question.trim().replace(/^[-•]\s*/, '');
                  if (!cleanedQuestion) return null;
                  
                  return (
                    <li 
                      key={index} 
                      className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                      onClick={() => handleRelatedQuestionClick(cleanedQuestion)}
                    >
                      {cleanedQuestion}
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const updatePageTitle = (title: string) => {
    setCurrentPageTitle(title)
  }

  // Check if API key is available for the selected model
  useEffect(() => {
    const checkApiKey = async () => {
      const apiKey = await getApiKey(selectedModel)
      setIsApiKeyMissing(!apiKey)
    }
    
    checkApiKey()
  }, [selectedModel])
  
  // Function to truncate title to fit on one line
  const truncateTitle = (title: string): string => {
    // Limit title to a reasonable length (around 25-30 characters)
    const maxLength = 30;
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };
  
  // Listen for page updates from background script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message && message.action === 'pageUpdated') {
        const title = message.title || '当前页面';
        setCurrentPageTitle(truncateTitle(title));
        setCurrentPageUrl(message.url || '');
        setFaviconUrl(message.faviconUrl || '');
        // Reset summary when page changes
        setSummary(null);
        setShowSummary(false);
      }
      return true;
    };

    // Add listener for messages from background script
    browser.runtime.onMessage.addListener(handleMessage);

    // Get current tab information on initial load
    const getCurrentTab = async () => {
      try {
        // Get the current active tab
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          const title = tabs[0].title || '当前页面';
          setCurrentPageTitle(truncateTitle(title));
          setCurrentPageUrl(tabs[0].url || '');
          setFaviconUrl(tabs[0].favIconUrl || '');
        }
      } catch (error) {
        console.error('Error getting current tab:', error);
      }
    };

    getCurrentTab();

    // Clean up listener when component unmounts
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, [])
  
  // Handle sending a message to the AI model
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isApiKeyMissing || isLoading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Send message to background script
      const response = await browser.runtime.sendMessage({
        action: 'chat',
        model: selectedModel,
        messages: [...messages, userMessage],
      }) as ChatResponse;
      
      if (response && response.success) {
        // Extract the assistant's message from the API response
        let assistantMessage;
        
        if (selectedModel === 'DeepSeek' && response.data?.choices?.[0]?.message?.content) {
          assistantMessage = {
            role: 'assistant' as const,
            content: response.data.choices[0].message.content,
          };
        } else {
          // Default fallback
          assistantMessage = {
            role: 'assistant' as const,
            content: response.data?.content || '抱歉，我无法处理这个请求。',
          };
        }
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle error
        const errorMessage = {
          role: 'assistant' as const,
          content: `错误: ${response?.error || '未知错误'}`,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage = {
        role: 'assistant' as const,
        content: `错误: ${error instanceof Error ? error.message : '发送消息时出错'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Enter key press to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Find the currently selected model
  const currentModel = models.find((model) => model.name === selectedModel) || models[0]

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-auto px-4 pt-4">
        {messages.length === 0 ? (
          /* Initial Welcome Message */
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <div className="text-gray-800 space-y-2">
                <p className="text-3xl font-bold">你好,</p>
                <p className="text-2xl">我今天能帮你什么？</p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 ${
                    message.role === 'user' 
                      ? 'bg-gray-100 text-gray-800 rounded-2xl' 
                      : 'text-gray-800'
                  }`}
                >
                  {message.content.includes('Abstract (摘要)') ? (
                    renderStructuredSummary(message.content.replace('好的，请看摘要如下：\n\n', ''))
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* API Key Missing Warning */}
        {isApiKeyMissing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-700">未设置 {selectedModel} API 密钥</p>
              <p className="text-xs text-yellow-600 mt-1">请在设置页面配置 API 密钥以使用此功能。</p>
            </div>
          </div>
        )}
        
        {/* Summary loading indicator */}
        {showSummary && isSummarizing && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 text-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Button */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-gray-50 overflow-hidden">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt="Page favicon" 
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    // If favicon fails to load, show default icon
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.style.display = 'none';
                    
                    // Find the fallback icon and display it
                    const parent = imgElement.parentElement;
                    if (parent) {
                      const fallbackIcon = parent.querySelector('svg[data-fallback="true"]') as HTMLElement;
                      if (fallbackIcon) {
                        fallbackIcon.style.display = 'block';
                      }
                    }
                  }}
                />
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-600"
                >
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              )}
              <svg 
                style={{display: 'none'}}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
                data-fallback="true"
              >
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </div>
            <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis block max-w-[180px]">{currentPageTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-2.5 py-1 ${isSummarizing || isApiKeyMissing ? 'text-gray-300 cursor-not-allowed' : 'text-purple-500 hover:text-purple-600 hover:bg-purple-50 cursor-pointer'} rounded-full transition-all duration-300 text-[13px] font-medium group relative overflow-hidden`}
              onClick={handleGenerateSummary}
              disabled={isSummarizing || isApiKeyMissing}
            >
              <span className="relative z-10 flex items-center gap-1">
                {isSummarizing ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在总结
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    总结
                  </>
                )}
              </span>
              {!isSummarizing && !isApiKeyMissing && (
                <span className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-purple-200/30 to-purple-100/0 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></span>
              )}
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
              <Bookmark className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left group */}
          <div className="flex items-center gap-1">
            {/* AI model selector dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 hover:bg-gray-50 rounded-full p-0.5 transition-colors"
                onClick={toggleModelDropdown}
              >
                <div
                  className={`w-5 h-5 ${currentModel.color} rounded-full flex items-center justify-center shadow-sm`}
                >
                  {currentModel.icon}
                </div>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* AI Model Dropdown */}
              {isModelDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500">选择 AI 模型</div>
                  {models.map((model) => (
                    <button
                      key={model.name}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${selectedModel === model.name ? "bg-gray-50" : ""}`}
                      onClick={() => selectModel(model.name)}
                    >
                      <div className={`w-5 h-5 ${model.color} rounded-full flex items-center justify-center shadow-sm`}>
                        {model.icon}
                      </div>
                      <span>{model.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <Scissors className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <BookOpen className="h-3 w-3" />
            </Button>
          </div>

          {/* Right group */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <Clock className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 bg-purple-500 text-white hover:bg-purple-600 rounded-full shadow-sm"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
          <textarea
            className="w-full resize-none outline-none text-gray-800 placeholder-gray-300 min-h-[40px] text-lg"
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || isApiKeyMissing}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Mic className="h-3.5 w-3.5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-sm font-medium">¼</span>
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-sm">@</span>
              </button>
            </div>
            <button 
              className={`${isLoading || isApiKeyMissing ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 cursor-pointer'} transition-colors`}
              onClick={handleSendMessage}
              disabled={isLoading || isApiKeyMissing}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-sm text-gray-600">基础版</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-purple-400 hover:text-purple-600 hover:bg-gray-50 rounded-full"
          >
            <Gift className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
