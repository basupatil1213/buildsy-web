import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Save, Lightbulb, RefreshCw, Plus } from 'lucide-react';
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
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
    
    // Check if user is responding positively to save suggestion
    const isPositiveResponse = newMessage.toLowerCase().match(/^(yes|y|yeah|yep|sure|ok|okay|absolutely|definitely|save it|save|let's do it)$/i);
    const lastMessage = messages[messages.length - 1];
    const isAISaveSuggestion = lastMessage?.role === 'assistant' && 
      (lastMessage.content.toLowerCase().includes('save this project') || 
       lastMessage.content.toLowerCase().includes('would you like me to help you save') ||
       lastMessage.content.toLowerCase().includes('would you like to save this'));

    // If user says yes to save suggestion, show the preview modal with better extraction
    if (isPositiveResponse && isAISaveSuggestion) {
      setNewMessage('');
      // Extract from the entire conversation for better project details
      const allAIResponses = messages
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content)
        .join('\n\n');
      const projectData = extractProjectDetails(allAIResponses);
      setPreviewProject(projectData);
      setShowPreviewModal(true);
      return;
    }

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
        
        // Show create button after meaningful conversation (3+ exchanges with substantial AI responses)
        const conversationLength = messages.length + 1; // +1 for the current message
        const hasSubstantialContent = response.data.response.length > 200 && 
          (response.data.response.toLowerCase().includes('project') || 
           response.data.response.toLowerCase().includes('app') || 
           response.data.response.toLowerCase().includes('build') ||
           response.data.response.toLowerCase().includes('develop'));
        
        if (conversationLength >= 4 && hasSubstantialContent) {
          setShowCreateButton(true);
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
    const lines = aiResponse.split('\n');
    let projectName = '';
    let description = '';
    let techStack = [];
    let features = [];
    let difficulty = 'intermediate';
    let duration = '';
    let category = '';

    // Extract project name - look for title patterns
    const titlePatterns = [
      /(?:project|idea|app|application|platform):\s*([^\n]+)/i,
      /^#\s*([^\n]+)/m,
      /"([^"]+)"/,
      /build\s+(?:a|an)?\s*([A-Z][^.,!?]+)/i
    ];
    
    for (let pattern of titlePatterns) {
      const match = aiResponse.match(pattern);
      if (match && match[1] && match[1].length < 80) {
        projectName = match[1].trim().replace(/[*#]/g, '');
        break;
      }
    }

    // Extract clean project description - avoid chat responses
    const descriptionPatterns = [
      /(?:description|about|overview|summary):\s*([^\n]+(?:\n(?!(?:tech|feature|time|duration|difficult):)[^\n]+)*)/i,
      /^([A-Z][^.!?]*(?:app|application|platform|system|tool|website|service)[^.!?]*[.!?])/m
    ];

    for (let pattern of descriptionPatterns) {
      const match = aiResponse.match(pattern);
      if (match && match[1]) {
        description = match[1]
          .replace(/\n+/g, ' ')
          .replace(/[*#-]/g, '')
          .replace(/^(Here's|I suggest|Let me|How about|Consider)/i, '')
          .trim();
        if (description.length > 20 && description.length < 400) break;
      }
    }

    // If no structured description, create a clean one
    if (!description) {
      // Look for the main project concept, avoiding conversational text
      const cleanLines = lines
        .map(line => line.trim())
        .filter(line => 
          line.length > 30 && 
          !line.toLowerCase().includes('happy coding') &&
          !line.toLowerCase().includes('feel free') &&
          !line.toLowerCase().includes('let me know') &&
          !line.toLowerCase().includes('if you') &&
          !line.startsWith('Here') &&
          !line.startsWith('I suggest')
        );

      if (cleanLines.length > 0) {
        description = cleanLines[0].replace(/[*#-]/g, '').trim();
      }
    }

    // Extract tech stack
    const techPatterns = [
      /(?:technologies?|tech stack|using|built with|tools?):\s*([^\n]+)/i,
      /(?:frontend|backend|database):\s*([^\n]+)/i
    ];

    for (let pattern of techPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        const techs = match[1]
          .split(/[,&+\n]/)
          .map(tech => tech.trim().replace(/[*-]/g, ''))
          .filter(tech => tech && tech.length > 1 && tech.length < 30)
          .slice(0, 8);
        techStack = [...techStack, ...techs];
      }
    }

    // Remove duplicates and clean
    techStack = [...new Set(techStack)];

    // Extract features from structured lists
    const featurePatterns = [
      /(?:features?|functionality|capabilities?):\s*((?:[-•*]\s*[^\n]+\n?)+)/i,
      /(?:includes?|will have):\s*((?:[-•*]\s*[^\n]+\n?)+)/i
    ];

    for (let pattern of featurePatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        const newFeatures = match[1]
          .split('\n')
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(feature => feature && feature.length > 5 && feature.length < 100)
          .slice(0, 8);
        features = [...features, ...newFeatures];
      }
    }

    // Extract difficulty
    const content = aiResponse.toLowerCase();
    if (content.includes('beginner') || content.includes('simple') || content.includes('easy')) {
      difficulty = 'beginner';
    } else if (content.includes('advanced') || content.includes('complex') || content.includes('expert')) {
      difficulty = 'advanced';
    }

    // Extract duration
    const durationPatterns = [
      /(?:duration|timeline|time|takes?):\s*([^\n]+)/i,
      /(?:complete in|build in|takes about)\s*([^\n.,]+)/i
    ];

    for (let pattern of durationPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        duration = match[1].trim().replace(/[.*]/g, '');
        break;
      }
    }

    // Extract category based on keywords
    if (content.includes('web') || content.includes('website') || content.includes('react') || content.includes('vue')) {
      category = 'Web Development';
    } else if (content.includes('mobile') || content.includes('ios') || content.includes('android') || content.includes('react native')) {
      category = 'Mobile Development';
    } else if (content.includes('game') || content.includes('unity') || content.includes('gaming')) {
      category = 'Game Development';
    } else if (content.includes('ai') || content.includes('machine learning') || content.includes('ml')) {
      category = 'AI/ML';
    } else if (content.includes('data') || content.includes('analytics') || content.includes('dashboard')) {
      category = 'Data Science';
    } else {
      category = 'Software Development';
    }

    // Fallbacks and validation
    if (!projectName) {
      projectName = 'Untitled Project';
    }

    if (!description) {
      description = `A ${difficulty} level ${category.toLowerCase()} project.`;
    }

    // Clean and validate final data
    return {
      name: projectName.substring(0, 100),
      description: description.substring(0, 1000),
      tech_stack: techStack.slice(0, 10),
      features: features.slice(0, 10),
      difficulty,
      estimated_duration: duration || 'To be determined',
      category
    };
  };

  const saveProjectIdea = async (projectData) => {
    try {
      // Validate project data before saving
      const validatedData = validateProjectData(projectData);
      
      console.log('[GenerateIdeas] Sending project data:', validatedData);
      
      const response = await projectsAPI.create(validatedData);
      
      if (response.success) {
        setSavedProject(response.data);
        setShowPreviewModal(false);
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
      console.error('Error response:', error.response?.data);
      alert(`Failed to save project: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle Create Project button click
  const handleCreateProject = () => {
    // Combine all AI responses to get comprehensive project details
    const allAIResponses = messages
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content)
      .join('\n\n');
    
    console.log('[GenerateIdeas] Extracting from full conversation:', allAIResponses);
    const projectData = extractProjectDetails(allAIResponses);
    setPreviewProject(projectData);
    setShowPreviewModal(true);
  };

  // Handle preview project field changes
  const handlePreviewChange = (field, value) => {
    setPreviewProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes (tech_stack, features)
  const handleArrayFieldChange = (field, index, value) => {
    setPreviewProject(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Add item to array fields
  const addArrayItem = (field) => {
    setPreviewProject(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove item from array fields
  const removeArrayItem = (field, index) => {
    setPreviewProject(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Validate and clean project data before saving
  const validateProjectData = (data) => {
    const validated = { ...data };
    
    // Clean project name
    if (validated.name) {
      validated.name = validated.name
        .replace(/^(Project|Idea|App|Application):\s*/i, '')
        .replace(/[*#]/g, '')
        .trim();
    }
    
    // Clean description - remove conversational elements
    if (validated.description) {
      validated.description = validated.description
        .replace(/^(Here's|I suggest|Let me|How about|Consider|You could build)/i, '')
        .replace(/^(This is|This would be|It could be)/i, '')
        .replace(/[*#]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // If description is too conversational or empty, create a clean one
      const conversationalPhrases = [
        'happy coding',
        'feel free',
        'let me know',
        'if you need',
        'would you like',
        'excited to see'
      ];
      
      const hasConversationalText = conversationalPhrases.some(phrase => 
        validated.description.toLowerCase().includes(phrase)
      );
      
      if (hasConversationalText || validated.description.length < 20) {
        validated.description = `A ${validated.difficulty || 'intermediate'} level ${validated.category?.toLowerCase() || 'software development'} project.`;
      }
    }
    
    // Ensure tech_stack is an array and clean it
    if (validated.tech_stack && !Array.isArray(validated.tech_stack)) {
      validated.tech_stack = [validated.tech_stack];
    }
    validated.tech_stack = (validated.tech_stack || [])
      .filter(tech => tech && typeof tech === 'string' && tech.trim())
      .map(tech => tech.trim())
      .slice(0, 10);
    
    // Ensure features is an array and clean it
    if (validated.features && !Array.isArray(validated.features)) {
      validated.features = [validated.features];
    }
    validated.features = (validated.features || [])
      .filter(feature => feature && typeof feature === 'string' && feature.trim())
      .map(feature => feature.trim())
      .slice(0, 10);
    
    // Validate required fields
    if (!validated.name || validated.name.length < 3) {
      validated.name = 'Untitled Project';
    }
    
    if (!validated.description || validated.description.length < 10) {
      validated.description = `A ${validated.difficulty || 'intermediate'} level project idea.`;
    }
    
    if (!validated.category) {
      validated.category = 'Other';
    }
    
    if (!validated.difficulty) {
      validated.difficulty = 'intermediate';
    } else {
      // Ensure difficulty is lowercase for backend validation
      validated.difficulty = validated.difficulty.toLowerCase();
    }
    
    if (!validated.estimated_duration) {
      validated.estimated_duration = 'To be determined';
    }
    
    return validated;
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

            {/* Create Project Button - Below Chat Input */}
            {showCreateButton && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Project
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Ready to turn your idea into a project?
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Project Preview Modal */}
        {showPreviewModal && previewProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Preview Your Project
                </h3>
                <p className="text-gray-600 mb-6">
                  Review and edit your project details before saving to your dashboard.
                </p>

                <div className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={previewProject.name || ''}
                      onChange={(e) => handlePreviewChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter project name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={previewProject.description || ''}
                      onChange={(e) => handlePreviewChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe your project"
                    />
                  </div>

                  {/* Category & Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={previewProject.category || ''}
                        onChange={(e) => handlePreviewChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Game Development">Game Development</option>
                        <option value="DevOps">DevOps</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="API Development">API Development</option>
                        <option value="Blockchain">Blockchain</option>
                        <option value="IoT">IoT</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={previewProject.difficulty || ''}
                        onChange={(e) => handlePreviewChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={previewProject.estimated_duration || ''}
                      onChange={(e) => handlePreviewChange('estimated_duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 2-3 weeks, 1 month"
                    />
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technology Stack
                    </label>
                    <div className="space-y-2">
                      {previewProject.tech_stack && previewProject.tech_stack.map((tech, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tech}
                            onChange={(e) => handleArrayFieldChange('tech_stack', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Technology name"
                          />
                          <button
                            onClick={() => removeArrayItem('tech_stack', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem('tech_stack')}
                        className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm"
                      >
                        + Add Technology
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    <div className="space-y-2">
                      {previewProject.features && previewProject.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleArrayFieldChange('features', index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Feature description"
                          />
                          <button
                            onClick={() => removeArrayItem('features', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem('features')}
                        className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveProjectIdea(previewProject)}
                    disabled={!previewProject.name || !previewProject.description}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
