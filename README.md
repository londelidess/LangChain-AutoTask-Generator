# AutoTask Generator with Next.js and LangChain

An innovative application, **AutoTask Generator**, utilizes the capabilities of Next.js combined with the LangChain framework to automatically generate a task list, aiding users in achieving their specific objectives. This is achieved through the chaining of multiple language models and text analysis tools.

## Introduction

LangChain is a robust framework devised specifically to chain numerous language models and text analysis tools efficiently. With its integration into the Next.js platform, the **AutoTask Generator** app empowers users to input their goals, and in response, obtain a meticulously curated list of tasks to realize that particular goal.

Furthermore, in building this app, I've extended the original tutorial by incorporating serpAPI, enhancing the project's efficiency and capabilities.

## Usage

1. Navigate to the provided URL.
2. Input your desired goal or objective.
3. Witness the magic as you receive an automatically generated list of tasks to fulfill your aspiration.

## Overcoming Data Limitations with serpAPI

While language models like **GPT-3.5 Turbo** from OpenAI offer a vast repository of knowledge, they inherently possess a "knowledge cutoff", meaning they are unaware of events post their last training date. For **GPT-3.5 Turbo**, the latest known data point was in late 2021, making it unaware of any events or developments after that period.

However, in the **AutoTask Generator**, I've integrated serpAPI to overcome this limitation. serpAPI allows the app to fetch real-time search engine results, thereby bridging the knowledge gap and providing users with up-to-date and relevant task suggestions based on current data. This fusion of static, vast knowledge from the language model and real-time insights from serpAPI creates a comprehensive and efficient task generation system.

## Contribution

Every contribution makes a difference! Whether it's a new feature proposal, bug reporting, or general feedback, I appreciate them all. For specific issues or bugs, feel free to check at [vercel](https://lang-chain-auto-task-generator.vercel.app/).

## Credits

This project has been inspired and made achievable thanks to the insightful tutorial by [フルスタックチャンネル](https://www.youtube.com/watch?v=4L9gLSb4yzU&ab_channel=%E3%83%95%E3%83%AB%E3%82%B9%E3%82%BF%E3%83%83%E3%82%AF%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB). A special word of gratitude to [Yasuharu Kaitori](https://www.linkedin.com/in/haruyasu/) for his valuable insights and guidance.
