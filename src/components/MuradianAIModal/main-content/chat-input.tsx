"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Add01Icon, 
  Mic01Icon, 
  ArrowDown01Icon, 
  SentIcon,
  FlashIcon,
  SparklesIcon,
  AiChat02Icon,
  Brain02Icon,
  Cancel01Icon,
  Image01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefObject, KeyboardEvent, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSend: () => void;
  isLoading: boolean;
  isCompact?: boolean;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  isAutoModel: boolean;
  setIsAutoModel: (v: boolean) => void;
  selectedImages: string[];
  setSelectedImages: (v: string[]) => void;
}

const MODELS = [
  { id: "deepseek-v4-flash", label: "Flash", icon: FlashIcon, subtitle: "Speed & Performance" },
  { id: "deepseek-v4-pro", label: "Pro", icon: SparklesIcon, subtitle: "Complex Reasoning" },
  { id: "deepseek-chat", label: "Chat", icon: AiChat02Icon, subtitle: "General Assistant" },
  { id: "deepseek-reasoner", label: "Reasoner", icon: Brain02Icon, subtitle: "Deep Thinking" },
];

export const ChatInput = ({ 
  query, 
  setQuery, 
  inputRef, 
  onSend, 
  isLoading, 
  isCompact,
  selectedModel,
  setSelectedModel,
  isAutoModel,
  setIsAutoModel,
  selectedImages,
  setSelectedImages
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages([...selectedImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 w-full px-4 mb-1">
          {selectedImages.map((img, i) => (
            <div key={i} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-border shadow-sm">
              <img src={img} alt="upload" className="h-full w-full object-cover" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "relative flex items-center w-full bg-zinc-100 dark:bg-zinc-900/50 transition-all px-4 py-2",
        isCompact ? "rounded-full min-h-[56px]" : "rounded-[2rem] min-h-[72px]"
      )}>
        {/* Left Action: Plus Icon -> Image Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          multiple 
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
        >
          <HugeiconsIcon icon={Add01Icon} size={24} />
        </button>

        {/* Textarea: Center */}
        <Textarea
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
          className={cn(
            "flex-1 bg-transparent border-0 shadow-none rounded-none focus-visible:ring-0 resize-none placeholder:text-zinc-500 dark:placeholder:text-zinc-500 h-10 py-2 text-base",
            isCompact ? "min-h-[40px]" : "min-h-[40px]"
          )}
          rows={1}
          disabled={isLoading}
        />
        
        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {/* Model Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500 text-sm font-medium focus:outline-none">
                <span className={cn(isAutoModel && "text-indigo-500")}>
                  {isAutoModel ? "Auto" : currentModel.label}
                </span>
                <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border bg-card">
              <DropdownMenuItem
                onClick={() => setIsAutoModel(true)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                  isAutoModel ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border",
                  isAutoModel ? "border-primary/30 bg-primary/20" : "border-border bg-muted/50"
                )}>
                  <HugeiconsIcon icon={SparklesIcon} size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Auto</span>
                  <span className="text-[10px] text-muted-foreground">Smart switching</span>
                </div>
              </DropdownMenuItem>

              {MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  disabled
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors opacity-50 cursor-not-allowed",
                    (!isAutoModel && selectedModel === model.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border",
                    (!isAutoModel && selectedModel === model.id) ? "border-primary/30 bg-primary/20" : "border-border bg-muted/50"
                  )}>
                    <HugeiconsIcon icon={model.icon} size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{model.label}</span>
                    <span className="text-[10px] text-muted-foreground">{model.subtitle} (Coming Soon)</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
            <HugeiconsIcon icon={Mic01Icon} size={22} />
          </button>

          <Button 
            onClick={onSend}
            size="icon" 
            className={cn(
              "h-10 w-10 rounded-full transition-all shadow-md",
              (query.trim() || selectedImages.length > 0) && !isLoading
                ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed"
            )}
            disabled={(!query.trim() && selectedImages.length === 0) || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <HugeiconsIcon icon={SentIcon} size={20} />
            )}
          </Button>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium text-center">
        AI-generated content may not be accurate.
      </p>
    </div>
  );
};
