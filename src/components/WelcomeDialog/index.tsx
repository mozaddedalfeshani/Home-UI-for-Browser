"use client";

import { useState } from "react";
import { Search, Settings, Brain, Clock, FileText, Plus, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";

interface WelcomeDialogProps {
  open: boolean;
}

export function WelcomeDialog({ open }: WelcomeDialogProps) {
  const { setHasSeenWelcome } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleGetStarted = () => {
    setHasSeenWelcome(true);
  };

  const features = [
    {
      icon: Search,
      title: "দ্রুত অনুসন্ধান",
      description: "কীবোর্ডে '/' চাপুন এবং Google এ অনুসন্ধান করুন বা URL এ যান",
      shortcut: "/"
    },
    {
      icon: Brain,
      title: "AI সহায়তা",
      description: "সেটিংসে AI চালু করে স্মার্ট টেক্সট সাজেশন পান",
      shortcut: "সেটিংস → AI Search"
    },
    {
      icon: Plus,
      title: "ট্যাব যোগ করুন",
      description: "পছন্দের ওয়েবসাইট যোগ করুন এবং কীবোর্ড শর্টকাট সেট করুন",
      shortcut: "+ বোতাম"
    },
    {
      icon: Clock,
      title: "ডিজিটাল ঘড়ি",
      description: "সেটিংসে ঘড়ির রঙ, অবস্থান এবং ফরম্যাট পরিবর্তন করুন",
      shortcut: "সেটিংস → Clock"
    },
    {
      icon: FileText,
      title: "নোটপ্যাড",
      description: "ডান পাশে নোট লিখুন এবং প্রজেক্ট ম্যানেজ করুন",
      shortcut: "ডান সাইডবার"
    },
    {
      icon: Settings,
      title: "কাস্টমাইজেশন",
      description: "থিম, ভাষা, ব্যাকগ্রাউন্ড ইমেজ এবং আরও অনেক কিছু পরিবর্তন করুন",
      shortcut: "নিচে ডান কোণে ⚙️"
    }
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-6xl p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">MCLX Home এ স্বাগতম</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            আপনার ব্যক্তিগত ড্যাশবোর্ড
          </p>
          <p className="text-muted-foreground">
            দ্রুত অনুসন্ধান, AI সহায়তা, এবং আরও অনেক কিছু
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <div className="text-xs bg-muted px-2 py-1 rounded-md mt-1 inline-block">
                        {feature.shortcut}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">🚀 দ্রুত শুরু করুন</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium">কীবোর্ডে '/' চাপুন</p>
                <p className="text-muted-foreground">দ্রুত অনুসন্ধান বা URL এ যান</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium">নিচে ডান কোণে ⚙️ চাপুন</p>
                <p className="text-muted-foreground">সেটিংস খুলুন এবং কাস্টমাইজ করুন</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium">+ বোতামে ক্লিক করুন</p>
                <p className="text-muted-foreground">পছন্দের ওয়েবসাইট যোগ করুন</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <p className="font-medium">AI চালু করুন</p>
                <p className="text-muted-foreground">স্মার্ট টেক্সট সাজেশন পান</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleGetStarted} size="lg" className="gap-2">
            শুরু করুন
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            আপনি যেকোনো সময় সেটিংস থেকে পরিবর্তন করতে পারবেন
          </p>
        </div>
      </div>
    </div>
  );
}
