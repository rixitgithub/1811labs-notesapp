import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const { content } = await request.json();

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize the following text in 2-3 sentences:\n\n${content}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing:', error);
    return NextResponse.json({ summary: 'Error generating summary' }, { status: 500 });
  }
}