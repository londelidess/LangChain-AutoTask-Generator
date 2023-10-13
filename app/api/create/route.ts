import { NextRequest, NextResponse } from 'next/server'
import { LLMChain } from 'langchain/chains'
import { TaskType } from '../../components/types'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from 'langchain/prompts'

export async function POST(req: NextRequest) {
  try {
    // Retrieve the objective, task list, last task, result, and task ID
    const { objective, taskList, task, result } = await req.json()

    // OpenAI model
    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.5,
    })

    // Prompt
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'You are an AI task creation agent. You have the following objective: {objective}.'
      ),
      HumanMessagePromptTemplate.fromTemplate(
        'You have the following incomplete tasks: {tasks} and have just executed the following task: {lastTask} and received the following result: {result}. Based on this, create a new task to be completed by your AI system such that your goal is more closely reached or completely reached. Return the result as a numbered list, like: #. First task #. Second task. Always start the task list with the number {nextTaskID}.'
      ),
    ])

    // LLMChain
    const chainCreate = new LLMChain({ llm: chat, prompt: chatPrompt })

    // Create a string from the task list
    const taskNamesString = taskList.map((task: TaskType) => task.taskName).join(', ')

    // Set the next task's ID
    const nextTaskID = (Number(task.taskID) + 1).toString()

    // Execute task generation
    const responseTaskCreate = await chainCreate.call({
      objective,
      tasks: taskNamesString,
      lastTask: task.taskName,
      result,
      nextTaskID,
    })

    // Retrieve the new task
    const resultTaskCreate = responseTaskCreate.text

    const newPrioritizedTaskList = []
    for (const newPrioritizedTask of resultTaskCreate.split('\n')) {
      // Split into task ID and task name
      const taskParts = newPrioritizedTask.trim().split('. ', 2)
      // If both task ID and task name exist
      if (taskParts.length === 2) {
        // Retrieve task ID and task name
        const taskID = taskParts[0].trim()
        const taskName = taskParts[1].trim()
        // Add to the new task list
        newPrioritizedTaskList.push({ taskID, taskName })
      }
    }

    return NextResponse.json({ response: newPrioritizedTaskList })
  } catch (error) {
    console.log('error', error)
    return NextResponse.error()
  }
}
