'use server';

/**
 * @fileOverview A flow for detecting the source language of a given text.
 *
 * - detectSourceLanguage - A function that detects the source language of the input text.
 * - DetectSourceLanguageInput - The input type for the detectSourceLanguage function.
 * - DetectSourceLanguageOutput - The return type for the detectSourceLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectSourceLanguageInputSchema = z.object({
  text: z.string().describe('The text to detect the language from.'),
});
export type DetectSourceLanguageInput = z.infer<
  typeof DetectSourceLanguageInputSchema
>;

const DetectSourceLanguageOutputSchema = z.object({
  language: z.string().describe('The detected language of the text.'),
});
export type DetectSourceLanguageOutput = z.infer<
  typeof DetectSourceLanguageOutputSchema
>;

export async function detectSourceLanguage(
  input: DetectSourceLanguageInput
): Promise<DetectSourceLanguageOutput> {
  return detectSourceLanguageFlow(input);
}

const detectSourceLanguagePrompt = ai.definePrompt({
  name: 'detectSourceLanguagePrompt',
  input: {schema: DetectSourceLanguageInputSchema},
  output: {schema: DetectSourceLanguageOutputSchema},
  prompt: `What language is the following text written in? Respond with only the language name.\n\nText: {{{text}}}`,
});

const detectSourceLanguageFlow = ai.defineFlow(
  {
    name: 'detectSourceLanguageFlow',
    inputSchema: DetectSourceLanguageInputSchema,
    outputSchema: DetectSourceLanguageOutputSchema,
  },
  async input => {
    const {output} = await detectSourceLanguagePrompt(input);
    return output!;
  }
);
