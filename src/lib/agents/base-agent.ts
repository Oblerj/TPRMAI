import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import prisma from '@/lib/db'
import type { AgentConfig, AgentName, AgentResult, AgentLogEntry } from './types'

export abstract class BaseAgent {
  protected config: AgentConfig
  protected llm: ChatOpenAI | ChatAnthropic

  constructor(config: AgentConfig) {
    this.config = config
    this.llm = this.initializeLLM()
  }

  private initializeLLM(): ChatOpenAI | ChatAnthropic {
    const useAnthropic = process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY

    if (useAnthropic) {
      return new ChatAnthropic({
        modelName: this.config.model.includes('claude')
          ? this.config.model
          : 'claude-3-sonnet-20240229',
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      })
    }

    return new ChatOpenAI({
      modelName: this.config.model.includes('gpt')
        ? this.config.model
        : 'gpt-4-turbo',
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  }

  protected abstract getSystemPrompt(): string

  protected async invoke(userPrompt: string): Promise<string> {
    const messages = [
      new SystemMessage(this.getSystemPrompt()),
      new HumanMessage(userPrompt),
    ]

    const response = await this.llm.invoke(messages)
    return response.content as string
  }

  protected async invokeWithJSON<T>(userPrompt: string): Promise<T> {
    const jsonPrompt = `${userPrompt}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`

    const response = await this.invoke(jsonPrompt)

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    return JSON.parse(jsonStr.trim()) as T
  }

  protected async logActivity(entry: Omit<AgentLogEntry, 'agentName'>): Promise<void> {
    try {
      await prisma.agentActivityLog.create({
        data: {
          agentName: this.config.name,
          activityType: entry.activityType,
          entityType: entry.entityType,
          entityId: entry.entityId,
          actionTaken: entry.actionTaken,
          inputSummary: entry.inputSummary,
          outputSummary: entry.outputSummary,
          status: entry.status,
          errorMessage: entry.errorMessage,
          processingTimeMs: entry.processingTimeMs,
        },
      })
    } catch (error) {
      console.error(`Failed to log agent activity for ${this.config.name}:`, error)
    }
  }

  protected createResult<T>(
    success: boolean,
    data: T | undefined,
    error: string | undefined,
    startTime: number
  ): AgentResult<T> {
    return {
      success,
      data,
      error,
      agentName: this.config.name,
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date(),
    }
  }

  abstract execute(input: unknown): Promise<AgentResult>
}
