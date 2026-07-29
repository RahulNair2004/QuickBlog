import ollama from "ollama";

async function main(prompt) {
  try {
    const response = await ollama.chat({
      model: "llama3.1",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response.message.content;
  } catch (error) {
    console.error("Ollama Error:", error);
    return "Local AI model not running. Please start Ollama.";
  }
}

export default main;
