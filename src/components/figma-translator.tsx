"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { detectSourceLanguage } from "@/ai/flows/detect-source-language";
import { translateText } from "@/ai/flows/translate-text";
import { supportedLanguages } from "@/lib/languages";
import { initialFramesData, type Frame, type TextElement } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Loader2 } from "lucide-react";

// A card representing a single Figma frame
function FrameCard({ frame, isSelected, onSelectionChange }: { frame: Frame; isSelected: boolean; onSelectionChange: (id: string, selected: boolean) => void; }) {
  return (
    <Card className={`transition-all duration-300 ${isSelected ? 'border-primary ring-1 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
        <Checkbox id={`frame-${frame.id}`} checked={isSelected} onCheckedChange={(checked) => onSelectionChange(frame.id, !!checked)} aria-label={`Select frame ${frame.name}`} />
        <Label htmlFor={`frame-${frame.id}`} className="font-semibold text-base cursor-pointer">{frame.name}</Label>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          {frame.texts.map((text) => (
            <p key={text.id} className="text-sm text-muted-foreground bg-secondary/50 rounded-md px-2 py-1.5">
              {text.content}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// The main translator component that orchestrates the UI and logic
export default function FigmaTranslator() {
  const [frames, setFrames] = useState<Frame[]>(initialFramesData);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set());
  const [sourceLanguage, setSourceLanguage] = useState("N/A");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const selectedFrames = useMemo(() => frames.filter(f => selectedFrameIds.has(f.id)), [frames, selectedFrameIds]);
  const textElementCount = useMemo(() => selectedFrames.reduce((acc, frame) => acc + frame.texts.length, 0), [selectedFrames]);

  useEffect(() => {
    if (selectedFrames.length === 0) {
      setSourceLanguage("N/A");
      return;
    }

    const allText = selectedFrames.flatMap(f => f.texts.map(t => t.content)).join("\n");
    if (allText.trim() === "") {
        setSourceLanguage("N/A");
        return;
    }
    
    setSourceLanguage("Detecting...");
    startTransition(async () => {
      try {
        const result = await detectSourceLanguage({ text: allText });
        setSourceLanguage(result.language);
      } catch (error) {
        console.error("Detection failed:", error);
        setSourceLanguage("Detection failed");
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not detect the source language.",
        });
      }
    });
  }, [selectedFrameIds, frames, toast]);

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedFrameIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleTranslate = () => {
    if (!targetLanguage || selectedFrames.length === 0 || sourceLanguage === "N/A" || sourceLanguage.includes("failed")) {
        toast({
            variant: "destructive",
            title: "Translation Error",
            description: "Please select frames and a target language first.",
        });
        return;
    }

    startTransition(async () => {
      try {
        const translations = new Map<string, string>();
        const textElementsToTranslate: (TextElement & { frameId: string })[] = [];

        selectedFrames.forEach(frame => {
          frame.texts.forEach(text => {
            textElementsToTranslate.push({ ...text, frameId: frame.id });
          });
        });

        await Promise.all(
          textElementsToTranslate.map(async (text) => {
            if (!text.content.trim()) return; // Don't translate empty strings
            const result = await translateText({
              text: text.content,
              sourceLanguage,
              targetLanguage: supportedLanguages.find(l => l.code === targetLanguage)?.name || targetLanguage,
            });
            translations.set(text.id, result.translatedText);
          })
        );

        setFrames(prevFrames => 
          prevFrames.map(frame => {
            if (!selectedFrameIds.has(frame.id)) return frame;
            return {
              ...frame,
              texts: frame.texts.map(text => {
                if (translations.has(text.id)) {
                  return { ...text, content: translations.get(text.id)! };
                }
                return text;
              }),
            };
          })
        );
        
        toast({
          title: "Success!",
          description: `Translated ${textElementCount} text elements to ${supportedLanguages.find(l => l.code === targetLanguage)?.name}.`,
        });

      } catch (error) {
        console.error("Translation failed:", error);
        toast({
          variant: "destructive",
          title: "Translation Failed",
          description: "An error occurred during translation. Please try again.",
        });
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Frames ({selectedFrameIds.size})</h2>
        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-4">
            {frames.map(frame => (
              <FrameCard
                key={frame.id}
                frame={frame}
                isSelected={selectedFrameIds.has(frame.id)}
                onSelectionChange={handleSelectionChange}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="lg:sticky top-8 self-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Translator Controls</CardTitle>
            <CardDescription>Configure your translation settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm font-medium">Text Elements Selected</div>
                <div className="text-lg font-bold text-primary">{textElementCount}</div>
            </div>

            <div className="space-y-2">
              <Label>Source Language</Label>
              <div className="flex items-center justify-between p-3 border rounded-lg h-10">
                  <span className="text-sm font-medium text-muted-foreground">{sourceLanguage}</span>
                  {(sourceLanguage === 'Detecting...') && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-language">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isPending}>
                <SelectTrigger id="target-language" className="w-full">
                  <SelectValue placeholder="Choose a language..." />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleTranslate} disabled={isPending || !targetLanguage || selectedFrames.length === 0}>
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating...</>
              ) : (
                <><Languages className="mr-2 h-4 w-4" /> Translate</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
