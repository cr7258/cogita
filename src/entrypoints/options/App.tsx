"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Menu,
  PanelLeftIcon as SidebarRight,
  Languages,
  Command,
  Keyboard,
  Mail,
  HelpCircle,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveApiKey, getApiKeys, ApiKeys } from "@/lib/storage"

export default function App() {
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})
  const [apiKeys, setApiKeys] = useState<ApiKeys>({})
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: boolean }>({})

  const aiProviders = [
    {
      name: "OpenAI",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.051 6.051 0 0 0 6.0572-4.2218 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7378-7.0569z" />
        </svg>
      ),
    },
    {
      name: "DeepSeek",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5V7l-10 5-10-5v10z" />
        </svg>
      ),
    },
    {
      name: "Tongyi",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      ),
    },
    {
      name: "Groq",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      ),
    },
    {
      name: "Ollama",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5V7.5c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z" />
        </svg>
      ),
    },
    {
      name: "Google (Gemini)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ),
    },
    {
      name: "Anthropic (Claude)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      ),
    },
  ]

  // Load saved API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      const keys = await getApiKeys()
      setApiKeys(keys)
      
      // Initialize input values with saved keys
      const initialInputs: { [key: string]: string } = {}
      Object.entries(keys).forEach(([provider, key]) => {
        initialInputs[provider] = key
      })
      setInputValues(initialInputs)
    }
    
    loadApiKeys()
  }, [])
  
  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKey((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }))
  }
  
  const handleInputChange = (provider: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [provider]: value,
    }))
  }
  
  const handleSaveApiKey = async (provider: string) => {
    try {
      const apiKey = inputValues[provider]?.trim()
      if (!apiKey) return
      
      await saveApiKey(provider, apiKey)
      
      // Update local state
      setApiKeys((prev) => ({
        ...prev,
        [provider]: apiKey,
      }))
      
      // Show success indicator
      setSaveStatus((prev) => ({
        ...prev,
        [provider]: true,
      }))
      
      // Hide success indicator after 2 seconds
      setTimeout(() => {
        setSaveStatus((prev) => ({
          ...prev,
          [provider]: false,
        }))
      }, 2000)
    } catch (error) {
      console.error(`Error saving ${provider} API key:`, error)
    }
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <button onClick={handleGoBack} className="text-gray-500 hover:text-gray-700">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold">Sider</span>
          </div>
        </div>
        <nav className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-purple-600 bg-purple-50 rounded-lg">
            <Settings className="w-5 h-5" />
            <span>通用配置</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <SidebarRight className="w-5 h-5" />
            <span>侧边栏</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Menu className="w-5 h-5" />
            <span>智能菜单</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Languages className="w-5 h-5" />
            <span>翻译</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Command className="w-5 h-5" />
            <span>提示词</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Keyboard className="w-5 h-5" />
            <span>键盘快捷键</span>
          </button>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 p-2 border-t bg-white">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5" />
            <span>联系我们</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <HelpCircle className="w-5 h-5" />
            <span>帮助中心</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-8">通用配置</h1>

          {/* Account Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">账户</h2>
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="font-medium">Seven Cheng</div>
                    <div className="text-sm text-gray-500">chengzw258@gmail.com</div>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  退出登录
                </button>
              </div>
            </div>
          </section>

          {/* AI Access Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">AI 访问</h2>
              <select className="px-3 py-1.5 bg-white border rounded-lg text-sm">
                <option>自定义API密钥</option>
              </select>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500 mb-6">您的API密钥存储在本地浏览器中，绝不会发送到其他地方。</p>
              <div className="space-y-4">
                {aiProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-700">{provider.icon}</div>
                      <span>{provider.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type={showApiKey[provider.name] ? "text" : "password"}
                          placeholder={`输入 ${provider.name} API 密钥`}
                          className="w-64 pr-10"
                          value={inputValues[provider.name] || ""}
                          onChange={(e) => handleInputChange(provider.name, e.target.value)}
                        />
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => toggleApiKeyVisibility(provider.name)}
                        >
                          {showApiKey[provider.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSaveApiKey(provider.name)}
                        className="relative"
                      >
                        {saveStatus[provider.name] ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            已保存
                          </span>
                        ) : (
                          "设置"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">外观</h2>
            <div className="bg-white rounded-xl p-4 border space-y-4">
              <div className="flex items-center justify-between">
                <span>显示模式</span>
                <select className="px-3 py-1.5 bg-white border rounded-lg text-sm">
                  <option>自动</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>显示语言</span>
                <select className="px-3 py-1.5 bg-white border rounded-lg text-sm">
                  <option>简体中文</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
