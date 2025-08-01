import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Save, Lightbulb, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, projectsAPI } from '../services/api';

const GenerateIdeas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Buildsy AI, your project idea assistant. I'm here to help you discover amazing project ideas that match your skills and interests. What kind of project are you thinking about building?",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('general');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState('');
  const [savedProject, setSavedProject] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const conversationMessages = [...messages, userMessage];
      const response = await chatAPI.sendConversation(
        conversationMessages.map(msg => ({ role: msg.role, content: msg.content })),
        context
      );

      if (response.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setLastAIResponse(response.data.response);
        
        // Check if AI suggests saving the idea
        if (response.data.response.toLowerCase().includes('save this project') || 
            response.data.response.toLowerCase().includes('would you like me to help you save')) {
          setTimeout(() => setShowSaveModal(true), 1000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm Buildsy AI, your project idea assistant. I'm here to help you discover amazing project ideas that match your skills and interests. What kind of project are you thinking about building?",
        timestamp: new Date().toISOString()
      }
    ]);
    setLastAIResponse('');
  };

  const extractProjectDetails = (aiResponse) => {
    // Simple extraction logic - in a real app, you might use more sophisticated parsing
    const lines = aiResponse.split('\n');
    let projectName = '';
    let description = '';
    let techStack = [];
    let features = [];
    let difficulty = 'intermediate';
    let duration = '';
    let category = '';

    // Try to extract project name (usually in first few lines or after "Project:" or similar)
    for (const line of lines) {
      if (line.toLowerCase().includes('project:') || line.toLowerCase().includes('idea:')) {
        projectName = line.split(':')[1]?.trim() || '';
        break;
      }
    }

    // If no explicit project name found, try to infer from content
    if (!projectName) {
      const firstSentence = aiResponse.split('.')[0];
      if (firstSentence.length < 100) {
        projectName = firstSentence.trim();
      }
    }

    // Extract tech stack
    const techRegex = /(?:technologies?|tech stack|using|built with):?\s*([^\n]+)/i;
    const techMatch = aiResponse.match(techRegex);
    if (techMatch) {
      techStack = techMatch[1].split(/[,&]/).map(tech => tech.trim()).filter(Boolean);
    }

    // Extract features
    const featureLines = lines.filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('•') || 
      line.toLowerCase().includes('feature')
    );
    features = featureLines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

    // Extract difficulty
    if (aiResponse.toLowerCase().includes('beginner')) difficulty = 'beginner';
    else if (aiResponse.toLowerCase().includes('advanced')) difficulty = 'advanced';

    // Extract duration
    const durationRegex = /(?:duration|time|takes?):?\s*([^\n]+)/i;
    const durationMatch = aiResponse.match(durationRegex);
    if (durationMatch) {
      duration = durationMatch[1].trim();
    }

    // Extract category
    if (aiResponse.toLowerCase().includes('web')) category = 'Web Development';
    else if (aiResponse.toLowerCase().includes('mobile')) category = 'Mobile Development';
    else if (aiResponse.toLowerCase().includes('game')) category = 'Game Development';
    else if (aiResponse.toLowerCase().includes('ai') || aiResponse.toLowerCase().includes('machine learning')) category = 'AI/ML';
    else category = 'Software Development';

    return {
      name: projectName || 'New Project Idea',
      description: description || aiResponse.substring(0, 500),
      tech_stack: techStack,
      features: features,
      difficulty,
      estimated_duration: duration || 'Not specified',
      category
    };
  };

  const saveProjectIdea = async (projectData) => {
    try {
      const response = await projectsAPI.create(projectData);
      
      if (response.success) {
        setSavedProject(response.data);
        setShowSaveModal(false);
        // Show success message
        const successMessage = {
          role: 'assistant',
          content: `Great! I've saved your project idea "${response.data.name}" to your dashboard. You can view and manage it anytime from your dashboard.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Lightbulb className="w-8 h-8 text-indigo-600 mr-3" />
                Generate Project Ideas
              </h1>
              <p className="mt-2 text-gray-600">
                Chat with AI to discover your next amazing project
              </p>
            </div>
            
            <div className="flex space-x-2">
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="general">General Ideas</option>
                <option value="refinement">Refine Ideas</option>
                <option value="technology">Tech Recommendations</option>
                <option value="features">Feature Brainstorming</option>
                <option value="timeline">Timeline Planning</option>
              </select>
              
              <button
                onClick={clearChat}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  
                  {/* Message */}
                  <div className={`px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-3xl">
                  <div className="mr-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Save This Project Idea?
              </h3>
              <p className="text-gray-600 mb-6">
                Would you like to save this project idea to your dashboard for future reference?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const projectData = extractProjectDetails(lastAIResponse);
                    saveProjectIdea(projectData);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Idea
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateIdeas;
