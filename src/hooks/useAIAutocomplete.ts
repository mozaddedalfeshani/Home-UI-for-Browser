"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAIAutocompleteProps {
  enabled: boolean;
  input: string;
  onSuggestionAccept: (suggestion: string) => void;
}

interface AIState {
  isLoading: boolean;
  isModelLoading: boolean;
  suggestion: string;
  error: string | null;
}

export const useAIAutocomplete = ({ enabled, input, onSuggestionAccept }: UseAIAutocompleteProps) => {
  const [state, setState] = useState<AIState>({
    isLoading: false,
    isModelLoading: false,
    suggestion: "",
    error: null,
  });

  const modelRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize model when enabled
  useEffect(() => {
    if (!enabled || modelRef.current) return;

    const initializeModel = async () => {
      setState(prev => ({ ...prev, isModelLoading: true, error: null }));
      
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('AI features only work in browser');
        }

        // Dynamic import to ensure client-side only loading
        const { pipeline } = await import("@xenova/transformers");
        
        // Use a lightweight model for text generation
        const model = await pipeline("text-generation", "Xenova/distilgpt2", {
          quantized: true, // Use quantized model for better performance
        });
        
        modelRef.current = model;
        setState(prev => ({ ...prev, isModelLoading: false }));
      } catch (error) {
        console.error("Failed to load AI model:", error);
        setState(prev => ({ 
          ...prev, 
          isModelLoading: false, 
          error: "Failed to load AI model" 
        }));
      }
    };

    initializeModel();
  }, [enabled]);


  // Generate suggestions with debouncing
  const generateSuggestion = useCallback(async (text: string) => {
    if (!text.trim()) {
      setState(prev => ({ ...prev, suggestion: "", isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Only use AI model if available
      if (modelRef.current) {
        // Generate continuation of the text
        const result = await modelRef.current(text, {
          max_length: text.length + 10, // Generate up to 10 more characters
          num_return_sequences: 1,
          temperature: 0.7,
          do_sample: true,
          pad_token_id: 50256, // GPT-2 pad token
        });

        if (result && result.length > 0) {
          const generatedText = result[0].generated_text;
          const fullSuggestion = generatedText.slice(text.length).trim();
          
          // Extract only the first word from the suggestion
          const firstWord = fullSuggestion.split(/\s+/)[0];
          
          // Only show suggestion if it's a meaningful single word (2-15 characters)
          if (firstWord && firstWord.length >= 2 && firstWord.length <= 15) {
            setState(prev => ({ ...prev, suggestion: firstWord, isLoading: false }));
            return;
          }
        }
      }
      
      // No fallback - only AI suggestions
      setState(prev => ({ ...prev, suggestion: "", isLoading: false }));
    } catch (error) {
      console.error("Error generating suggestion:", error);
      setState(prev => ({ 
        ...prev, 
        suggestion: "", 
        isLoading: false,
        error: "Failed to generate suggestion"
      }));
    }
  }, []);

  // Debounced suggestion generation
  useEffect(() => {
    if (!enabled || !input.trim()) {
      setState(prev => ({ ...prev, suggestion: "", isLoading: false }));
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      generateSuggestion(input);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, input, generateSuggestion]);

  // Accept suggestion
  const acceptSuggestion = useCallback(() => {
    if (state.suggestion) {
      onSuggestionAccept(state.suggestion);
      setState(prev => ({ ...prev, suggestion: "" }));
    }
  }, [state.suggestion, onSuggestionAccept]);

  // Clear suggestion
  const clearSuggestion = useCallback(() => {
    setState(prev => ({ ...prev, suggestion: "" }));
  }, []);

  return {
    ...state,
    acceptSuggestion,
    clearSuggestion,
  };
};
