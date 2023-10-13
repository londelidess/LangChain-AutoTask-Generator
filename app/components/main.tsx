"use client";

import axios, { CancelTokenSource } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageType, TaskType } from "./types";

const Main = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const objectiveRef = useRef<HTMLTextAreaElement>(null);
  const iterationRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<CancelTokenSource | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Scroll to bottom on initial render
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Set message
  const messageHandler = (message: MessageType) => {
    setMessages((messages) => [...messages, message]);
  };

  // Start
  const startHandler = async () => {
    // Start loading
    setLoading(true);

    // Retrieve the objective
    const objective = objectiveRef.current!.value;

    // Check objective
    if (!objective) {
      setLoading(false);
      return;
    }

    // Set API cancel token
    sourceRef.current = axios.CancelToken.source();

    // Add objective to message
    const messageObjective = { type: "objective", text: objective };
    messageHandler(messageObjective);

    let taskList: TaskType[] = [];

    // Add to task list
    taskList.push({
      taskID: "1",
      taskName: "Please create a list to achieve the objective",
    });

    // Loop counter
    let iteration = 0;
    // Maximum loop count
    const maxIteration = Number(iterationRef.current!.value);

    try {
      // Loop until max iteration
      while (maxIteration === 0 || iteration < maxIteration) {
        // Check task list
        if (taskList.length <= 0) {
          setLoading(false);
          return;
        }

        // Create string from task list
        const taskListString = taskList
          .map((task) => `${task.taskID}. ${task.taskName}`)
          .join("\n");

        // Add task list to message
        const messageTaskList = { type: "task-list", text: taskListString };
        messageHandler(messageTaskList);

        // Retrieve the first task and remove from task list
        const task = taskList.shift()!;

        // Add next task to message
        const messageNextTask = {
          type: "next-task",
          text: `${task.taskID}. ${task.taskName}`,
        };
        messageHandler(messageNextTask);

        // Ask ChatGPT
        const responseExecute = await axios.post(
          "/api/execute",
          {
            objective, // Objective
            task: task.taskName, // Task
          },
          {
            cancelToken: sourceRef.current.token, // Set cancel token
          }
        );

        // Get the answer
        const resultExecute = responseExecute?.data?.response;

        // Add the answer to message
        const messageTaskResult = {
          type: "task-result",
          text: resultExecute.trim(),
        };
        messageHandler(messageTaskResult);

        // Request ChatGPT to create task
        const responseCreate = await axios.post(
          "/api/create",
          {
            objective, // Objective
            taskList, // Task list name
            task, // Last task
            result: resultExecute, // Answer
          },
          {
            cancelToken: sourceRef.current.token, // Set cancel token
          }
        );

        // Update to the new task list
        taskList = responseCreate?.data?.response;

        // Increase loop count
        iteration++;
      }

      // Clear the objective
      objectiveRef.current!.value = "";
    } catch (error) {
      // In case of cancellation
      if (axios.isCancel(error)) {
        console.log("Canceled by the user.");
      }
    } finally {
      setLoading(false);
    }
  };

  // stop

  const stopHandler = () => {
    if (sourceRef.current) {
      sourceRef.current.cancel("Operation canceled by the user.");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 h-[var(--adjusted-height)] mb-5 text-sm border-brown-400 rounded-lg">
        <div className="col-span-1 rounded-s-lg p-3 overflow-y-auto bg-brown-200 border-r">
          {/* task list */}
          <div className="font-bold mb-3">Tasks</div>
          {messages
            .filter((data) => data.type === "task-list")
            .slice(-1)
            .map((data, index) => (
              <div key={index}>
                <div className="leading-relaxed break-words whitespace-pre-wrap">
                  {data.text}
                </div>
              </div>
            ))}
        </div>

        <div className="col-span-3 rounded-e-lg overflow-y-auto bg-white">
          {/* message */}
          {messages.map((data, index) => (
            <div key={index}>
              {data.type === "objective" ? (
                <div className="text-center mb-4 font-bold text-lg border-b py-4 bg-gray-50">
                  <div>🎯{data.text}</div>
                </div>
              ) : data.type === "task-result" ? (
                <div className="flex items-end justify-end mb-4">
                  <div className="bg-brown-500 text-white p-3 rounded-xl drop-shadow max-w-lg mr-4">
                    <div className="leading-relaxed break-words whitespace-pre-wrap">
                      {data.text}
                    </div>
                  </div>
                </div>
              ) : data.type === "next-task" ? (
                <div className="flex items-end mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl drop-shadow max-w-lg ml-4">
                    <div className="leading-relaxed break-words whitespace-pre-wrap">
                      {data.text}
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          ))}

          {/* loading */}
          {loading && (
            <div>
              <div className="flex items-center justify-center my-3">
                <div className="px-5 py-2 text-white bg-brown-500 rounded-full animate-pulse">
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div>
        <div className="mb-3 grid grid-cols-12 gap-3">
          <div className="col-span-1">
            {/* loop counts */}
            <input
              className="w-full border rounded-lg py-2 px-3 focus:outline-none bg-gray-50 focus:bg-white"
              type="number"
              ref={iterationRef}
              id="iteration"
              defaultValue={5}
              disabled={loading}
            />
          </div>
          <div className="col-span-11">
            {/* goal */}
            <textarea
              className="w-full border rounded-lg py-2 px-3 focus:outline-none bg-gray-50 focus:bg-white"
              rows={1}
              placeholder="Your objective..."
              ref={objectiveRef}
              disabled={loading}
              id="objective"
            />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-5">
          {/* start */}
          <button
            className={`p-3 border rounded-lg w-32 text-white font-bold ${
              loading ? "bg-brown-400" : "bg-brown-500"
            }`}
            onClick={startHandler}
            disabled={loading}
          >
            Start
          </button>
          {/* stop */}
          <button
            className={`p-3 border rounded-lg w-32 text-white font-bold ${
              loading ? "bg-red-500" : "bg-brown-400"
            }`}
            onClick={stopHandler}
            disabled={!loading}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
