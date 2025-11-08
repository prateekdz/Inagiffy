# Inagiffy backend (LLM generator scaffold)

This small Express server provides a /generate endpoint that returns a learning roadmap (JSON). It will attempt to call OpenAI if `OPENAI_API_KEY` is set in `.env`. Otherwise it returns a local fallback roadmap.

Setup

1. cd backend
2. npm install
3. Copy `.env.example` to `.env` and add your OpenAI API key (optional)
4. npm start

API

POST /generate
Request body: { topic: string, level?: string }
Response: { root: Node, source: 'llm'|'local' }

Node shape
{
  id: string,
  label: string,
  description?: string,
  resources?: [{title,url}],
  children?: [Node]
}
