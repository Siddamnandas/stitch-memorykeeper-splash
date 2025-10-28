import React from 'react';
import { Bot, Lightbulb, HelpCircle, User, MessageSquare } from 'lucide-react';
import { AgentHint, AgentScaffolding, AgentType } from '../lib/adaptiveAgentTypes';
import { useState, useEffect } from 'react';

interface AdaptiveAgentDisplayProps {
  hint?: AgentHint;
  scaffolding?: AgentScaffolding;
  agentMessage?: string;
  agentType?: AgentType;
  isVisible: boolean;
  onDismiss: () => void;
  onRequestHint: () => void;
}

const AdaptiveAgentDisplay: React.FC<AdaptiveAgentDisplayProps> = ({
  hint,
  scaffolding,
  agentMessage,
  agentType = 'coach',
  isVisible,
  onDismiss,
  onRequestHint
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Delay showing content for a smooth animation
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Get agent icon based on agent type
  const getAgentIcon = () => {
    switch (agentType) {
      case 'encourager': return <Bot className="w-6 h-6 text-pink-500" />;
      case 'instructor': return <Lightbulb className="w-6 h-6 text-blue-500" />;
      case 'coach': return <HelpCircle className="w-6 h-6 text-green-500" />;
      case 'mentor': return <User className="w-6 h-6 text-purple-500" />;
      default: return <Bot className="w-6 h-6 text-orange-500" />;
    }
  };

  // Get agent name based on agent type
  const getAgentName = () => {
    switch (agentType) {
      case 'encourager': return 'Helper';
      case 'instructor': return 'Guide';
      case 'coach': return 'Coach';
      case 'mentor': return 'Mentor';
      default: return 'Agent';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-100 overflow-hidden max-w-md mx-auto">
        {/* Agent header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-amber-100">
          <div className="flex items-center gap-2">
            {getAgentIcon()}
            <span className="font-bold text-gray-800">{getAgentName()}</span>
          </div>
          <button 
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Agent content */}
        <div className="p-4">
          {showContent && (
            <div className="animate-fadeIn">
              {/* Agent message */}
              {agentMessage && (
                <div className="mb-3">
                  <p className="text-gray-700">{agentMessage}</p>
                </div>
              )}

              {/* Hint content */}
              {hint && (
                <div className="mb-3 p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800">{hint.content}</p>
                  </div>
                </div>
              )}

              {/* Scaffolding content */}
              {scaffolding && (
                <div className="mb-3 p-3 bg-green-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 whitespace-pre-line">{scaffolding.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onRequestHint}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium text-sm shadow hover:shadow-md transition-all"
                >
                  Need Help?
                </button>
                <button
                  onClick={onDismiss}
                  className="py-2 px-3 bg-white border border-orange-200 text-orange-600 rounded-xl font-medium text-sm shadow hover:bg-orange-50 transition-all"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveAgentDisplay;